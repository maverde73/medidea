import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import {
  CreateAttivitaSchema,
  AttivitaFiltersSchema,
} from "@/lib/validators/attivita";
import { ZodError } from "zod";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/attivita
 * List attività with optional filters
 * Requires authentication
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const { searchParams } = new URL(request.url);

    // Convert URLSearchParams to object
    const params = Object.fromEntries(searchParams.entries());

    // Validate and parse filters
    const filters = AttivitaFiltersSchema.parse(params);

    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    // Build WHERE clause based on filters
    const whereClauses: string[] = [];
    const whereParams: any[] = [];

    if (filters.id_cliente) {
      whereClauses.push("id_cliente = ?");
      whereParams.push(filters.id_cliente);
    }

    if (filters.stato) {
      whereClauses.push("stato = ?");
      whereParams.push(filters.stato);
    }

    if (filters.data_apertura_da) {
      whereClauses.push("data_apertura_richiesta >= ?");
      whereParams.push(filters.data_apertura_da);
    }

    if (filters.data_apertura_a) {
      whereClauses.push("data_apertura_richiesta <= ?");
      whereParams.push(filters.data_apertura_a);
    }

    if (filters.data_chiusura_da) {
      whereClauses.push("data_chiusura >= ?");
      whereParams.push(filters.data_chiusura_da);
    }

    if (filters.data_chiusura_a) {
      whereClauses.push("data_chiusura <= ?");
      whereParams.push(filters.data_chiusura_a);
    }

    if (filters.modello) {
      whereClauses.push("modello LIKE ?");
      whereParams.push(`%${filters.modello}%`);
    }

    if (filters.descrizione_richiesta) {
      whereClauses.push("descrizione_richiesta LIKE ?");
      whereParams.push(`%${filters.descrizione_richiesta}%`);
    }

    if (filters.seriale) {
      whereClauses.push("seriale LIKE ?");
      whereParams.push(`%${filters.seriale}%`);
    }

    if (filters.tecnico) {
      whereClauses.push("tecnico LIKE ?");
      whereParams.push(`%${filters.tecnico}%`);
    }

    if (filters.urgenza) {
      whereClauses.push("urgenza = ?");
      whereParams.push(filters.urgenza);
    }

    const whereClause = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    // Get total count
    const countResult = await db.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count FROM attivita ${whereClause}`,
      whereParams
    );

    const total = countResult?.count || 0;

    // Get paginated results
    const offset = (filters.page - 1) * filters.limit;
    const orderClause = `ORDER BY ${filters.sort_by} ${filters.sort_order}`;

    const attivita = await db.query(
      `SELECT * FROM attivita ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
      [...whereParams, filters.limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: attivita,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        total_pages: Math.ceil(total / filters.limit),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Filtri non validi",
          details: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        },
        { status: 400 }
      );
    }

    console.error("Error listing attività:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero delle attività",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});

/**
 * POST /api/attivita
 * Create a new attività
 * Requires authentication
 */
export const POST = withAuth(async (request, { user }) => {
  try {
    const body = await request.json();

    // Validate input with Zod
    const validatedData = CreateAttivitaSchema.parse(body);

    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    // Check if cliente exists
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

    // Auto-create equipment if model is provided and it doesn't exist
    if (validatedData.modello) {
      // Check if equipment exists for this client with same model and serial (if provided)
      let equipmentQuery = "SELECT id FROM apparecchiature WHERE id_cliente = ? AND modello = ?";
      const equipmentParams: any[] = [validatedData.id_cliente, validatedData.modello];

      if (validatedData.seriale) {
        equipmentQuery += " AND seriale = ?";
        equipmentParams.push(validatedData.seriale);
      } else {
        // If no serial provided, check for equipment with null serial
        equipmentQuery += " AND seriale IS NULL";
      }

      const existingEquipment = await db.queryFirst(equipmentQuery, equipmentParams);

      if (!existingEquipment) {
        // Create new equipment
        await db.execute(
          `INSERT INTO apparecchiature (
            id_cliente, modello, seriale, created_at, updated_at
          ) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
          [
            validatedData.id_cliente,
            validatedData.modello,
            validatedData.seriale || null,
          ]
        );
      }
    }

    // Insert new attività
    const result = await db.execute(
      `INSERT INTO attivita (
        id_cliente, modello, seriale, codice_inventario_cliente,
        modalita_apertura_richiesta, data_apertura_richiesta, descrizione_richiesta,
        numero_preventivo, data_preventivo,
        numero_accettazione_preventivo, data_accettazione_preventivo,
        note_generali, data_presa_in_carico, reparto, tecnico, urgenza,
        stato, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APERTO', datetime('now'), datetime('now'))`,
      [
        validatedData.id_cliente,
        validatedData.modello || null,
        validatedData.seriale || null,
        validatedData.codice_inventario_cliente || null,
        validatedData.modalita_apertura_richiesta || null,
        validatedData.data_apertura_richiesta || null,
        validatedData.descrizione_richiesta || null,
        validatedData.numero_preventivo || null,
        validatedData.data_preventivo || null,
        validatedData.numero_accettazione_preventivo || null,
        validatedData.data_accettazione_preventivo || null,
        validatedData.note_generali || null,
        validatedData.data_presa_in_carico || null,
        validatedData.reparto || null,
        validatedData.tecnico || null,
        validatedData.urgenza || null,
      ]
    );

    // Fetch the created attività
    const attivita = await db.queryFirst(
      "SELECT * FROM attivita WHERE id = ?",
      [result.meta.last_row_id]
    );

    return NextResponse.json(
      {
        success: true,
        data: attivita,
        message: "Attività creata con successo",
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

    console.error("Error creating attività:", error);
    return NextResponse.json(
      {
        error: "Errore nella creazione dell'attività",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
