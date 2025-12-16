"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { LoadingSpinner, ErrorAlert, AttachmentManager, ModelSelector } from "@/components/ui";
import { Pencil, Trash2 } from "lucide-react";

interface Apparecchiatura {
  id: number;
  id_cliente: number;
  id_modello: number;
  modello: string; // This comes from the JOIN in the API
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
}

export default function ApparecchiaturaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const initialMode = searchParams.get("mode");

  const [apparecchiatura, setApparecchiatura] = useState<Apparecchiatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(initialMode === "edit");
  const [editForm, setEditForm] = useState({
    id_modello: 0,
    seriale: "",
    data_test_funzionali: "",
    data_test_elettrici: "",
    note: "",
  });

  useEffect(() => {
    fetchApparecchiatura();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchApparecchiatura = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/apparecchiature/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data: Apparecchiatura };
        setApparecchiatura(data.data);
        setEditForm({
          id_modello: data.data.id_modello,
          seriale: data.data.seriale || "",
          data_test_funzionali: data.data.data_test_funzionali || "",
          data_test_elettrici: data.data.data_test_elettrici || "",
          note: data.data.note || "",
        });
      } else {
        setError("Apparecchiatura non trovata");
      }
    } catch (err) {
      setError("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questa apparecchiatura?")) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/apparecchiature/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        router.push("/apparecchiature");
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
    if (!editForm.id_modello) {
      setError("Il modello è obbligatorio");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/apparecchiature/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          // Maintain the valid client ID (though usually not editable here, API requires it)
          id_cliente: apparecchiatura?.id_cliente,
          ...editForm
        }),
      });

      if (response.ok) {
        const data = await response.json() as { data: Apparecchiatura };
        setApparecchiatura(data.data);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/D";
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error || !apparecchiatura) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error || "Apparecchiatura non trovata"} />
        <button
          onClick={() => router.back()}
          className="text-primary-500 hover:text-primary-600"
        >
          ← Torna indietro
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Apparecchiatura #{apparecchiatura.id}
            </h1>
            <p className="text-gray-600 mt-1">
              Creata il {formatDate(apparecchiatura.created_at)}
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

      {/* Cliente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Cliente</h2>
        <p className="text-gray-700">Cliente ID: {apparecchiatura.id_cliente}</p>
      </div>

      {/* Dati Apparecchiatura */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Apparecchiatura</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <p className="block text-sm font-medium text-gray-700 mb-1">
                Modello <span className="text-red-500">*</span>
              </p>
              <ModelSelector
                value={editForm.id_modello}
                onSelect={(value) => setEditForm({ ...editForm, id_modello: value || 0 })}
                error={!editForm.id_modello ? "Modello obbligatorio" : undefined}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seriale</label>
              <input
                type="text"
                value={editForm.seriale}
                onChange={(e) => setEditForm({ ...editForm, seriale: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Modello</p>
              <p className="text-gray-900 font-medium">{apparecchiatura.modello}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seriale</p>
              <p className="text-gray-900 font-medium">{apparecchiatura.seriale || "N/D"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Test e Verifiche */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test e Verifiche</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Test Funzionali</label>
              <input
                type="date"
                value={editForm.data_test_funzionali}
                onChange={(e) => setEditForm({ ...editForm, data_test_funzionali: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Test Elettrici</label>
              <input
                type="date"
                value={editForm.data_test_elettrici}
                onChange={(e) => setEditForm({ ...editForm, data_test_elettrici: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Data Test Funzionali</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(apparecchiatura.data_test_funzionali)}
                </p>
              </div>
              <div className="border-t pt-4">
                <AttachmentManager
                  tipoRiferimento="apparecchiatura"
                  idRiferimento={apparecchiatura.id}
                  category="test_funzionali"
                  label="Allegati Test Funzionali"
                />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Data Test Elettrici</p>
                <p className="text-gray-900 font-medium">
                  {formatDate(apparecchiatura.data_test_elettrici)}
                </p>
              </div>
              <div className="border-t pt-4">
                <AttachmentManager
                  tipoRiferimento="apparecchiatura"
                  idRiferimento={apparecchiatura.id}
                  category="test_elettrici"
                  label="Allegati Test Elettrici"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Note</h2>
        {editing ? (
          <div>
            <textarea
              value={editForm.note}
              onChange={(e) => setEditForm({ ...editForm, note: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Inserisci note..."
            />
          </div>
        ) : (
          apparecchiatura.note ? (
            <p className="text-gray-700 whitespace-pre-wrap">{apparecchiatura.note}</p>
          ) : (
            <p className="text-gray-500">Nessuna nota</p>
          )
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        {editing && (
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Salvataggio..." : "Salva Modifiche"}
          </button>
        )}
        {!editing && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 size={16} />
            {deleting ? "Eliminazione..." : "Elimina Apparecchiatura"}
          </button>
        )}
      </div>
    </div>
  );
}
