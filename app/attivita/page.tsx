"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { AttivitaStatusBadge } from "@/components/ui";

interface Attivita {
  id: number;
  id_cliente: number;
  modello: string | null;
  seriale: string | null;
  stato: string;
  data_apertura_richiesta: string | null;
  data_chiusura: string | null;
  note_generali: string | null;
}

type SortField = 'data_apertura_richiesta' | 'modello' | 'stato' | 'id';
type SortDirection = 'asc' | 'desc';

export default function AttivitaPage() {
  const [attivita, setAttivita] = useState<Attivita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ stato: "", modello: "" });
  const [sortField, setSortField] = useState<SortField>('data_apertura_richiesta');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const router = useRouter();

  useEffect(() => {
    fetchAttivita();
  }, []);

  const fetchAttivita = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();
      if (filter.stato) params.append("stato", filter.stato);
      if (filter.modello) params.append("modello", filter.modello);

      const response = await fetch(`/api/attivita?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data?: Attivita[] };
        setAttivita(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching attivita:", error);
    } finally {
      setLoading(false);
    }
  };

  const sortedAttivita = [...attivita].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    // Handle null values
    if (aVal === null) return sortDirection === 'asc' ? 1 : -1;
    if (bVal === null) return sortDirection === 'asc' ? -1 : 1;

    // Convert to lowercase for string comparison
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();

    if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestione Attività</h1>
          <p className="text-gray-600 mt-1">
            Gestisci e monitora tutte le attività
          </p>
        </div>
        <button
          onClick={() => router.push("/attivita/new")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuova Attività
        </button>
      </div>

      {/* Filters and Sorting Card */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Filter size={20} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">Filtri e Ordinamento</h2>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={filter.stato}
              onChange={(e) => setFilter({ ...filter, stato: e.target.value })}
            >
              <option value="">Tutti gli stati</option>
              <option value="APERTO">Aperto</option>
              <option value="CHIUSO">Chiuso</option>
              <option value="RIAPERTO">Riaperto</option>
            </select>

            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca per modello..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={filter.modello}
                onChange={(e) => setFilter({ ...filter, modello: e.target.value })}
              />
            </div>

            <button
              onClick={fetchAttivita}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Applica Filtri
            </button>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Ordina per:</span>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="data_apertura_richiesta">Data Apertura</option>
              <option value="modello">Modello</option>
              <option value="stato">Stato</option>
              <option value="id">ID</option>
            </select>
            <button
              onClick={toggleSortDirection}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              {sortDirection === 'asc' ? (
                <>
                  <ArrowUp size={16} />
                  Crescente
                </>
              ) : (
                <>
                  <ArrowDown size={16} />
                  Decrescente
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Activities List */}
      <div className="grid gap-4">
        {sortedAttivita.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/attivita/${item.id}`)}
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {item.modello || "N/D"} - {item.seriale || "N/D"}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Cliente ID: {item.id_cliente}
                </p>
                {item.note_generali && (
                  <p className="text-gray-700 text-sm mt-2 line-clamp-2">
                    {item.note_generali}
                  </p>
                )}
                <div className="mt-3 flex gap-4 text-sm text-gray-600">
                  {item.data_apertura_richiesta && (
                    <span>Apertura: {new Date(item.data_apertura_richiesta).toLocaleDateString()}</span>
                  )}
                  {item.data_chiusura && (
                    <span>Chiusura: {new Date(item.data_chiusura).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
              <div className="shrink-0">
                <AttivitaStatusBadge status={item.stato as any} />
              </div>
            </div>
          </div>
        ))}

        {sortedAttivita.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">Nessuna attività trovata</p>
          </div>
        )}
      </div>
    </div>
  );
}
