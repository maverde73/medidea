"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Monitor, Calendar, TrendingUp, Clock } from "lucide-react";

interface DashboardStats {
  totals: {
    attivita: number;
    attivita_aperte: number;
    attivita_chiuse: number;
    apparecchiature: number;
    clienti: number;
  };
  attivita_by_month: {
    month: string;
    count: number;
  }[];
  attivita_by_status: {
    stato: string;
    count: number;
  }[];
  recent_activities: {
    id: number;
    modello: string;
    seriale: string;
    stato: string;
    data_apertura_richiesta: string;
    data_chiusura: string | null;
    cliente_nome: string;
  }[];
}

export default function Home() {
  const router = useRouter();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch dashboard data");
      }

      const result = (await response.json()) as {
        success: boolean;
        data: DashboardStats;
        error?: string;
      };
      if (result.success) {
        setData(result.data);
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Errore nel caricamento dei dati");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatMonth = (monthString: string) => {
    if (!monthString) return "-";
    const [year, month] = monthString.split("-");
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString("it-IT", { month: "long", year: "numeric" });
  };

  const getStatoBadge = (stato: string) => {
    const colors: Record<string, string> = {
      APERTO: "bg-green-100 text-green-800",
      CHIUSO: "bg-gray-100 text-gray-800",
      RIAPERTO: "bg-yellow-100 text-yellow-800",
    };
    return colors[stato] || "bg-gray-100 text-gray-800";
  };

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

  if (!data) return null;

  // Calculate stats for display
  const attivitaMeseCorrente = data.attivita_by_month.length > 0 ? data.attivita_by_month[0].count : 0;
  const meseCorrenteLabel = data.attivita_by_month.length > 0 ? formatMonth(data.attivita_by_month[0].month) : "";

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Panoramica generale del sistema
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-teal-bg flex items-center justify-center">
              <Activity className="text-accent-teal-text" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{data.totals.attivita}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Attività Totali</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">● {data.totals.attivita_aperte} aperte</span>
            <span className="text-gray-600">● {data.totals.attivita_chiuse} chiuse</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-blue-bg flex items-center justify-center">
              <Calendar className="text-accent-blue-text" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{attivitaMeseCorrente}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Attività Mese Corrente</h3>
          <p className="text-xs text-gray-500 capitalize">{meseCorrenteLabel}</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-coral-bg flex items-center justify-center">
              <Monitor className="text-accent-coral-text" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{data.totals.apparecchiature}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Apparecchiature</h3>
          <p className="text-xs text-gray-500">Totale registrate</p>
        </div>
      </div>

      {/* Attività per Mese */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Attività per Mese</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">Mese</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Totale</th>
                </tr>
              </thead>
              <tbody>
                {data.attivita_by_month.map((mese, index) => (
                  <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900 font-medium capitalize">{formatMonth(mese.month)}</td>
                    <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">{mese.count}</td>
                  </tr>
                ))}
                {data.attivita_by_month.length === 0 && (
                  <tr>
                    <td colSpan={2} className="py-4 text-center text-gray-500 text-sm">Nessun dato disponibile</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Attività Recenti */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Clock className="text-gray-600" size={24} />
            <h2 className="text-xl font-semibold text-gray-900">Attività Recenti</h2>
          </div>
        </div>
        <div className="p-6">
          <div className="space-y-3">
            {data.recent_activities.map((attivita) => (
              <div
                key={attivita.id}
                onClick={() => router.push(`/attivita/${attivita.id}`)}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{attivita.modello} <span className="text-gray-500 text-sm">({attivita.cliente_nome})</span></h3>
                  <p className="text-sm text-gray-500">Aperta il {formatDate(attivita.data_apertura_richiesta)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatoBadge(attivita.stato)}`}>
                  {attivita.stato}
                </span>
              </div>
            ))}
            {data.recent_activities.length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">Nessuna attività recente</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
