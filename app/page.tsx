"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api-client";
import { ClientHierarchyCard } from "@/components/ui/ClientHierarchyCard";
import { Users, Monitor, Activity, Search } from "lucide-react";

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

interface HierarchyStats {
  total_clients: number;
  total_equipment: number;
  total_activities: number;
}

export default function Home() {
  const [data, setData] = useState<ClientWithEquipment[]>([]);
  const [stats, setStats] = useState<HierarchyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await apiFetch("/api/dashboard/hierarchy");
      const result = await response.json() as {
        success: boolean;
        data: ClientWithEquipment[];
        stats: HierarchyStats;
      };

      if (result.success) {
        setData(result.data);
        setStats(result.stats);
      } else {
        throw new Error("Failed to fetch hierarchy data");
      }
    } catch (error) {
      console.error("Error fetching hierarchy data:", error);
      setError("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  const filteredClients = data.filter(client =>
    client.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Caricamento...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Panoramica clienti, apparecchiature e attività
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total_clients}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Clienti con Apparecchiature</h3>
            <p className="text-xs text-gray-500 mt-1">Totale registrati</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <Monitor className="text-purple-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total_equipment}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Apparecchiature</h3>
            <p className="text-xs text-gray-500 mt-1">Totale registrate</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Activity className="text-green-600" size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">{stats.total_activities}</span>
            </div>
            <h3 className="text-sm font-medium text-gray-600">Attività</h3>
            <p className="text-xs text-gray-500 mt-1">Totale attive</p>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cerca cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Client Hierarchy */}
      <div className="space-y-4">
        {filteredClients.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              {searchTerm
                ? "Nessun cliente trovato con i criteri di ricerca"
                : "Nessun cliente con apparecchiature trovato"}
            </p>
          </div>
        ) : (
          filteredClients.map(client => (
            <ClientHierarchyCard key={client.id} client={client} />
          ))
        )}
      </div>
    </div>
  );
}
