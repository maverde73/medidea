import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const UpdateModalitaSchema = z.object({
    descrizione: z.string().min(1, "La descrizione è obbligatoria"),
});

export const PUT = withAuth<{ params: Promise<{ id: string }> }>(
    async (request, { params, user }) => {
        try {
            const { id: idStr } = await params;
            const id = parseInt(idStr);
            if (isNaN(id)) {
                return NextResponse.json({ error: "ID non valido" }, { status: 400 });
            }

            const body = await request.json();
            const validation = UpdateModalitaSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json(
                    { error: "Dati non validi", details: validation.error.issues },
                    { status: 400 }
                );
            }

            const { descrizione } = validation.data;
            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            // Check if exists (excluding current)
            const existing = await db.queryFirst(
                "SELECT * FROM modalita_apertura WHERE descrizione = ? AND id != ? AND active = 1",
                [descrizione, id]
            );

            if (existing) {
                return NextResponse.json(
                    { error: "Esiste già una modalità con questa descrizione" },
                    { status: 409 }
                );
            }

            await db.execute(
                "UPDATE modalita_apertura SET descrizione = ?, updated_at = datetime('now') WHERE id = ?",
                [descrizione, id]
            );

            const updated = await db.queryFirst(
                "SELECT * FROM modalita_apertura WHERE id = ?",
                [id]
            );

            return NextResponse.json({
                success: true,
                data: updated,
            });
        } catch (error) {
            console.error("Error updating modalita:", error);
            return NextResponse.json(
                { error: "Errore nell'aggiornamento della modalità" },
                { status: 500 }
            );
        }
    }
);

export const DELETE = withAuth<{ params: Promise<{ id: string }> }>(
    async (request, { params, user }) => {
        try {
            const { id: idStr } = await params;
            const id = parseInt(idStr);
            if (isNaN(id)) {
                return NextResponse.json({ error: "ID non valido" }, { status: 400 });
            }

            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            // Soft delete
            await db.execute(
                "UPDATE modalita_apertura SET active = 0, updated_at = datetime('now') WHERE id = ?",
                [id]
            );

            return NextResponse.json({
                success: true,
                message: "Modalità eliminata con successo",
            });
        } catch (error) {
            console.error("Error deleting modalita:", error);
            return NextResponse.json(
                { error: "Errore nell'eliminazione della modalità" },
                { status: 500 }
            );
        }
    }
);
