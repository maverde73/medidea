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
      whereClauses.push("attivita.id_cliente = ?");
      whereParams.push(filters.id_cliente);
    }

    if (filters.stato) {
      whereClauses.push("attivita.stato = ?");
      whereParams.push(filters.stato);
    }

    if (filters.data_apertura_da) {
      whereClauses.push("attivita.data_apertura_richiesta >= ?");
      whereParams.push(filters.data_apertura_da);
    }

    if (filters.data_apertura_a) {
      whereClauses.push("attivita.data_apertura_richiesta <= ?");
      whereParams.push(filters.data_apertura_a);
    }

    if (filters.data_chiusura_da) {
      whereClauses.push("attivita.data_chiusura >= ?");
      whereParams.push(filters.data_chiusura_da);
    }

    if (filters.data_chiusura_a) {
      whereClauses.push("attivita.data_chiusura <= ?");
      whereParams.push(filters.data_chiusura_a);
    }

    if (filters.modello) {
      whereClauses.push("m.nome LIKE ?");
      whereParams.push(`%${filters.modello}%`);
    }

    if (filters.descrizione_richiesta) {
      whereClauses.push("attivita.descrizione_richiesta LIKE ?");
      whereParams.push(`%${filters.descrizione_richiesta}%`);
    }

    if (filters.seriale) {
      whereClauses.push("e.seriale LIKE ?");
      whereParams.push(`%${filters.seriale}%`);
    }

    if (filters.tecnico) {
      whereClauses.push("attivita.tecnico LIKE ?");
      whereParams.push(`%${filters.tecnico}%`);
    }

    if (filters.urgenza) {
      whereClauses.push("attivita.urgenza = ?");
      whereParams.push(filters.urgenza);
    }

    const whereClause = whereClauses.length > 0
      ? `WHERE ${whereClauses.join(" AND ")}`
      : "";

    // Get total count
    const countResult = await db.queryFirst<{ count: number }>(
      `SELECT COUNT(*) as count 
       FROM attivita 
       LEFT JOIN clienti ON attivita.id_cliente = clienti.id
       LEFT JOIN apparecchiature e ON attivita.id_apparecchiatura = e.id
       LEFT JOIN modelli_apparecchiature m ON e.id_modello = m.id
       ${whereClause}`,
      whereParams
    );

    const total = countResult?.count || 0;

    // Get paginated results
    const offset = (filters.page - 1) * filters.limit;

    // Handle sorting by model name
    let orderBy: string = filters.sort_by;
    if (orderBy === 'modello') orderBy = 'm.nome';
    else orderBy = `attivita.${orderBy}`;

    const orderClause = `ORDER BY ${orderBy} ${filters.sort_order}`;

    const attivita = await db.query(
      `SELECT attivita.id, attivita.id_cliente, attivita.id_apparecchiatura,
              attivita.codice_inventario_cliente, attivita.modalita_apertura_richiesta,
              attivita.data_apertura_richiesta, attivita.numero_preventivo,
              attivita.data_preventivo, attivita.numero_accettazione_preventivo,
              attivita.data_accettazione_preventivo, attivita.stato,
              attivita.data_chiusura, attivita.note_generali,
              attivita.descrizione_richiesta, attivita.data_presa_in_carico,
              attivita.reparto, attivita.tecnico, attivita.id_tecnico,
              attivita.urgenza, attivita.created_at, attivita.updated_at,
              attivita.numero_ddt_cliente, attivita.data_ddt_cliente,
              attivita.numero_ddt_consegna, attivita.data_ddt_consegna,
              clienti.nome as nome_cliente,
              tecnici.nome as nome_tecnico,
              tecnici.cognome as cognome_tecnico,
              m.nome as modello,
              e.seriale as seriale
       FROM attivita
       LEFT JOIN clienti ON attivita.id_cliente = clienti.id
       LEFT JOIN tecnici ON attivita.id_tecnico = tecnici.id
       LEFT JOIN apparecchiature e ON attivita.id_apparecchiatura = e.id
       LEFT JOIN modelli_apparecchiature m ON e.id_modello = m.id
       ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
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

    let id_apparecchiatura = validatedData.id_apparecchiatura;

    // Logic to handle equipment creation or linking
    if (!id_apparecchiatura && validatedData.id_modello) {
      // Check if equipment exists for this client with same model and serial (if provided)
      let equipmentQuery = "SELECT id FROM apparecchiature WHERE id_cliente = ? AND id_modello = ?";
      const equipmentParams: any[] = [validatedData.id_cliente, validatedData.id_modello];

      if (validatedData.seriale) {
        equipmentQuery += " AND seriale = ?";
        equipmentParams.push(validatedData.seriale);
      } else {
        // If no serial provided, check for equipment with null serial
        equipmentQuery += " AND seriale IS NULL";
      }

      const existingEquipment = await db.queryFirst<{ id: number }>(equipmentQuery, equipmentParams);

      if (existingEquipment) {
        id_apparecchiatura = existingEquipment.id;
      } else {
        // Create new equipment
        const result = await db.execute(
          `INSERT INTO apparecchiature (
            id_cliente, id_modello, seriale, created_at, updated_at
          ) VALUES (?, ?, ?, datetime('now'), datetime('now'))`,
          [
            validatedData.id_cliente,
            validatedData.id_modello,
            validatedData.seriale || null,
          ]
        );
        id_apparecchiatura = result.meta.last_row_id;
      }
    }

    const {
      id_cliente,
      codice_inventario_cliente,
      modalita_apertura_richiesta,
      data_apertura_richiesta,
      numero_preventivo,
      data_preventivo,
      numero_accettazione_preventivo,
      data_accettazione_preventivo,
      stato,
      data_chiusura,
      note_generali,
      descrizione_richiesta,
      id_tecnico,
    } = validatedData;

    const resultDb = await db.query(
      `INSERT INTO attivita (
        id_cliente, id_apparecchiatura, codice_inventario_cliente,
        modalita_apertura_richiesta, data_apertura_richiesta,
        numero_preventivo, data_preventivo,
        numero_accettazione_preventivo, data_accettazione_preventivo,
        stato, data_chiusura, note_generali, descrizione_richiesta,
        id_tecnico, tecnico, urgenza, data_presa_in_carico, reparto,
        numero_ddt_cliente, data_ddt_cliente,
        numero_ddt_consegna, data_ddt_consegna,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now')) RETURNING *`,
      [
        id_cliente,
        id_apparecchiatura || null,
        codice_inventario_cliente || null,
        modalita_apertura_richiesta || null,
        data_apertura_richiesta || null,
        numero_preventivo || null,
        data_preventivo || null,
        numero_accettazione_preventivo || null,
        data_accettazione_preventivo || null,
        stato || "APERTO",
        data_chiusura || null,
        note_generali || null,
        descrizione_richiesta || null,
        id_tecnico || null,
        validatedData.tecnico || null,
        validatedData.urgenza || null,
        validatedData.data_presa_in_carico || null,
        validatedData.reparto || null,
        validatedData.numero_ddt_cliente || null,
        validatedData.data_ddt_cliente || null,
        validatedData.numero_ddt_consegna || null,
        validatedData.data_ddt_consegna || null
      ]
    );

    // Fetch the created activity with joins to get model name
    const attivita = await db.queryFirst(
      `SELECT attivita.*, 
              clienti.nome as nome_cliente, 
              tecnici.nome as nome_tecnico, 
              tecnici.cognome as cognome_tecnico,
              m.nome as modello,
              e.seriale as seriale
       FROM attivita 
       LEFT JOIN clienti ON attivita.id_cliente = clienti.id
       LEFT JOIN tecnici ON attivita.id_tecnico = tecnici.id
       LEFT JOIN apparecchiature e ON attivita.id_apparecchiatura = e.id
       LEFT JOIN modelli_apparecchiature m ON e.id_modello = m.id
       WHERE attivita.id = ?`,
      [resultDb[0].id]
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
