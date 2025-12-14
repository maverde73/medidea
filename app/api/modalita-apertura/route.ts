import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const CreateModalitaSchema = z.object({
    descrizione: z.string().min(1, "La descrizione è obbligatoria"),
});

export const GET = withAuth(async (request, { user }) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const modalita = await db.query(
            "SELECT * FROM modalita_apertura WHERE active = 1 ORDER BY descrizione ASC"
        );

        return NextResponse.json({
            success: true,
            data: modalita,
        });
    } catch (error) {
        console.error("Error fetching modalita:", error);
        return NextResponse.json(
            { error: "Errore nel recupero delle modalità" },
            { status: 500 }
        );
    }
});

export const POST = withAuth(async (request, { user }) => {
    try {
        const body = await request.json();
        const validation = CreateModalitaSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Dati non validi", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { descrizione } = validation.data;
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        // Check if exists
        const existing = await db.queryFirst(
            "SELECT * FROM modalita_apertura WHERE descrizione = ? AND active = 1",
            [descrizione]
        );

        if (existing) {
            return NextResponse.json(
                { error: "Modalità già esistente" },
                { status: 409 }
            );
        }

        const result = await db.execute(
            "INSERT INTO modalita_apertura (descrizione) VALUES (?)",
            [descrizione]
        );

        const newModalita = await db.queryFirst(
            "SELECT * FROM modalita_apertura WHERE id = ?",
            [result.meta.last_row_id]
        );

        return NextResponse.json({
            success: true,
            data: newModalita,
        }, { status: 201 });
    } catch (error) {
        console.error("Error creating modalita:", error);
        return NextResponse.json(
            { error: "Errore nella creazione della modalità" },
            { status: 500 }
        );
    }
});
