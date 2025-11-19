"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, UserCircle, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface Utente {
  id: number;
  email: string;
  nome: string;
  cognome: string;
  role: string;
  active: boolean;
  created_at: string;
}

type SortField = 'nome' | 'cognome' | 'email' | 'role' | 'created_at' | 'id';
type SortDirection = 'asc' | 'desc';

export default function UtentiPage() {
  const [utenti, setUtenti] = useState<Utente[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>('nome');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const router = useRouter();

  useEffect(() => {
    fetchUtenti();
  }, []);

  const fetchUtenti = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/utenti", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data?: Utente[] };
        setUtenti(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching utenti:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUtenti = utenti.filter((utente) =>
    utente.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    utente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    utente.cognome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedUtenti = [...filteredUtenti].sort((a, b) => {
    let aVal: any = a[sortField];
    let bVal: any = b[sortField];

    // Handle boolean values (for active field if added to sort)
    if (typeof aVal === 'boolean') aVal = aVal ? 1 : 0;
    if (typeof bVal === 'boolean') bVal = bVal ? 1 : 0;

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

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-800",
      user: "bg-blue-100 text-blue-800",
      tecnico: "bg-green-100 text-green-800",
    };
    return colors[role] || "bg-gray-100 text-gray-800";
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
          <h1 className="text-3xl font-bold text-gray-900">Gestione Utenti</h1>
          <p className="text-gray-600 mt-1">
            Gestisci tutti gli utenti del sistema
          </p>
        </div>
        <button
          onClick={() => router.push("/utenti/new")}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
        >
          <Plus size={20} />
          Nuovo Utente
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
              placeholder="Cerca utenti per nome, cognome o email..."
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
              <option value="cognome">Cognome</option>
              <option value="email">Email</option>
              <option value="role">Ruolo</option>
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

      {/* Users List */}
      <div className="grid gap-4">
        {sortedUtenti.map((utente) => (
          <div
            key={utente.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => router.push(`/utenti/${utente.id}`)}
          >
            <div className="flex items-start gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <UserCircle size={24} className="text-indigo-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {utente.nome} {utente.cognome}
                  </h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadge(utente.role)}`}>
                    {utente.role}
                  </span>
                  {!utente.active && (
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                      Disattivato
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Email:</span> {utente.email}
                </p>
              </div>
            </div>
          </div>
        ))}

        {sortedUtenti.length === 0 && (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <p className="text-gray-500">
              {searchTerm ? "Nessun utente trovato con i criteri di ricerca" : "Nessun utente trovato"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
