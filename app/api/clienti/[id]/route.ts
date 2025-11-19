import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/clienti/:id
 * Get a single cliente by ID
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const clienteId = parseInt(id);

      if (isNaN(clienteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      const cliente = await db.queryFirst(
        "SELECT * FROM clienti WHERE id = ?",
        [clienteId]
      );

      if (!cliente) {
        return NextResponse.json(
          { error: "Cliente non trovato" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: cliente,
      });
    } catch (error) {
      console.error("Error fetching cliente:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero del cliente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/clienti/:id
 * Update an existing cliente
 * Requires authentication
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const clienteId = parseInt(id);

      if (isNaN(clienteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      const body = await request.json() as {
        nome?: string;
        indirizzo?: string;
        contatti?: string;
      };

      if (!body.nome || body.nome.trim() === "") {
        return NextResponse.json(
          { error: "Nome obbligatorio" },
          { status: 400 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Check if cliente exists
      const exists = await db.queryFirst(
        "SELECT id FROM clienti WHERE id = ?",
        [clienteId]
      );

      if (!exists) {
        return NextResponse.json(
          { error: "Cliente non trovato" },
          { status: 404 }
        );
      }

      // Update cliente
      await db.execute(
        "UPDATE clienti SET nome = ?, indirizzo = ?, contatti = ?, updated_at = datetime('now') WHERE id = ?",
        [body.nome, body.indirizzo || null, body.contatti || null, clienteId]
      );

      // Retrieve updated cliente
      const cliente = await db.queryFirst(
        "SELECT * FROM clienti WHERE id = ?",
        [clienteId]
      );

      return NextResponse.json({
        success: true,
        data: cliente,
        message: "Cliente aggiornato con successo",
      });
    } catch (error) {
      console.error("Error updating cliente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'aggiornamento del cliente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/clienti/:id
 * Delete a cliente
 * Requires authentication
 * Check for foreign key constraints (attivita, apparecchiature)
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const clienteId = parseInt(id);

      if (isNaN(clienteId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Check if cliente exists
      const cliente = await db.queryFirst(
        "SELECT id FROM clienti WHERE id = ?",
        [clienteId]
      );

      if (!cliente) {
        return NextResponse.json(
          { error: "Cliente non trovato" },
          { status: 404 }
        );
      }

      // Check for foreign key constraints
      const attivitaCount = await db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM attivita WHERE id_cliente = ?",
        [clienteId]
      );

      const apparecchiaturaCount = await db.queryFirst<{ count: number }>(
        "SELECT COUNT(*) as count FROM apparecchiature WHERE id_cliente = ?",
        [clienteId]
      );

      if ((attivitaCount?.count || 0) > 0 || (apparecchiaturaCount?.count || 0) > 0) {
        return NextResponse.json(
          {
            error: "Impossibile eliminare il cliente",
            message: "Il cliente ha attività o apparecchiature associate"
          },
          { status: 409 }
        );
      }

      // Delete cliente
      await db.execute(
        "DELETE FROM clienti WHERE id = ?",
        [clienteId]
      );

      return NextResponse.json({
        success: true,
        message: "Cliente eliminato con successo",
      });
    } catch (error) {
      console.error("Error deleting cliente:", error);
      return NextResponse.json(
        {
          error: "Errore nell'eliminazione del cliente",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
