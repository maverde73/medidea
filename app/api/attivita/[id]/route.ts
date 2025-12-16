import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { UpdateAttivitaSchema, IdParamSchema } from "@/lib/validators/attivita";
import { ZodError } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

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

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      const attivita = await db.queryFirst(
        `SELECT a.*, 
                t.nome || ' ' || t.cognome as tecnico,
                c.nome as cliente_nome
         FROM attivita a
         LEFT JOIN tecnici t ON a.id_tecnico = t.id
         LEFT JOIN clienti c ON a.id_cliente = c.id
         WHERE a.id = ?`,
        [attivitaId]
      );

      if (!attivita) {
        return NextResponse.json(
          { error: "Attività non trovata" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: attivita,
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

      const { env } = getCloudflareContext();
      const db = createDatabaseClient(env);

      // Check if attività exists
      const existingAttivita = await db.queryFirst(
        "SELECT id, id_cliente FROM attivita WHERE id = ?",
        [attivitaId]
      );

      if (!existingAttivita) {
        return NextResponse.json(
          { error: "Attività non trovata" },
          { status: 404 }
        );
      }

      // If updating id_cliente, verify it exists
      if (validatedData.id_cliente) {
        const cliente = await db.queryFirst(
          "SELECT id FROM clienti WHERE id = ?",
          [validatedData.id_cliente]
        );

        if (!cliente) {
          return NextResponse.json(
            { error: "Cliente non trovato" },
            { status: 404 }
          );
        }
      }

      // Handle equipment logic
      let id_apparecchiatura = validatedData.id_apparecchiatura;

      // If id_modello is provided but no id_apparecchiatura, we might need to create or find equipment
      if (!id_apparecchiatura && validatedData.id_modello) {
        const id_cliente = validatedData.id_cliente || existingAttivita.id_cliente;

        // Check if equipment exists for this client with this model and serial
        let query = "SELECT id FROM apparecchiature WHERE id_cliente = ? AND id_modello = ?";
        const params: any[] = [id_cliente, validatedData.id_modello];

        if (validatedData.seriale) {
          query += " AND seriale = ?";
          params.push(validatedData.seriale);
        } else {
          query += " AND seriale IS NULL";
        }

        const existingEquipment = await db.queryFirst(query, params);

        if (existingEquipment) {
          id_apparecchiatura = existingEquipment.id;
        } else {
          // Create new equipment
          const insertResult = await db.execute(
            "INSERT INTO apparecchiature (id_cliente, id_modello, seriale) VALUES (?, ?, ?)",
            [id_cliente, validatedData.id_modello, validatedData.seriale || null]
          );
          id_apparecchiatura = insertResult.meta.last_row_id;
        }
      }

      // Prepare update data
      // Create a copy to avoid mutating the original validatedData if it's used elsewhere (though here it's local)
      // We explicitly cast to any to allow deletion of properties that might be in the type definition but we don't want in the DB update
      const updateData: any = { ...validatedData };

      // Update id_apparecchiatura if we determined a new one
      if (id_apparecchiatura !== undefined) {
        updateData.id_apparecchiatura = id_apparecchiatura;
      }

      // Remove fields that don't exist in the attivita table
      delete updateData.id_modello;
      delete updateData.modello;
      delete updateData.seriale;

      // Check if there's anything left to update
      if (Object.keys(updateData).length === 0) {
        // If we only updated equipment related fields which resulted in no change to attivita columns (e.g. same id_apparecchiatura), 
        // we might still want to return success or just the current state.
        // However, if we calculated a NEW id_apparecchiatura, it should be in updateData.
        // If updateData is empty here, it means no actual columns in 'attivita' are being changed.
        // We can just fetch and return the current state.
      } else {
        // Build update query dynamically
        const updateFields = Object.keys(updateData);
        const updateValues = Object.values(updateData);
        const setClause = updateFields.map((field) => `${field} = ?`).join(", ");

        await db.execute(
          `UPDATE attivita SET ${setClause}, updated_at = datetime('now') WHERE id = ?`,
          [...updateValues, attivitaId]
        );
      }

      // Fetch updated attività
      const updatedAttivita = await db.queryFirst(
        `SELECT a.*, 
                t.nome || ' ' || t.cognome as tecnico,
                c.nome as cliente_nome,
                m.nome as modello,
                e.seriale as seriale
         FROM attivita a
         LEFT JOIN tecnici t ON a.id_tecnico = t.id
         LEFT JOIN clienti c ON a.id_cliente = c.id
         LEFT JOIN apparecchiature e ON a.id_apparecchiatura = e.id
         LEFT JOIN modelli_apparecchiature m ON e.id_modello = m.id
         WHERE a.id = ?`,
        [attivitaId]
      );

      return NextResponse.json({
        success: true,
        data: updatedAttivita,
        message: "Attività aggiornata con successo",
      });
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
