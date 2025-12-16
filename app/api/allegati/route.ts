import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/allegati
 * List attachments for a specific reference
 */
export const GET = withAuth(async (request, { user }) => {
    try {
        const { searchParams } = new URL(request.url);
        const tipoRiferimento = searchParams.get("tipo_riferimento");
        const idRiferimento = searchParams.get("id_riferimento");
        const note = searchParams.get("note"); // Optional filter by category

        if (!tipoRiferimento || !idRiferimento) {
            return NextResponse.json(
                { error: "Parametri mancanti (tipo_riferimento, id_riferimento)" },
                { status: 400 }
            );
        }

        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        let query = `SELECT * FROM allegati WHERE tipo_riferimento = ? AND id_riferimento = ?`;
        const params: any[] = [tipoRiferimento, parseInt(idRiferimento)];

        if (note) {
            query += ` AND note = ?`;
            params.push(note);
        }

        query += ` ORDER BY created_at DESC`;

        const allegati = await db.query(query, params);

        return NextResponse.json({
            success: true,
            data: allegati
        });

    } catch (error) {
        console.error("Error listing attachments:", error);
        return NextResponse.json(
            {
                error: "Errore nel recupero degli allegati",
                message: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        );
    }
});
