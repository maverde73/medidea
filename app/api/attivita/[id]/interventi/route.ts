import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { IdParamSchema } from "@/lib/validators/attivita";
import { CreateInterventoSchema } from "@/lib/validators/interventi";
import { ZodError } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/attivita/:id/interventi
 * Get all interventi for an attività
 * Requires authentication
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;

      // Validate ID parameter
      const validatedParams = IdParamSchema.parse({ id });
      const attivitaId = parseInt(validatedParams.id);

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Verify attività exists
      const attivita = await db.queryFirst(
        "SELECT id FROM attivita WHERE id = ?",
        [attivitaId]
      );

      if (!attivita) {
        return NextResponse.json(
          { error: "Attività non trovata" },
          { status: 404 }
        );
      }

      // Get all interventi for this attività
      const interventi = await db.query(
        "SELECT * FROM interventi_attivita WHERE id_attivita = ? ORDER BY data_intervento DESC",
        [attivitaId]
      );

      return NextResponse.json({
        success: true,
        data: interventi,
        count: interventi.length,
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "ID non valido",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("Error fetching interventi:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero degli interventi",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * POST /api/attivita/:id/interventi
 * Create a new intervento for an attività
 * Requires authentication
 */
export const POST = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;

      // Validate ID parameter
      const validatedParams = IdParamSchema.parse({ id });
      const attivitaId = parseInt(validatedParams.id);

      const body = await request.json();

      // Validate intervento data
      const validatedData = CreateInterventoSchema.parse(body);

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Verify attività exists
      const attivita = await db.queryFirst(
        "SELECT id FROM attivita WHERE id = ?",
        [attivitaId]
      );

      if (!attivita) {
        return NextResponse.json(
          { error: "Attività non trovata" },
          { status: 404 }
        );
      }

      // Insert new intervento
      const result = await db.execute(
        `INSERT INTO interventi_attivita (
          id_attivita, data_intervento, descrizione_intervento, operatore, created_at, updated_at
        ) VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))`,
        [
          attivitaId,
          validatedData.data_intervento,
          validatedData.descrizione_intervento || null,
          validatedData.operatore || user.email,
        ]
      );

      // Fetch the created intervento
      const intervento = await db.queryFirst(
        "SELECT * FROM interventi_attivita WHERE id = ?",
        [result.lastInsertRowid]
      );

      return NextResponse.json(
        {
          success: true,
          data: intervento,
          message: "Intervento creato con successo",
        },
        { status: 201 }
      );
    } catch (error) {
      if (error instanceof ZodError) {
        return NextResponse.json(
          {
            error: "Dati non validi",
            details: error.issues.map((e) => ({
              field: e.path.join("."),
              message: e.message,
            })),
          },
          { status: 400 }
        );
      }

      console.error("Error creating intervento:", error);
      return NextResponse.json(
        {
          error: "Errore nella creazione dell'intervento",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
