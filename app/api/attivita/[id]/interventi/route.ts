import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { IdParamSchema } from "@/lib/validators/attivita";
import { CreateInterventoSchema } from "@/lib/validators/interventi";
import { ZodError } from "zod";

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

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const mockInterventi = [
          {
            id: 1,
            id_attivita: attivitaId,
            data_intervento: "2025-01-15T14:30:00Z",
            descrizione_intervento: "Primo intervento di diagnosi",
            operatore: "Mario Rossi",
            created_at: "2025-01-15T14:30:00Z",
            updated_at: "2025-01-15T14:30:00Z",
          },
          {
            id: 2,
            id_attivita: attivitaId,
            data_intervento: "2025-01-16T10:00:00Z",
            descrizione_intervento: "Sostituzione componente difettoso",
            operatore: "Luigi Verdi",
            created_at: "2025-01-16T10:00:00Z",
            updated_at: "2025-01-16T10:00:00Z",
          },
        ];

        return NextResponse.json({
          success: true,
          data: mockInterventi,
          count: mockInterventi.length,
        });
      }

      // Production code would query database here
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      //
      // // Verify attività exists
      // const attivita = await db.queryFirst(
      //   "SELECT id FROM attivita WHERE id = ?",
      //   [attivitaId]
      // );
      //
      // if (!attivita) {
      //   return NextResponse.json(
      //     { error: "Attività non trovata" },
      //     { status: 404 }
      //   );
      // }
      //
      // // Get all interventi for this attività
      // const interventi = await db.query(
      //   "SELECT * FROM interventi_attivita WHERE id_attivita = ? ORDER BY data_intervento DESC",
      //   [attivitaId]
      // );
      //
      // return NextResponse.json({
      //   success: true,
      //   data: interventi,
      //   count: interventi.length,
      // });

      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
      );
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

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const mockIntervento = {
          id: Math.floor(Math.random() * 1000) + 1,
          id_attivita: attivitaId,
          data_intervento: validatedData.data_intervento,
          descrizione_intervento: validatedData.descrizione_intervento || null,
          operatore: validatedData.operatore || user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json(
          {
            success: true,
            data: mockIntervento,
            message: "Intervento creato con successo (mock)",
          },
          { status: 201 }
        );
      }

      // Production code would use transaction here
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      //
      // // Start transaction (D1 supports batch operations for atomic execution)
      // const results = await db.batch([
      //   // 1. Verify attività exists
      //   {
      //     sql: "SELECT id FROM attivita WHERE id = ?",
      //     params: [attivitaId],
      //   },
      //   // 2. Insert new intervento
      //   {
      //     sql: `INSERT INTO interventi_attivita (
      //       id_attivita, data_intervento, descrizione_intervento, operatore
      //     ) VALUES (?, ?, ?, ?)`,
      //     params: [
      //       attivitaId,
      //       validatedData.data_intervento,
      //       validatedData.descrizione_intervento || null,
      //       validatedData.operatore || user.email,
      //     ],
      //   },
      // ]);
      //
      // // Check if attività exists
      // if (!results[0].results || results[0].results.length === 0) {
      //   return NextResponse.json(
      //     { error: "Attività non trovata" },
      //     { status: 404 }
      //   );
      // }
      //
      // // Get the inserted intervento ID
      // const interventoId = results[1].meta.last_row_id;
      //
      // // Fetch the created intervento
      // const intervento = await db.queryFirst(
      //   "SELECT * FROM interventi_attivita WHERE id = ?",
      //   [interventoId]
      // );
      //
      // return NextResponse.json(
      //   {
      //     success: true,
      //     data: intervento,
      //     message: "Intervento creato con successo",
      //   },
      //   { status: 201 }
      // );

      return NextResponse.json(
        { error: "Endpoint not fully implemented" },
        { status: 501 }
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
