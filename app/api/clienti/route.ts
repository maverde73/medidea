import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/clienti
 * List all clienti
 * Requires authentication
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    const clienti = await db.query(
      "SELECT * FROM clienti ORDER BY nome ASC"
    );

    return NextResponse.json({
      success: true,
      data: clienti,
    });
  } catch (error) {
    console.error("Error listing clienti:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero dei clienti",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/clienti
 * Create a new cliente
 * Requires authentication
 */
export const POST = withAuth(async (request, { user }) => {
  try {
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

    const result = await db.execute(
      "INSERT INTO clienti (nome, indirizzo, contatti, created_at, updated_at) VALUES (?, ?, ?, datetime('now'), datetime('now'))",
      [body.nome, body.indirizzo || null, body.contatti || null]
    );

    // Retrieve the created cliente
    const cliente = await db.queryFirst(
      "SELECT * FROM clienti WHERE id = ?",
      [result.lastInsertRowid]
    );

    return NextResponse.json(
      {
        success: true,
        data: cliente,
        message: "Cliente creato con successo",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating cliente:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione del cliente",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
