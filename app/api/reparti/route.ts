import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const CreateRepartoSchema = z.object({
    nome: z.string().min(1, "Il nome è obbligatorio"),
});

export const GET = withAuth(async (request, { user }) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const reparti = await db.query(
            "SELECT * FROM reparti ORDER BY nome ASC"
        );

        return NextResponse.json({
            success: true,
            data: reparti,
        });
    } catch (error) {
        console.error("Error fetching reparti:", error);
        return NextResponse.json(
            { error: "Errore nel recupero dei reparti" },
            { status: 500 }
        );
    }
});

export const POST = withAuth(async (request, { user }) => {
    try {
        const body = await request.json();
        const validation = CreateRepartoSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Dati non validi", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { nome } = validation.data;
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        // Check if exists
        const existing = await db.queryFirst(
            "SELECT * FROM reparti WHERE nome = ?",
            [nome]
        );

        if (existing) {
            return NextResponse.json(
                { error: "Reparto già esistente" },
                { status: 409 }
            );
        }

        const result = await db.execute(
            "INSERT INTO reparti (nome) VALUES (?)",
            [nome]
        );

        const newReparto = await db.queryFirst(
            "SELECT * FROM reparti WHERE id = ?",
            [result.meta.last_row_id]
        );

        return NextResponse.json({
            success: true,
            data: newReparto,
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating reparto:", error);
        return NextResponse.json(
            { error: "Errore nella creazione del reparto" },
            { status: 500 }
        );
    }
});
