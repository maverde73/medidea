import { NextResponse } from "next/server";
import { withAuth } from "@/lib/middleware";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDatabaseClient } from "@/lib/db";

interface EquipmentItem {
  id: number;
  modello: string;
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
}

interface EquipmentGroup {
  activity_id: number | null;
  activity_stato: string | null;
  activity_data_apertura: string | null;
  activity_data_chiusura: string | null;
  equipment: EquipmentItem[];
}

interface ClientWithEquipment {
  id: number;
  nome: string;
  indirizzo: string | null;
  contatti: string | null;
  equipment_count: number;
  activities_count: number;
  equipment_groups: EquipmentGroup[];
}

export const GET = withAuth(async (request, { user }) => {
  try {
    const { env } = getCloudflareContext();
    const db = createDatabaseClient(env);

    // Execute query with JOINs to get hierarchical data
    const rawResults = await db.query<any>(`
      SELECT
        c.id, c.nome as client_name, c.indirizzo, c.contatti,
        e.id as equipment_id, e.seriale, e.data_test_funzionali, e.data_test_elettrici, e.note as equipment_note,
        m.nome as equipment_model,
        a.id as activity_id, a.stato, a.data_apertura_richiesta, a.data_chiusura
      FROM clienti c
      INNER JOIN apparecchiature e ON c.id = e.id_cliente
      LEFT JOIN modelli_apparecchiature m ON e.id_modello = m.id
      LEFT JOIN attivita a ON e.id = a.id_apparecchiatura
      WHERE e.id IS NOT NULL
      ORDER BY c.nome ASC, a.id DESC NULLS LAST, e.id ASC
    `);

    // Transform flat results into nested structure
    const clientsMap = new Map<number, ClientWithEquipment>();

    for (const row of rawResults) {
      // Group by client
      if (!clientsMap.has(row.id)) {
        clientsMap.set(row.id, {
          id: row.id,
          nome: row.client_name,
          indirizzo: row.indirizzo,
          contatti: row.contatti,
          equipment_count: 0,
          activities_count: 0,
          equipment_groups: []
        });
      }

      const client = clientsMap.get(row.id)!;

      // Group by activity within client
      let group = client.equipment_groups.find(g => g.activity_id === row.activity_id);
      if (!group) {
        group = {
          activity_id: row.activity_id,
          activity_stato: row.stato,
          activity_data_apertura: row.data_apertura_richiesta,
          activity_data_chiusura: row.data_chiusura,
          equipment: []
        };
        client.equipment_groups.push(group);

        // Count activities (excluding null activity_id)
        if (row.activity_id !== null) {
          client.activities_count++;
        }
      }

      // Add equipment to group (avoid duplicates)
      if (!group.equipment.find(e => e.id === row.equipment_id)) {
        group.equipment.push({
          id: row.equipment_id,
          modello: row.equipment_model,
          seriale: row.seriale,
          data_test_funzionali: row.data_test_funzionali,
          data_test_elettrici: row.data_test_elettrici,
          note: row.equipment_note
        });
        client.equipment_count++;
      }
    }

    const data = Array.from(clientsMap.values());

    // Calculate stats
    const stats = {
      total_clients: data.length,
      total_equipment: data.reduce((sum, c) => sum + c.equipment_count, 0),
      total_activities: data.reduce((sum, c) => sum + c.activities_count, 0)
    };

    return NextResponse.json({
      success: true,
      data,
      stats
    });
  } catch (error) {
    console.error("Error fetching hierarchy data:", error);
    return NextResponse.json(
      { error: "Failed to fetch hierarchy data" },
      { status: 500 }
    );
  }
});
