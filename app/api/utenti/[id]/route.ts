import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

/**
 * GET /api/utenti/:id
 * Get a single utente by ID (admin only or self)
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const utenteId = parseInt(id);

      if (isNaN(utenteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      // Only admin or self can view user details
      if (user.role !== "admin" && user.id !== utenteId) {
        return NextResponse.json(
          { error: "Accesso non autorizzato" },
          { status: 403 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      const utente = await db.queryFirst(
        "SELECT id, email, nome, cognome, role, active, last_login, created_at, updated_at FROM utenti WHERE id = ?",
        [utenteId]
      );

      if (!utente) {
        return NextResponse.json(
          { error: "Utente non trovato" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: utente,
      });
    } catch (error) {
      console.error("Error fetching utente:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero dell'utente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/utenti/:id
 * Update an existing utente (admin only)
 * Requires authentication
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const utenteId = parseInt(id);

      if (isNaN(utenteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      // Only admin can update users
      if (user.role !== "admin") {
        return NextResponse.json(
          { error: "Accesso non autorizzato" },
          { status: 403 }
        );
      }

      const body = await request.json() as {
        email?: string;
        password?: string;
        nome?: string;
        cognome?: string;
        role?: string;
        active?: boolean;
      };

      if (!body.email || !body.nome || !body.cognome || !body.role) {
        return NextResponse.json(
          { error: "Email, nome, cognome e ruolo sono obbligatori" },
          { status: 400 }
        );
      }

      if (!["admin", "tecnico", "user"].includes(body.role)) {
        return NextResponse.json(
          { error: "Ruolo non valido" },
          { status: 400 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Check if utente exists
      const exists = await db.queryFirst(
        "SELECT id FROM utenti WHERE id = ?",
        [utenteId]
      );

      if (!exists) {
        return NextResponse.json(
          { error: "Utente non trovato" },
          { status: 404 }
        );
      }

      // Check if email is already in use by another user
      const emailExists = await db.queryFirst<{ id: number }>(
        "SELECT id FROM utenti WHERE email = ? AND id != ?",
        [body.email, utenteId]
      );

      if (emailExists) {
        return NextResponse.json(
          { error: "Email già in uso" },
          { status: 409 }
        );
      }

      // If password is provided, hash it
      let updateQuery: string;
      let updateParams: any[];

      if (body.password) {
        const password_hash = await hashPassword(body.password);
        updateQuery = `UPDATE utenti SET
          email = ?,
          password_hash = ?,
          nome = ?,
          cognome = ?,
          role = ?,
          active = ?,
          updated_at = datetime('now')
          WHERE id = ?`;
        updateParams = [
          body.email,
          password_hash,
          body.nome,
          body.cognome,
          body.role,
          body.active !== false ? 1 : 0,
          utenteId
        ];
      } else {
        updateQuery = `UPDATE utenti SET
          email = ?,
          nome = ?,
          cognome = ?,
          role = ?,
          active = ?,
          updated_at = datetime('now')
          WHERE id = ?`;
        updateParams = [
          body.email,
          body.nome,
          body.cognome,
          body.role,
          body.active !== false ? 1 : 0,
          utenteId
        ];
      }

      await db.execute(updateQuery, updateParams);

      // Retrieve updated utente
      const utente = await db.queryFirst(
        "SELECT id, email, nome, cognome, role, active, created_at, updated_at FROM utenti WHERE id = ?",
        [utenteId]
      );

      return NextResponse.json({
        success: true,
        data: utente,
        message: "Utente aggiornato con successo",
      });
    } catch (error) {
      console.error("Error updating utente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'aggiornamento dell'utente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/utenti/:id
 * Delete an utente (admin only)
 * Requires authentication
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const utenteId = parseInt(id);

      if (isNaN(utenteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      // Only admin can delete users
      if (user.role !== "admin") {
        return NextResponse.json(
          { error: "Accesso non autorizzato" },
          { status: 403 }
        );
      }

      // Prevent deleting yourself
      if (user.id === utenteId) {
        return NextResponse.json(
          { error: "Non puoi eliminare il tuo account" },
          { status: 400 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Check if utente exists
      const utente = await db.queryFirst(
        "SELECT id FROM utenti WHERE id = ?",
        [utenteId]
      );

      if (!utente) {
        return NextResponse.json(
          { error: "Utente non trovato" },
          { status: 404 }
        );
      }

      // Delete utente
      await db.execute(
        "DELETE FROM utenti WHERE id = ?",
        [utenteId]
      );

      return NextResponse.json({
        success: true,
        message: "Utente eliminato con successo",
      });
    } catch (error) {
      console.error("Error deleting utente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'eliminazione dell'utente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
