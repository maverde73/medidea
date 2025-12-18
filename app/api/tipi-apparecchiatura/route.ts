import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/tipi-apparecchiatura
 * List all equipment types
 */
export const GET = withAuth(async (request, { user }) => {
    try {
        const { env } = getCloudflareContext();
        const db = createDatabaseClient(env);

        const tipi = await db.query(
            "SELECT * FROM tipi_apparecchiatura ORDER BY ordine ASC"
        );

        return NextResponse.json({
            success: true,
            data: tipi,
        });
    } catch (error) {
        console.error("Error fetching tipi apparecchiatura:", error);
        return NextResponse.json(
            { error: "Errore nel recupero dei tipi apparecchiatura" },
            { status: 500 }
        );
    }
});
