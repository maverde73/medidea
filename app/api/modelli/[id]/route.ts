import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const UpdateModelSchema = z.object({
    nome: z.string().min(1, "Il nome è obbligatorio"),
    descrizione: z.string().optional().nullable(),
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
            const validation = UpdateModelSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json(
                    { error: "Dati non validi", details: validation.error.issues },
                    { status: 400 }
                );
            }

            const { nome, descrizione } = validation.data;
            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            // Check if exists (excluding current)
            const existing = await db.queryFirst(
                "SELECT * FROM modelli_apparecchiature WHERE nome = ? AND id != ?",
                [nome, id]
            );

            if (existing) {
                return NextResponse.json(
                    { error: "Esiste già un modello con questo nome" },
                    { status: 409 }
                );
            }

            await db.execute(
                "UPDATE modelli_apparecchiature SET nome = ?, descrizione = ?, updated_at = datetime('now') WHERE id = ?",
                [nome, descrizione || null, id]
            );

            const updated = await db.queryFirst(
                "SELECT * FROM modelli_apparecchiature WHERE id = ?",
                [id]
            );

            return NextResponse.json({
                success: true,
                data: updated,
            });
        } catch (error) {
            console.error("Error updating model:", error);
            return NextResponse.json(
                { error: "Errore nell'aggiornamento del modello" },
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

            // Check if in use
            const usage = await db.queryFirst<{ count: number }>(
                "SELECT COUNT(*) as count FROM apparecchiature WHERE id_modello = ?",
                [id]
            );

            if (usage && usage.count > 0) {
                return NextResponse.json(
                    { error: "Impossibile eliminare: il modello è associato ad una o più apparecchiature." },
                    { status: 409 }
                );
            }

            await db.execute(
                "DELETE FROM modelli_apparecchiature WHERE id = ?",
                [id]
            );

            return NextResponse.json({
                success: true,
                message: "Modello eliminato con successo",
            });
        } catch (error) {
            console.error("Error deleting model:", error);
            return NextResponse.json(
                { error: "Errore nell'eliminazione del modello" },
                { status: 500 }
            );
        }
    }
);
