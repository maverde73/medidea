import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/tipi-intervento
 * List all intervention types
 */
export const GET = withAuth(async (request, { user }) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const tipi = await db.query(
            "SELECT * FROM tipi_intervento ORDER BY ordine ASC"
        );

        return NextResponse.json({
            success: true,
            data: tipi,
        });
    } catch (error) {
        console.error("Error fetching tipi intervento:", error);
        return NextResponse.json(
            { error: "Errore nel recupero dei tipi intervento" },
            { status: 500 }
        );
    }
});
