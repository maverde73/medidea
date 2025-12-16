import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const CreateModelSchema = z.object({
    nome: z.string().min(1, "Il nome è obbligatorio"),
    descrizione: z.string().optional(),
});

/**
 * GET /api/modelli
 * List all equipment models
 */
export const GET = withAuth(async (request, { user }) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const modelli = await db.query(
            "SELECT * FROM modelli_apparecchiature ORDER BY nome"
        );

        return NextResponse.json({
            success: true,
            data: modelli,
        });
    } catch (error) {
        console.error("Error listing models:", error);
        return NextResponse.json(
            {
                error: "Errore nel recupero dei modelli",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
});

/**
 * POST /api/modelli
 * Create a new equipment model
 */
export const POST = withAuth(async (request, { user }) => {
    try {
        const body = await request.json();
        const validatedData = CreateModelSchema.parse(body);

        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        // Check if model exists
        const existing = await db.queryFirst(
            "SELECT id FROM modelli_apparecchiature WHERE nome = ?",
            [validatedData.nome]
        );

        if (existing) {
            return NextResponse.json(
                { error: "Un modello con questo nome esiste già" },
                { status: 409 }
            );
        }

        const result = await db.query(
            `INSERT INTO modelli_apparecchiature (nome, descrizione, created_at, updated_at)
       VALUES (?, ?, datetime('now'), datetime('now')) RETURNING *`,
            [validatedData.nome, validatedData.descrizione || null]
        );

        return NextResponse.json(
            {
                success: true,
                data: result[0],
                message: "Modello creato con successo",
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    error: "Dati non validi",
                    details: error.issues,
                },
                { status: 400 }
            );
        }

        console.error("Error creating model:", error);
        return NextResponse.json(
            {
                error: "Errore nella creazione del modello",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
});
