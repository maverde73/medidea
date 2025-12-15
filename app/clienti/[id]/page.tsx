"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";
import { Pencil, Trash2 } from "lucide-react";

interface Cliente {
  id: number;
  nome: string;
  indirizzo?: string;
  contatti?: string;
  created_at: string;
  updated_at: string;
}

export default function ClienteDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const initialMode = searchParams.get("mode");

  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(initialMode === "edit");
  const [editForm, setEditForm] = useState({
    nome: "",
    indirizzo: "",
    contatti: "",
  });

  useEffect(() => {
    fetchCliente();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchCliente = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/clienti/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data: Cliente };
        setCliente(data.data);
        setEditForm({
          nome: data.data.nome,
          indirizzo: data.data.indirizzo || "",
          contatti: data.data.contatti || "",
        });
      } else {
        setError("Cliente non trovato");
      }
    } catch (err) {
      setError("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questo cliente?")) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/clienti/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        router.push("/clienti");
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
    if (!editForm.nome.trim()) {
      setError("Il nome è obbligatorio");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/clienti/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json() as { data: Cliente };
        setCliente(data.data);
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  if (loading && !cliente) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error && !cliente) {
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

  if (!cliente) return null;

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{cliente.nome}</h1>
            <p className="text-gray-600 mt-1">
              Creato il {formatDate(cliente.created_at)}
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

      {/* Dati Cliente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Cliente</h2>
        {editing ? (
          <div className="space-y-4">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
              <input
                type="text"
                value={editForm.indirizzo}
                onChange={(e) => setEditForm({ ...editForm, indirizzo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contatti</label>
              <textarea
                value={editForm.contatti}
                onChange={(e) => setEditForm({ ...editForm, contatti: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
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
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="text-gray-900 font-medium">{cliente.nome}</p>
            </div>
            {cliente.indirizzo && (
              <div>
                <p className="text-sm text-gray-600">Indirizzo</p>
                <p className="text-gray-900 font-medium">{cliente.indirizzo}</p>
              </div>
            )}
            {cliente.contatti && (
              <div>
                <p className="text-sm text-gray-600">Contatti</p>
                <p className="text-gray-900 font-medium whitespace-pre-wrap">{cliente.contatti}</p>
              </div>
            )}
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
          {deleting ? "Eliminazione..." : "Elimina Cliente"}
        </button>
      </div>
    </div>
  );
}
