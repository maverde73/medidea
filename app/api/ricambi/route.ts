import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const CreateRicambioSchema = z.object({
    codice: z.string().min(1, "Codice obbligatorio"),
    descrizione: z.string().min(1, "Descrizione obbligatoria"),
    prezzo_unitario: z.number().optional(),
});

/**
 * GET /api/ricambi
 * List all spare parts
 */
export const GET = withAuth(async (request, { user }) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const { searchParams } = new URL(request.url);
        const search = searchParams.get("search");

        let query = "SELECT * FROM ricambi";
        const params: any[] = [];

        if (search) {
            query += " WHERE codice LIKE ? OR descrizione LIKE ?";
            params.push(`%${search}%`, `%${search}%`);
        }

        query += " ORDER BY codice ASC";

        const ricambi = await db.query(query, params);

        return NextResponse.json({
            success: true,
            data: ricambi,
        });
    } catch (error) {
        console.error("Error fetching ricambi:", error);
        return NextResponse.json(
            { error: "Errore nel recupero dei ricambi" },
            { status: 500 }
        );
    }
});

/**
 * POST /api/ricambi
 * Create a new spare part
 */
export const POST = withAuth(async (request, { user }) => {
    try {
        const body = await request.json();
        const validation = CreateRicambioSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Dati non validi", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { codice, descrizione, prezzo_unitario } = validation.data;
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        // Check if exists
        const existing = await db.queryFirst(
            "SELECT * FROM ricambi WHERE codice = ?",
            [codice]
        );

        if (existing) {
            return NextResponse.json(
                { error: "Ricambio con questo codice già esistente" },
                { status: 409 }
            );
        }

        const result = await db.execute(
            "INSERT INTO ricambi (codice, descrizione, prezzo_unitario) VALUES (?, ?, ?)",
            [codice, descrizione, prezzo_unitario || null]
        );

        const newRicambio = await db.queryFirst(
            "SELECT * FROM ricambi WHERE id = ?",
            [result.meta.last_row_id]
        );

        return NextResponse.json(
            {
                success: true,
                data: newRicambio,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error creating ricambio:", error);
        return NextResponse.json(
            { error: "Errore nella creazione del ricambio" },
            { status: 500 }
        );
    }
});
