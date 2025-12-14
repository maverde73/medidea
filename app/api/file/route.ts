import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";
import { z } from "zod";

const QuerySchema = z.object({
    tipo_riferimento: z.enum(["attivita", "apparecchiatura", "intervento"]),
    id_riferimento: z.string().regex(/^\d+$/).transform(Number),
});

export const GET = withAuth(async (request, { user }) => {
    try {
        const { searchParams } = new URL(request.url);
        const params = Object.fromEntries(searchParams.entries());

        const validation = QuerySchema.safeParse(params);

        if (!validation.success) {
            return NextResponse.json(
                { error: "Parametri non validi", details: validation.error.issues },
                { status: 400 }
            );
        }

        const { tipo_riferimento, id_riferimento } = validation.data;

        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const files = await db.query(
            `SELECT * FROM allegati 
       WHERE tipo_riferimento = ? AND id_riferimento = ?
       ORDER BY created_at DESC`,
            [tipo_riferimento, id_riferimento]
        );

        return NextResponse.json({
            success: true,
            data: files,
        });
    } catch (error) {
        console.error("Error listing files:", error);
        return NextResponse.json(
            { error: "Errore nel recupero dei file" },
            { status: 500 }
        );
    }
});
