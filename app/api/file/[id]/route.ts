import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { createStorageClient } from "@/lib/storage";

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
            const storage = createStorageClient(env);

            // Get file info from D1
            const fileInfo = await db.queryFirst(
                "SELECT * FROM allegati WHERE id = ?",
                [id]
            );

            if (!fileInfo) {
                return NextResponse.json({ error: "File non trovato" }, { status: 404 });
            }

            // Delete from R2
            await storage.delete(fileInfo.chiave_r2);

            // Delete from D1
            await db.execute("DELETE FROM allegati WHERE id = ?", [id]);

            return NextResponse.json({
                success: true,
                message: "File eliminato con successo",
            });
        } catch (error) {
            console.error("Error deleting file:", error);
            return NextResponse.json(
                { error: "Errore nell'eliminazione del file" },
                { status: 500 }
            );
        }
    });
