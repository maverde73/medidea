"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Users, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Cliente {
  id: number;
  nome: string;
  indirizzo?: string;
  contatti?: string;
  created_at: string;
}

type SortField = 'nome' | 'indirizzo' | 'created_at' | 'id';
type SortDirection = 'asc' | 'desc';

export default function ClientiPage() {
  const [clienti, setClienti] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();

  useEffect(() => {
    fetchClienti();
  }, []);

  const fetchClienti = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/clienti", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data?: Cliente[] };
        setClienti(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching clienti:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClienti = clienti.filter((cliente) =>
    cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.indirizzo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cliente.contatti?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedClienti = [...filteredClienti].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    // Handle null/undefined values
    if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? 1 : -1;
    if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? -1 : 1;

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
          <h1 className="text-3xl font-bold text-gray-900">Gestione Clienti</h1>
          <p className="text-gray-600 mt-1">
            Gestisci tutti i clienti
          </p>
        </div>
        <button
          onClick={() => router.push("/clienti/new")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuovo Cliente
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
              placeholder="Cerca clienti per nome, indirizzo o contatti..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              value={sortField}
              onChange={(e) => setSortField(e.target.value as SortField)}
            >
              <option value="nome">Nome</option>
              <option value="indirizzo">Indirizzo</option>
              <option value="created_at">Data Creazione</option>
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

      {/* Clients List */}
      <div className="grid gap-4">
        {sortedClienti.map((cliente) => (
          <div
            key={cliente.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/clienti/${cliente.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users size={24} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-1">
                  {cliente.nome}
                </h3>
                {cliente.indirizzo && (
                  <p className="text-sm text-gray-600 mb-1">
                    <span className="font-medium">Indirizzo:</span> {cliente.indirizzo}
                  </p>
                )}
                {cliente.contatti && (
                  <p className="text-sm text-gray-600">
                    <span className="font-medium">Contatti:</span> {cliente.contatti}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {sortedClienti.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? "Nessun cliente trovato con i criteri di ricerca" : "Nessun cliente trovato"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
