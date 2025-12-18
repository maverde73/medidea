import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const AddRicambioSchema = z.object({
    id_ricambio: z.number().int().positive(),
    quantita: z.number().int().positive().default(1),
    seriale: z.string().optional(),
});

/**
 * GET /api/attivita/[id]/ricambi
 * List all spare parts used in an activity
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

            const ricambi = await db.query(
                `SELECT ar.*, r.codice, r.descrizione, r.prezzo_unitario
         FROM attivita_ricambi ar
         JOIN ricambi r ON ar.id_ricambio = r.id
         WHERE ar.id_attivita = ?
         ORDER BY r.codice ASC`,
                [attivitaId]
            );

            return NextResponse.json({
                success: true,
                data: ricambi,
            });
        } catch (error) {
            console.error("Error fetching activity ricambi:", error);
            return NextResponse.json(
                { error: "Errore nel recupero dei ricambi" },
                { status: 500 }
            );
        }
    }
);

/**
 * POST /api/attivita/[id]/ricambi
 * Add spare part to an activity
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
            const validation = AddRicambioSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json(
                    { error: "Dati non validi", details: validation.error.issues },
                    { status: 400 }
                );
            }

            const { id_ricambio, quantita, seriale } = validation.data;
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

            // Check if ricambio exists
            const ricambio = await db.queryFirst(
                "SELECT id FROM ricambi WHERE id = ?",
                [id_ricambio]
            );

            if (!ricambio) {
                return NextResponse.json(
                    { error: "Ricambio non trovato" },
                    { status: 404 }
                );
            }

            const result = await db.execute(
                "INSERT INTO attivita_ricambi (id_attivita, id_ricambio, quantita, seriale) VALUES (?, ?, ?, ?)",
                [attivitaId, id_ricambio, quantita, seriale || null]
            );

            return NextResponse.json(
                { success: true, message: "Ricambio aggiunto", id: result.meta.last_row_id },
                { status: 201 }
            );
        } catch (error) {
            console.error("Error adding ricambio to activity:", error);
            return NextResponse.json(
                { error: "Errore nell'aggiunta del ricambio" },
                { status: 500 }
            );
        }
    }
);

/**
 * DELETE /api/attivita/[id]/ricambi
 * Remove spare part from an activity (expects id in body)
 */
export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
    async (request, { user, params }) => {
        try {
            const { id } = await params;
            const attivitaId = parseInt(id);

            if (isNaN(attivitaId)) {
                return NextResponse.json({ error: "ID non valido" }, { status: 400 });
            }

            const body = await request.json() as { id?: number };
            const ricambioRowId = body.id; // ID della riga attivita_ricambi

            if (!ricambioRowId) {
                return NextResponse.json(
                    { error: "id riga ricambio richiesto" },
                    { status: 400 }
                );
            }

            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            await db.execute(
                "DELETE FROM attivita_ricambi WHERE id = ? AND id_attivita = ?",
                [ricambioRowId, attivitaId]
            );

            return NextResponse.json({
                success: true,
                message: "Ricambio rimosso",
            });
        } catch (error) {
            console.error("Error removing ricambio from activity:", error);
            return NextResponse.json(
                { error: "Errore nella rimozione del ricambio" },
                { status: 500 }
            );
        }
    }
);
