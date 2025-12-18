import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/modalita-intervento
 * List all intervention modalities
 */
export const GET = withAuth(async (request, { user }) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const modalita = await db.query(
            "SELECT * FROM modalita_intervento ORDER BY ordine ASC"
        );

        return NextResponse.json({
            success: true,
            data: modalita,
        });
    } catch (error) {
        console.error("Error fetching modalita intervento:", error);
        return NextResponse.json(
            { error: "Errore nel recupero delle modalità intervento" },
            { status: 500 }
        );
    }
});
