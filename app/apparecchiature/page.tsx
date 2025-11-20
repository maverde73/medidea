"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Monitor, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Apparecchiatura {
  id: number;
  id_cliente: number;
  modello: string;
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
}

type SortField = 'modello' | 'seriale' | 'data_test_funzionali' | 'data_test_elettrici' | 'id';
type SortDirection = 'asc' | 'desc';

export default function ApparecchiaturePage() {
  const [apparecchiature, setApparecchiature] = useState<Apparecchiatura[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('modello');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();

  useEffect(() => {
    fetchApparecchiature();
  }, []);

  const fetchApparecchiature = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/apparecchiature", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data?: Apparecchiatura[] };
        setApparecchiature(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching apparecchiature:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredApparecchiature = apparecchiature.filter((item) =>
    item.modello.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.seriale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.note?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedApparecchiature = [...filteredApparecchiature].sort((a, b) => {
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
          <h1 className="text-3xl font-bold text-gray-900">Gestione Apparecchiature</h1>
          <p className="text-gray-600 mt-1">
            Gestisci e monitora tutte le apparecchiature
          </p>
        </div>
        <button
          onClick={() => router.push("/apparecchiature/new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuova Apparecchiatura
        </button>
      </div>

      {/* Search and Sorting */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
        <div className="flex items-center gap-2 mb-3">
          <Search size={20} className="text-gray-600" />
          <h2 className="font-semibold text-gray-900">Ricerca e Ordinamento</h2>
        </div>
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cerca per modello, seriale o note..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <ArrowUpDown size={18} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Ordina per:</span>
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="modello">Modello</option>
              <option value="seriale">Seriale</option>
              <option value="data_test_funzionali">Test Funzionali</option>
              <option value="data_test_elettrici">Test Elettrici</option>
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

      {/* Equipment List */}
      <div className="grid gap-4">
        {sortedApparecchiature.map((item) => (
          <div
            key={item.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/apparecchiature/${item.id}`)}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Monitor size={24} className="text-purple-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">{item.modello}</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Seriale: {item.seriale || "N/D"}
                </p>
                <p className="text-sm text-gray-600">Cliente ID: {item.id_cliente}</p>
              </div>
            </div>
            {item.note && (
              <p className="text-gray-700 text-sm mt-2 line-clamp-2">{item.note}</p>
            )}
            <div className="mt-3 flex gap-4 text-sm text-gray-600">
              {item.data_test_funzionali && (
                <span>Test funzionali: {new Date(item.data_test_funzionali).toLocaleDateString()}</span>
              )}
              {item.data_test_elettrici && (
                <span>Test elettrici: {new Date(item.data_test_elettrici).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}

        {sortedApparecchiature.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? "Nessuna apparecchiatura trovata con i criteri di ricerca" : "Nessuna apparecchiatura trovata"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
