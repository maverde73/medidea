"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";
import { Pencil, Trash2, Shield, ShieldOff } from "lucide-react";
import { TechnicianSelect } from "@/components/tecnici/TechnicianSelect";

interface Utente {
  id: number;
  email: string;
  nome: string;
  cognome: string;
  role: string;
  active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
  id_tecnico?: number;
}

export default function UtenteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const initialMode = searchParams.get("mode");

  const [utente, setUtente] = useState<Utente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(initialMode === "edit");
  const [editForm, setEditForm] = useState({
    nome: "",
    cognome: "",
    email: "",
    role: "user" as "admin" | "user" | "tecnico",
    active: true,
    id_tecnico: undefined as number | undefined,
  });

  useEffect(() => {
    fetchUtente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchUtente = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/utenti/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data: Utente };
        setUtente(data.data);
        setEditForm({
          nome: data.data.nome,
          cognome: data.data.cognome,
          email: data.data.email,
          role: data.data.role as "admin" | "user" | "tecnico",
          active: data.data.active,
          id_tecnico: data.data.id_tecnico,
        });
      } else {
        setError("Utente non trovato");
      }
    } catch (err) {
      setError("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questo utente?")) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/utenti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        router.push("/utenti");
      } else {
        setError("Errore durante l'eliminazione");
      }
    } catch (err) {
      setError("Errore durante l'eliminazione");
    } finally {
      setDeleting(false);
    }
  };

  const handleUpdate = async () => {
    if (!editForm.nome.trim() || !editForm.cognome.trim() || !editForm.email.trim()) {
      setError("Nome, cognome ed email sono obbligatori");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/utenti/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json() as { data: Utente };
        setUtente(data.data);
        setEditing(false);
        setError("");
      } else {
        const errorData = await response.json() as { error?: string };
        setError(errorData.error || "Errore durante l'aggiornamento");
      }
    } catch (err) {
      setError("Errore durante l'aggiornamento");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Mai";
    return new Date(dateString).toLocaleDateString("it-IT", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleBadge = (role: string) => {
    const configs: Record<string, { color: string; label: string }> = {
      admin: { color: "bg-purple-100 text-purple-800", label: "Amministratore" },
      user: { color: "bg-blue-100 text-blue-800", label: "Utente" },
      tecnico: { color: "bg-green-100 text-green-800", label: "Tecnico" },
    };
    const config = configs[role] || { color: "bg-gray-100 text-gray-800", label: role };
    return { color: config.color, label: config.label };
  };

  if (loading && !utente) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !utente) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error} />
        <button
          onClick={() => router.back()}
          className="text-primary-500 hover:text-primary-600"
        >
          ← Torna indietro
        </button>
      </div>
    );
  }

  if (!utente) return null;

  const roleBadge = getRoleBadge(utente.role);

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold text-gray-900">
                {utente.nome} {utente.cognome}
              </h1>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${roleBadge.color}`}>
                {roleBadge.label}
              </span>
              {!utente.active && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                  <ShieldOff size={14} />
                  Disattivato
                </span>
              )}
              {utente.active && (
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1">
                  <Shield size={14} />
                  Attivo
                </span>
              )}
            </div>
            <p className="text-gray-600">{utente.email}</p>
            <p className="text-sm text-gray-500 mt-1">
              Ultimo accesso: {formatDate(utente.last_login)}
            </p>
          </div>
          <button
            onClick={() => setEditing(!editing)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
          >
            <Pencil size={16} />
            {editing ? "Annulla" : "Modifica"}
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {/* Dati Utente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Utente</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.nome}
                  onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cognome <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.cognome}
                  onChange={(e) => setEditForm({ ...editForm, cognome: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ruolo <span className="text-red-500">*</span>
              </label>
              <select
                value={editForm.role}
                onChange={(e) => setEditForm({ ...editForm, role: e.target.value as "admin" | "user" | "tecnico" })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="user">Utente</option>
                <option value="tecnico">Tecnico</option>
                <option value="admin">Amministratore</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={editForm.active}
                onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                id="active-edit"
              />
              <label htmlFor="active-edit" className="ml-2 block text-sm text-gray-700">
                Account attivo
              </label>
            </div>

            {/* Selezione Tecnico (solo se ruolo è tecnico) */}
            {editForm.role === "tecnico" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associa Tecnico
                </label>
                <TechnicianSelect
                  value={editForm.id_tecnico?.toString()}
                  onChange={(val) => setEditForm({ ...editForm, id_tecnico: parseInt(val) })}
                  onTechnicianSelect={(tecnico) => {
                    if (tecnico) {
                      setEditForm({ ...editForm, nome: tecnico.nome, cognome: tecnico.cognome, id_tecnico: tecnico.id });
                    }
                  }}
                  availableForUserOnly={true}
                  currentUserId={utente?.id}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Seleziona il tecnico da associare a questo utente. Nome e Cognome verranno compilati automaticamente.
                </p>
              </div>
            )}
            <div className="flex justify-end">
              <button
                onClick={handleUpdate}
                disabled={loading}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50"
              >
                {loading ? "Salvataggio..." : "Salva Modifiche"}
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="text-gray-900 font-medium">{utente.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Cognome</p>
              <p className="text-gray-900 font-medium">{utente.cognome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-gray-900 font-medium">{utente.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ruolo</p>
              <p className="text-gray-900 font-medium">{roleBadge.label}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Creato il</p>
              <p className="text-gray-900 font-medium">{formatDate(utente.created_at)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Ultimo aggiornamento</p>
              <p className="text-gray-900 font-medium">{formatDate(utente.updated_at)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          <Trash2 size={16} />
          {deleting ? "Eliminazione..." : "Elimina Utente"}
        </button>
      </div>
    </div>
  );
}
