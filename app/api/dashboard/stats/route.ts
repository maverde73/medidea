import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

/**
 * GET /api/dashboard/stats
 * Get dashboard statistics
 * Requires authentication
 */
export const GET = withAuth(async (request, { user }) => {
  try {
    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    // Get total counts
    const totalAttivita = await db.queryFirst<{ count: number }>(
      "SELECT COUNT(*) as count FROM attivita"
    );

    const totalAttivitaAperte = await db.queryFirst<{ count: number }>(
      "SELECT COUNT(*) as count FROM attivita WHERE stato = 'APERTO'"
    );

    const totalAttivitaChiuse = await db.queryFirst<{ count: number }>(
      "SELECT COUNT(*) as count FROM attivita WHERE stato = 'CHIUSO'"
    );

    const totalApparecchiature = await db.queryFirst<{ count: number }>(
      "SELECT COUNT(*) as count FROM apparecchiature"
    );

    const totalClienti = await db.queryFirst<{ count: number }>(
      "SELECT COUNT(*) as count FROM clienti"
    );

    // Get activities by month (last 6 months)
    const attivitaByMonth = await db.query<{
      month: string;
      count: number;
    }>(
      `SELECT
        strftime('%Y-%m', data_apertura_richiesta) as month,
        COUNT(*) as count
       FROM attivita
       WHERE data_apertura_richiesta >= date('now', '-6 months')
       GROUP BY month
       ORDER BY month DESC`
    );

    // Get recent activities (last 10)
    const recentActivities = await db.query(
      `SELECT
        a.id,
        a.modello,
        a.seriale,
        a.stato,
        a.data_apertura_richiesta,
        a.data_chiusura,
        c.nome as cliente_nome
       FROM attivita a
       LEFT JOIN clienti c ON a.id_cliente = c.id
       ORDER BY a.data_apertura_richiesta DESC
       LIMIT 10`
    );

    // Get activities by status
    const attivitaByStatus = await db.query<{
      stato: string;
      count: number;
    }>(
      `SELECT stato, COUNT(*) as count
       FROM attivita
       GROUP BY stato`
    );

    return NextResponse.json({
      success: true,
      data: {
        totals: {
          attivita: totalAttivita?.count || 0,
          attivita_aperte: totalAttivitaAperte?.count || 0,
          attivita_chiuse: totalAttivitaChiuse?.count || 0,
          apparecchiature: totalApparecchiature?.count || 0,
          clienti: totalClienti?.count || 0,
        },
        attivita_by_month: attivitaByMonth,
        attivita_by_status: attivitaByStatus,
        recent_activities: recentActivities,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      {
        error: "Errore nel recupero delle statistiche",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
});
