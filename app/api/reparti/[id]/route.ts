import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const UpdateRepartoSchema = z.object({
    nome: z.string().min(1, "Il nome è obbligatorio"),
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
            const validation = UpdateRepartoSchema.safeParse(body);

            if (!validation.success) {
                return NextResponse.json(
                    { error: "Dati non validi", details: validation.error.issues },
                    { status: 400 }
                );
            }

            const { nome } = validation.data;
            const { env } = getCloudflareContext();
            const db = createDatabaseClient(env);

            // Check if exists (excluding current)
            const existing = await db.queryFirst(
                "SELECT * FROM reparti WHERE nome = ? AND id != ? AND active = 1",
                [nome, id]
            );

            if (existing) {
                return NextResponse.json(
                    { error: "Esiste già un reparto con questo nome" },
                    { status: 409 }
                );
            }

            await db.execute(
                "UPDATE reparti SET nome = ?, updated_at = datetime('now') WHERE id = ?",
                [nome, id]
            );

            const updated = await db.queryFirst(
                "SELECT * FROM reparti WHERE id = ?",
                [id]
            );

            return NextResponse.json({
                success: true,
                data: updated,
            });
        } catch (error) {
            console.error("Error updating reparto:", error);
            return NextResponse.json(
                { error: "Errore nell'aggiornamento del reparto" },
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
                "UPDATE reparti SET active = 0, updated_at = datetime('now') WHERE id = ?",
                [id]
            );

            return NextResponse.json({
                success: true,
                message: "Reparto eliminato con successo",
            });
        } catch (error) {
            console.error("Error deleting reparto:", error);
            return NextResponse.json(
                { error: "Errore nell'eliminazione del reparto" },
                { status: 500 }
            );
        }
    }
);
