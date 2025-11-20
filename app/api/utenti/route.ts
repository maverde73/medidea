import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { hashPassword } from "@/lib/auth";

/**
 * GET /api/utenti
 * List all utenti (admin only)
 * Requires authentication
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    // Only admin can list users
    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "Accesso non autorizzato" },
        { status: 403 }
      );
    }

    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    const utenti = await db.query(
      "SELECT id, email, nome, cognome, role, active, last_login, created_at, updated_at FROM utenti ORDER BY nome ASC, cognome ASC"
    );

    return NextResponse.json({
      success: true,
      data: utenti,
    });
  } catch (error) {
    console.error("Error listing utenti:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero degli utenti",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/utenti
 * Create a new utente (admin only)
 * Requires authentication
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    // Only admin can create users
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

    if (!body.email || !body.password || !body.nome || !body.cognome || !body.role) {
      return NextResponse.json(
        { error: "Email, password, nome, cognome e ruolo sono obbligatori" },
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

    // Check if email already exists
    const existing = await db.queryFirst(
      "SELECT id FROM utenti WHERE email = ?",
      [body.email]
    );

    if (existing) {
      return NextResponse.json(
        { error: "Email già in uso" },
        { status: 409 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(body.password);

    const result = await db.execute(
      `INSERT INTO utenti
      (email, password_hash, nome, cognome, role, active, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        body.email,
        password_hash,
        body.nome,
        body.cognome,
        body.role,
        body.active !== false ? 1 : 0
      ]
    );

    const utente = await db.queryFirst(
      "SELECT id, email, nome, cognome, role, active, created_at, updated_at FROM utenti WHERE id = ?",
      [result.meta.last_row_id]
    );

    return NextResponse.json(
      {
        success: true,
        data: utente,
        message: "Utente creato con successo",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating utente:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione dell'utente",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
