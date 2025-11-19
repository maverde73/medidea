import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/apparecchiature/:id
 * Get a single apparecchiatura by ID
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const apparecchiaturaId = parseInt(id);

      if (isNaN(apparecchiaturaId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      const apparecchiatura = await db.queryFirst(
        "SELECT * FROM apparecchiature WHERE id = ?",
        [apparecchiaturaId]
      );

      if (!apparecchiatura) {
        return NextResponse.json(
          { error: "Apparecchiatura non trovata" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: apparecchiatura,
      });
    } catch (error) {
      console.error("Error fetching apparecchiatura:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero dell'apparecchiatura",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PUT /api/apparecchiature/:id
 * Update an existing apparecchiatura
 * Requires authentication
 */
export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const apparecchiaturaId = parseInt(id);

      if (isNaN(apparecchiaturaId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

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

      // Check if apparecchiatura exists
      const exists = await db.queryFirst(
        "SELECT id FROM apparecchiature WHERE id = ?",
        [apparecchiaturaId]
      );

      if (!exists) {
        return NextResponse.json(
          { error: "Apparecchiatura non trovata" },
          { status: 404 }
        );
      }

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

      // Update apparecchiatura
      await db.execute(
        `UPDATE apparecchiature SET
        id_cliente = ?,
        modello = ?,
        seriale = ?,
        data_test_funzionali = ?,
        data_test_elettrici = ?,
        note = ?,
        updated_at = datetime('now')
        WHERE id = ?`,
        [
          body.id_cliente,
          body.modello,
          body.seriale || null,
          body.data_test_funzionali || null,
          body.data_test_elettrici || null,
          body.note || null,
          apparecchiaturaId
        ]
      );

      // Retrieve updated apparecchiatura
      const apparecchiatura = await db.queryFirst(
        "SELECT * FROM apparecchiature WHERE id = ?",
        [apparecchiaturaId]
      );

      return NextResponse.json({
        success: true,
        data: apparecchiatura,
        message: "Apparecchiatura aggiornata con successo",
      });
    } catch (error) {
      console.error("Error updating apparecchiatura:", error);
      return NextResponse.json(
        {
          error: "Errore nell'aggiornamento dell'apparecchiatura",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * DELETE /api/apparecchiature/:id
 * Delete an apparecchiatura
 * Requires authentication
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;
      const apparecchiaturaId = parseInt(id);

      if (isNaN(apparecchiaturaId)) {
        return NextResponse.json(
          { error: "ID non valido" },
          { status: 400 }
        );
      }

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Check if apparecchiatura exists
      const apparecchiatura = await db.queryFirst(
        "SELECT id FROM apparecchiature WHERE id = ?",
        [apparecchiaturaId]
      );

      if (!apparecchiatura) {
        return NextResponse.json(
          { error: "Apparecchiatura non trovata" },
          { status: 404 }
        );
      }

      // Delete apparecchiatura
      await db.execute(
        "DELETE FROM apparecchiature WHERE id = ?",
        [apparecchiaturaId]
      );

      return NextResponse.json({
        success: true,
        message: "Apparecchiatura eliminata con successo",
      });
    } catch (error) {
      console.error("Error deleting apparecchiatura:", error);
      return NextResponse.json(
        {
          error: "Errore nell'eliminazione dell'apparecchiatura",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
