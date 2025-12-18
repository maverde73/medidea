import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const AddApparecchiaturaSchema = z.object({
    id_apparecchiatura: z.number().int().positive(),
    note: z.string().optional(),
});

/**
 * GET /api/attivita/[id]/apparecchiature
 * List all equipment linked to an activity
 */
export const GET = withAuth<{ params: Promise<{ id: string }> }>(
    async (request, { user, params }) => {
        try {
            const { id } = await params;
            const attivitaId = parseInt(id);

            if (isNaN(attivitaId)) {
                return NextResponse.json({ error: "ID non valido" }, { status: 400 });
            }

            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            const apparecchiature = await db.query(
                `SELECT aa.*, a.seriale, m.nome as modello, c.nome as cliente_nome
         FROM attivita_apparecchiature aa
         JOIN apparecchiature a ON aa.id_apparecchiatura = a.id
         JOIN modelli_apparecchiature m ON a.id_modello = m.id
         JOIN clienti c ON a.id_cliente = c.id
         WHERE aa.id_attivita = ?
         ORDER BY m.nome ASC`,
                [attivitaId]
            );

            return NextResponse.json({
                success: true,
                data: apparecchiature,
            });
        } catch (error) {
            console.error("Error fetching activity apparecchiature:", error);
            return NextResponse.json(
                { error: "Errore nel recupero delle apparecchiature" },
                { status: 500 }
            );
        }
    }
);

/**
 * POST /api/attivita/[id]/apparecchiature
 * Add equipment to an activity
 */
export const POST = withAuth<{ params: Promise<{ id: string }> }>(
    async (request, { user, params }) => {
        try {
            const { id } = await params;
            const attivitaId = parseInt(id);

            if (isNaN(attivitaId)) {
                return NextResponse.json({ error: "ID non valido" }, { status: 400 });
            }

            const body = await request.json();
            const validation = AddApparecchiaturaSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json(
                    { error: "Dati non validi", details: validation.error.issues },
                    { status: 400 }
                );
            }

            const { id_apparecchiatura, note } = validation.data;
            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            // Check if attivita exists
            const attivita = await db.queryFirst(
                "SELECT id FROM attivita WHERE id = ?",
                [attivitaId]
            );

            if (!attivita) {
                return NextResponse.json(
                    { error: "Attività non trovata" },
                    { status: 404 }
                );
            }

            // Check if already linked
            const existing = await db.queryFirst(
                "SELECT id FROM attivita_apparecchiature WHERE id_attivita = ? AND id_apparecchiatura = ?",
                [attivitaId, id_apparecchiatura]
            );

            if (existing) {
                return NextResponse.json(
                    { error: "Apparecchiatura già collegata a questa attività" },
                    { status: 409 }
                );
            }

            await db.execute(
                "INSERT INTO attivita_apparecchiature (id_attivita, id_apparecchiatura, note) VALUES (?, ?, ?)",
                [attivitaId, id_apparecchiatura, note || null]
            );

            return NextResponse.json(
                { success: true, message: "Apparecchiatura aggiunta" },
                { status: 201 }
            );
        } catch (error) {
            console.error("Error adding apparecchiatura to activity:", error);
            return NextResponse.json(
                { error: "Errore nell'aggiunta dell'apparecchiatura" },
                { status: 500 }
            );
        }
    }
);

/**
 * DELETE /api/attivita/[id]/apparecchiature
 * Remove equipment from an activity (expects id_apparecchiatura in body)
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
    async (request, { user, params }) => {
        try {
            const { id } = await params;
            const attivitaId = parseInt(id);

            if (isNaN(attivitaId)) {
                return NextResponse.json({ error: "ID non valido" }, { status: 400 });
            }

            const body = await request.json() as { id_apparecchiatura?: number };
            const id_apparecchiatura = body.id_apparecchiatura;

            if (!id_apparecchiatura) {
                return NextResponse.json(
                    { error: "id_apparecchiatura richiesto" },
                    { status: 400 }
                );
            }

            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            await db.execute(
                "DELETE FROM attivita_apparecchiature WHERE id_attivita = ? AND id_apparecchiatura = ?",
                [attivitaId, id_apparecchiatura]
            );

            return NextResponse.json({
                success: true,
                message: "Apparecchiatura rimossa",
            });
        } catch (error) {
            console.error("Error removing apparecchiatura from activity:", error);
            return NextResponse.json(
                { error: "Errore nella rimozione dell'apparecchiatura" },
                { status: 500 }
            );
        }
    }
);
