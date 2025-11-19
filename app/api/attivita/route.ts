import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import {
  CreateAttivitaSchema,
  AttivitaFiltersSchema,
} from "@/lib/validators/attivita";
import { ZodError } from "zod";

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

    // In development mode, return mock response
    if (process.env.NODE_ENV === "development") {
      const mockAttivita = [
        {
          id: 1,
          id_cliente: 1,
          modello: "HP LaserJet Pro",
          seriale: "SN001",
          codice_inventario_cliente: "INV001",
          modalita_apertura_richiesta: "Email",
          data_apertura_richiesta: "2025-01-15T10:00:00Z",
          numero_preventivo: "PREV001",
          data_preventivo: "2025-01-16T14:00:00Z",
          numero_accettazione_preventivo: "ACC001",
          data_accettazione_preventivo: "2025-01-17T09:00:00Z",
          stato: "APERTO",
          data_chiusura: null,
          note_generali: "Stampante non funzionante",
          created_at: "2025-01-15T10:00:00Z",
          updated_at: "2025-01-15T10:00:00Z",
        },
        {
          id: 2,
          id_cliente: 1,
          modello: "Canon Pixma",
          seriale: "SN002",
          codice_inventario_cliente: "INV002",
          modalita_apertura_richiesta: "Telefono",
          data_apertura_richiesta: "2025-01-10T14:30:00Z",
          numero_preventivo: null,
          data_preventivo: null,
          numero_accettazione_preventivo: null,
          data_accettazione_preventivo: null,
          stato: "CHIUSO",
          data_chiusura: "2025-01-12T16:00:00Z",
          note_generali: "Riparazione completata",
          created_at: "2025-01-10T14:30:00Z",
          updated_at: "2025-01-12T16:00:00Z",
        },
      ];

      // Apply filters to mock data
      let filtered = mockAttivita;

      if (filters.id_cliente) {
        filtered = filtered.filter((a) => a.id_cliente === filters.id_cliente);
      }

      if (filters.stato) {
        filtered = filtered.filter((a) => a.stato === filters.stato);
      }

      if (filters.modello) {
        filtered = filtered.filter(
          (a) => a.modello && a.modello.toLowerCase().includes(filters.modello!.toLowerCase())
        );
      }

      if (filters.seriale) {
        filtered = filtered.filter(
          (a) => a.seriale && a.seriale.toLowerCase().includes(filters.seriale!.toLowerCase())
        );
      }

      // Pagination
      const total = filtered.length;
      const start = (filters.page - 1) * filters.limit;
      const end = start + filters.limit;
      const paged = filtered.slice(start, end);

      return NextResponse.json({
        success: true,
        data: paged,
        pagination: {
          page: filters.page,
          limit: filters.limit,
          total,
          total_pages: Math.ceil(total / filters.limit),
        },
        filters: {
          applied: Object.keys(params).length > 0,
          ...filters,
        },
      });
    }

    // Production code would query database here
    // const env = process.env as unknown as Env;
    // const db = new DatabaseClient(env.DB);
    //
    // // Build WHERE clause based on filters
    // const whereClauses: string[] = [];
    // const whereParams: any[] = [];
    //
    // if (filters.id_cliente) {
    //   whereClauses.push("id_cliente = ?");
    //   whereParams.push(filters.id_cliente);
    // }
    //
    // if (filters.stato) {
    //   whereClauses.push("stato = ?");
    //   whereParams.push(filters.stato);
    // }
    //
    // if (filters.data_apertura_da) {
    //   whereClauses.push("data_apertura_richiesta >= ?");
    //   whereParams.push(filters.data_apertura_da);
    // }
    //
    // if (filters.data_apertura_a) {
    //   whereClauses.push("data_apertura_richiesta <= ?");
    //   whereParams.push(filters.data_apertura_a);
    // }
    //
    // if (filters.data_chiusura_da) {
    //   whereClauses.push("data_chiusura >= ?");
    //   whereParams.push(filters.data_chiusura_da);
    // }
    //
    // if (filters.data_chiusura_a) {
    //   whereClauses.push("data_chiusura <= ?");
    //   whereParams.push(filters.data_chiusura_a);
    // }
    //
    // if (filters.modello) {
    //   whereClauses.push("modello LIKE ?");
    //   whereParams.push(`%${filters.modello}%`);
    // }
    //
    // if (filters.seriale) {
    //   whereClauses.push("seriale LIKE ?");
    //   whereParams.push(`%${filters.seriale}%`);
    // }
    //
    // const whereClause = whereClauses.length > 0
    //   ? `WHERE ${whereClauses.join(" AND ")}`
    //   : "";
    //
    // // Get total count
    // const countResult = await db.queryFirst<{ count: number }>(
    //   `SELECT COUNT(*) as count FROM attivita ${whereClause}`,
    //   whereParams
    // );
    //
    // const total = countResult?.count || 0;
    //
    // // Get paginated results
    // const offset = (filters.page - 1) * filters.limit;
    // const orderClause = `ORDER BY ${filters.sort_by} ${filters.sort_order}`;
    //
    // const attivita = await db.query(
    //   `SELECT * FROM attivita ${whereClause} ${orderClause} LIMIT ? OFFSET ?`,
    //   [...whereParams, filters.limit, offset]
    // );
    //
    // return NextResponse.json({
    //   success: true,
    //   data: attivita,
    //   pagination: {
    //     page: filters.page,
    //     limit: filters.limit,
    //     total,
    //     total_pages: Math.ceil(total / filters.limit),
    //   },
    // });

    return NextResponse.json(
      { error: "Endpoint not fully implemented" },
      { status: 501 }
    );
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

    // In development mode, return mock response
    if (process.env.NODE_ENV === "development") {
      const mockAttivita = {
        id: Math.floor(Math.random() * 1000) + 1,
        ...validatedData,
        stato: "APERTO",
        data_chiusura: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      return NextResponse.json(
        {
          success: true,
          data: mockAttivita,
          message: "Attività creata con successo (mock)",
        },
        { status: 201 }
      );
    }

    // Production code would query database here
    // const env = process.env as unknown as Env;
    // const db = new DatabaseClient(env.DB);
    //
    // // Check if cliente exists
    // const cliente = await db.queryFirst(
    //   "SELECT id FROM clienti WHERE id = ?",
    //   [validatedData.id_cliente]
    // );
    //
    // if (!cliente) {
    //   return NextResponse.json(
    //     { error: "Cliente non trovato" },
    //     { status: 404 }
    //   );
    // }
    //
    // // Insert new attività
    // const result = await db.execute(
    //   `INSERT INTO attivita (
    //     id_cliente, modello, seriale, codice_inventario_cliente,
    //     modalita_apertura_richiesta, data_apertura_richiesta,
    //     numero_preventivo, data_preventivo,
    //     numero_accettazione_preventivo, data_accettazione_preventivo,
    //     note_generali, stato
    //   ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'APERTO')`,
    //   [
    //     validatedData.id_cliente,
    //     validatedData.modello || null,
    //     validatedData.seriale || null,
    //     validatedData.codice_inventario_cliente || null,
    //     validatedData.modalita_apertura_richiesta || null,
    //     validatedData.data_apertura_richiesta || null,
    //     validatedData.numero_preventivo || null,
    //     validatedData.data_preventivo || null,
    //     validatedData.numero_accettazione_preventivo || null,
    //     validatedData.data_accettazione_preventivo || null,
    //     validatedData.note_generali || null,
    //   ]
    // );
    //
    // // Fetch the created attività
    // const attivita = await db.queryFirst(
    //   "SELECT * FROM attivita WHERE id = ?",
    //   [result.meta.last_row_id]
    // );
    //
    // return NextResponse.json(
    //   {
    //     success: true,
    //     data: attivita,
    //     message: "Attività creata con successo",
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
