import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { UpdateAttivitaSchema, IdParamSchema } from "@/lib/validators/attivita";
import { ZodError } from "zod";

/**
 * GET /api/attivita/:id
 * Get a single attività by ID
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
        const mockAttivita = {
          id: attivitaId,
          id_cliente: 1,
          modello: "Modello Test",
          seriale: "SN123456",
          codice_inventario_cliente: "INV001",
          modalita_apertura_richiesta: "Email",
          data_apertura_richiesta: "2025-01-15T10:00:00Z",
          numero_preventivo: "PREV001",
          data_preventivo: "2025-01-16T14:00:00Z",
          numero_accettazione_preventivo: "ACC001",
          data_accettazione_preventivo: "2025-01-17T09:00:00Z",
          stato: "APERTO",
          data_chiusura: null,
          note_generali: "Note di test",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockAttivita,
        });
      }

      // Production code would query database here
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      //
      // const attivita = await db.queryFirst(
      //   "SELECT * FROM attivita WHERE id = ?",
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
      // return NextResponse.json({
      //   success: true,
      //   data: attivita,
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

      console.error("Error fetching attività:", error);
      return NextResponse.json(
        {
          error: "Errore nel recupero dell'attività",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);

/**
 * PATCH /api/attivita/:id
 * Update an existing attività
 * Requires authentication
 */
export const PATCH = withAuth<{ params: Promise<{ id: string }> }>(
  async (request, { user, params }) => {
    try {
      const { id } = await params;

      // Validate ID parameter
      const validatedParams = IdParamSchema.parse({ id });
      const attivitaId = parseInt(validatedParams.id);

      const body = await request.json();

      // Validate update data with Zod
      const validatedData = UpdateAttivitaSchema.parse(body);

      // Check if there's anything to update
      if (Object.keys(validatedData).length === 0) {
        return NextResponse.json(
          { error: "Nessun campo da aggiornare" },
          { status: 400 }
        );
      }

      // In development mode, return mock response
      if (process.env.NODE_ENV === "development") {
        const mockUpdatedAttivita = {
          id: attivitaId,
          id_cliente: 1,
          modello: "Modello Test",
          seriale: "SN123456",
          ...validatedData,
          updated_at: new Date().toISOString(),
        };

        return NextResponse.json({
          success: true,
          data: mockUpdatedAttivita,
          message: "Attività aggiornata con successo (mock)",
        });
      }

      // Production code would query database here
      // const env = process.env as unknown as Env;
      // const db = new DatabaseClient(env.DB);
      //
      // // Check if attività exists
      // const existingAttivita = await db.queryFirst(
      //   "SELECT id FROM attivita WHERE id = ?",
      //   [attivitaId]
      // );
      //
      // if (!existingAttivita) {
      //   return NextResponse.json(
      //     { error: "Attività non trovata" },
      //     { status: 404 }
      //   );
      // }
      //
      // // If updating id_cliente, verify it exists
      // if (validatedData.id_cliente) {
      //   const cliente = await db.queryFirst(
      //     "SELECT id FROM clienti WHERE id = ?",
      //     [validatedData.id_cliente]
      //   );
      //
      //   if (!cliente) {
      //     return NextResponse.json(
      //       { error: "Cliente non trovato" },
      //       { status: 404 }
      //     );
      //   }
      // }
      //
      // // Build update query dynamically
      // const updateFields = Object.keys(validatedData);
      // const updateValues = Object.values(validatedData);
      // const setClause = updateFields.map((field) => `${field} = ?`).join(", ");
      //
      // await db.execute(
      //   `UPDATE attivita SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
      //   [...updateValues, attivitaId]
      // );
      //
      // // Fetch updated attività
      // const updatedAttivita = await db.queryFirst(
      //   "SELECT * FROM attivita WHERE id = ?",
      //   [attivitaId]
      // );
      //
      // return NextResponse.json({
      //   success: true,
      //   data: updatedAttivita,
      //   message: "Attività aggiornata con successo",
      // });

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

      console.error("Error updating attività:", error);
      return NextResponse.json(
        {
          error: "Errore nell'aggiornamento dell'attività",
          message: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  }
);
