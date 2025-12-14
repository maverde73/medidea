import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { createStorageClient } from "@/lib/storage";

export const GET = withAuth<{ params: Promise<{ id: string }> }>(
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

            // Get file from R2
            const fileObject = await storage.download(fileInfo.chiave_r2);

            if (!fileObject) {
                return NextResponse.json(
                    { error: "File non trovato nello storage" },
                    { status: 404 }
                );
            }

            // Return file stream
            const headers = new Headers();
            headers.set("Content-Type", fileInfo.mime_type || "application/octet-stream");
            headers.set(
                "Content-Disposition",
                `attachment; filename="${fileInfo.nome_file_originale}"`
            );

            return new NextResponse(fileObject.body, {
                headers,
            });
        } catch (error) {
            console.error("Error downloading file:", error);
            return NextResponse.json(
                { error: "Errore nel download del file" },
                { status: 500 }
            );
        }
    });
