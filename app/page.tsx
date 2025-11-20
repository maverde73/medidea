"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Activity, Monitor, Calendar, TrendingUp, Clock } from "lucide-react";

interface DashboardStats {
  attivita_totali: number;
  attivita_aperte: number;
  attivita_chiuse: number;
  attivita_mese_corrente: number;
  apparecchiature_totali: number;
  clienti_totali: number;
}

interface AttivitaMensile {
  mese: string;
  totale: number;
  aperte: number;
  chiuse: number;
}

interface AttivitaRecente {
  id: number;
  modello: string;
  stato: string;
  data_apertura_richiesta: string;
}

export default function Home() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    attivita_totali: 0,
    attivita_aperte: 0,
    attivita_chiuse: 0,
    attivita_mese_corrente: 0,
    apparecchiature_totali: 0,
    clienti_totali: 0,
  });
  const [attivitaMensili, setAttivitaMensili] = useState<AttivitaMensile[]>([]);
  const [attivitaRecenti, setAttivitaRecenti] = useState<AttivitaRecente[]>([]);
  const [loading, setLoading] = useState(true);

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

      // Mock data for development
      setStats({
        attivita_totali: 156,
        attivita_aperte: 23,
        attivita_chiuse: 133,
        attivita_mese_corrente: 18,
        apparecchiature_totali: 87,
        clienti_totali: 42,
      });

      setAttivitaMensili([
        { mese: "Novembre 2024", totale: 18, aperte: 5, chiuse: 13 },
        { mese: "Ottobre 2024", totale: 24, aperte: 2, chiuse: 22 },
        { mese: "Settembre 2024", totale: 19, aperte: 1, chiuse: 18 },
        { mese: "Agosto 2024", totale: 15, aperte: 0, chiuse: 15 },
        { mese: "Luglio 2024", totale: 21, aperte: 0, chiuse: 21 },
        { mese: "Giugno 2024", totale: 17, aperte: 0, chiuse: 17 },
      ]);

      setAttivitaRecenti([
        { id: 1, modello: "HP LaserJet Pro", stato: "APERTO", data_apertura_richiesta: "2025-01-15T10:00:00Z" },
        { id: 2, modello: "Canon Pixma", stato: "CHIUSO", data_apertura_richiesta: "2025-01-10T14:30:00Z" },
      ]);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
            <span className="text-2xl font-bold text-gray-900">{stats.attivita_totali}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Attività Totali</h3>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-green-600">● {stats.attivita_aperte} aperte</span>
            <span className="text-gray-600">● {stats.attivita_chiuse} chiuse</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-blue-bg flex items-center justify-center">
              <Calendar className="text-accent-blue-text" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.attivita_mese_corrente}</span>
          </div>
          <h3 className="text-sm font-medium text-gray-600 mb-1">Attività Mese Corrente</h3>
          <p className="text-xs text-gray-500">Novembre 2024</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-accent-coral-bg flex items-center justify-center">
              <Monitor className="text-accent-coral-text" size={24} />
            </div>
            <span className="text-2xl font-bold text-gray-900">{stats.apparecchiature_totali}</span>
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
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Aperte</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">Chiuse</th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">% Chiusura</th>
                </tr>
              </thead>
              <tbody>
                {attivitaMensili.map((mese, index) => {
                  const percentualeChiusura = mese.totale > 0
                    ? Math.round((mese.chiuse / mese.totale) * 100)
                    : 0;
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900 font-medium">{mese.mese}</td>
                      <td className="py-3 px-4 text-sm text-gray-900 text-right font-semibold">{mese.totale}</td>
                      <td className="py-3 px-4 text-sm text-green-600 text-right">{mese.aperte}</td>
                      <td className="py-3 px-4 text-sm text-gray-600 text-right">{mese.chiuse}</td>
                      <td className="py-3 px-4 text-sm text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          percentualeChiusura >= 90 ? 'bg-green-100 text-green-800' :
                          percentualeChiusura >= 70 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {percentualeChiusura}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
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
            {attivitaRecenti.map((attivita) => (
              <div
                key={attivita.id}
                onClick={() => router.push(`/attivita/${attivita.id}`)}
                className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{attivita.modello}</h3>
                  <p className="text-sm text-gray-500">Aperta il {formatDate(attivita.data_apertura_richiesta)}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatoBadge(attivita.stato)}`}>
                  {attivita.stato}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
