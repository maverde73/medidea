import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/apparecchiature
 * List all apparecchiature with optional filters
 * Requires authentication
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const { searchParams } = new URL(request.url);
    const id_cliente = searchParams.get("id_cliente");
    const modello = searchParams.get("modello");

    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    let query = "SELECT * FROM apparecchiature WHERE 1=1";
    const params: any[] = [];

    if (id_cliente) {
      query += " AND id_cliente = ?";
      params.push(parseInt(id_cliente));
    }

    if (modello) {
      query += " AND modello LIKE ?";
      params.push(`%${modello}%`);
    }

    query += " ORDER BY modello ASC";

    const apparecchiature = await db.query(query, params);

    return NextResponse.json({
      success: true,
      data: apparecchiature,
    });
  } catch (error) {
    console.error("Error listing apparecchiature:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero delle apparecchiature",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/apparecchiature
 * Create a new apparecchiatura
 * Requires authentication
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json() as {
      id_cliente?: number;
      modello?: string;
      seriale?: string;
      data_test_funzionali?: string;
      data_test_elettrici?: string;
      note?: string;
    };

    if (!body.id_cliente || !body.modello || body.modello.trim() === "") {
      return NextResponse.json(
        { error: "ID cliente e modello sono obbligatori" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    // Check if cliente exists
    const cliente = await db.queryFirst(
      "SELECT id FROM clienti WHERE id = ?",
      [body.id_cliente]
    );

    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente non trovato" },
        { status: 404 }
      );
    }

    const result = await db.execute(
      `INSERT INTO apparecchiature
      (id_cliente, modello, seriale, data_test_funzionali, data_test_elettrici, note, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
      [
        body.id_cliente,
        body.modello,
        body.seriale || null,
        body.data_test_funzionali || null,
        body.data_test_elettrici || null,
        body.note || null
      ]
    );

    const apparecchiatura = await db.queryFirst(
      "SELECT * FROM apparecchiature WHERE id = ?",
      [result.meta.last_row_id]
    );

    return NextResponse.json(
      {
        success: true,
        data: apparecchiatura,
        message: "Apparecchiatura creata con successo",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating apparecchiatura:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione dell'apparecchiatura",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
