import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const CreateTecnicoSchema = z.object({
    nome: z.string().min(1, "Nome obbligatorio"),
    cognome: z.string().min(1, "Cognome obbligatorio"),
    id_utente: z.number().optional().nullable(),
});

/**
 * GET /api/tecnici
 * List technicians
 */
export const GET = withAuth(async (request) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);
        const url = new URL(request.url);
        const available = url.searchParams.get("available") === "true";
        const currentUserId = url.searchParams.get("current_user_id");

        let query = "SELECT * FROM tecnici";
        const params: any[] = [];

        if (available) {
            if (currentUserId) {
                query += " WHERE id_utente IS NULL OR id_utente = ?";
                params.push(parseInt(currentUserId));
            } else {
                query += " WHERE id_utente IS NULL";
            }
        }

        query += " ORDER BY cognome, nome";

        const tecnici = await db.query(query, params);

        return NextResponse.json(tecnici);
    } catch (error) {
        console.error("Error fetching technicians:", error);
        return NextResponse.json(
            { error: "Errore nel recupero dei tecnici" },
            { status: 500 }
        );
    }
});

/**
 * POST /api/tecnici
 * Create a new technician
 */
export const POST = withAuth(async (request) => {
    try {
        const body = await request.json();
        const result = CreateTecnicoSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Dati non validi", details: result.error.flatten() },
                { status: 400 }
            );
        }

        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const { nome, cognome, id_utente } = result.data;

        // Check if user is already linked
        if (id_utente) {
            const existing = await db.queryFirst(
                "SELECT id FROM tecnici WHERE id_utente = ?",
                [id_utente]
            );
            if (existing) {
                return NextResponse.json(
                    { error: "Utente già associato a un tecnico" },
                    { status: 400 }
                );
            }
        }

        const resultDb = await db.query(
            "INSERT INTO tecnici (nome, cognome, id_utente) VALUES (?, ?, ?) RETURNING *",
            [nome, cognome, id_utente || null]
        );

        return NextResponse.json(resultDb[0], { status: 201 });
    } catch (error) {
        console.error("Error creating technician:", error);
        return NextResponse.json(
            { error: "Errore nella creazione del tecnico" },
            { status: 500 }
        );
    }
});
