"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { LoadingSpinner, ErrorAlert, AttivitaStatusBadge, FileList, FileUploader } from "@/components/ui";

interface Attivita {
  id: number;
  id_cliente: number;
  modello: string | null;
  seriale: string | null;
  codice_inventario_cliente: string | null;
  stato: "APERTO" | "CHIUSO" | "RIAPERTO";
  data_apertura_richiesta: string | null;
  modalita_apertura_richiesta: string | null;
  numero_preventivo: string | null;
  data_preventivo: string | null;
  numero_accettazione_preventivo: string | null;
  data_accettazione_preventivo: string | null;
  data_chiusura: string | null;
  note_generali: string | null;
  data_presa_in_carico: string | null;
  reparto: string | null;
  tecnico: string | null;
  urgenza: string | null;
  created_at: string;
  updated_at: string;
}

interface FileInfo {
  id: number;
  nome_file_originale: string;
  chiave_r2: string;
  dimensione: number;
  data_caricamento: string;
  tipo_riferimento?: string;
  id_riferimento?: number;
}

export default function AttivitaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const initialMode = searchParams.get("mode");

  const [attivita, setAttivita] = useState<Attivita | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(initialMode === "edit");
  const [editForm, setEditForm] = useState({
    modello: "",
    seriale: "",
    codice_inventario_cliente: "",
    stato: "APERTO" as "APERTO" | "CHIUSO" | "RIAPERTO",
    data_apertura_richiesta: "",
    modalita_apertura_richiesta: "",
    numero_preventivo: "",
    data_preventivo: "",
    numero_accettazione_preventivo: "",
    data_accettazione_preventivo: "",
    data_chiusura: "",
    note_generali: "",
    data_presa_in_carico: "",
    reparto: "",
    tecnico: "",
    urgenza: "" as "" | "BASSA" | "MEDIA" | "ALTA",
  });

  useEffect(() => {
    fetchAttivita();
    fetchFiles();
  }, [id]);

  const fetchAttivita = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/attivita/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data: Attivita };
        setAttivita(data.data);
        setEditForm({
          modello: data.data.modello || "",
          seriale: data.data.seriale || "",
          codice_inventario_cliente: data.data.codice_inventario_cliente || "",
          stato: data.data.stato,
          data_apertura_richiesta: data.data.data_apertura_richiesta || "",
          modalita_apertura_richiesta: data.data.modalita_apertura_richiesta || "",
          numero_preventivo: data.data.numero_preventivo || "",
          data_preventivo: data.data.data_preventivo || "",
          numero_accettazione_preventivo: data.data.numero_accettazione_preventivo || "",
          data_accettazione_preventivo: data.data.data_accettazione_preventivo || "",
          data_chiusura: data.data.data_chiusura || "",
          note_generali: data.data.note_generali || "",
          data_presa_in_carico: data.data.data_presa_in_carico || "",
          reparto: data.data.reparto || "",
          tecnico: data.data.tecnico || "",
          urgenza: (data.data.urgenza || "") as "" | "BASSA" | "MEDIA" | "ALTA",
        });
      } else {
        setError("Attività non trovata");
      }
    } catch (err) {
      setError("Errore durante il caricamento");
    } finally {
      setLoading(false);
    }
  };

  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/file?tipo_riferimento=attivita&id_riferimento=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data: FileInfo[] };
        setFiles(data.data || []);
      }
    } catch (err) {
      console.error("Error fetching files:", err);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Sei sicuro di voler eliminare questa attività?")) return;

    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/attivita/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        router.push("/attivita");
      } else {
        setError("Errore durante l'eliminazione");
      }
    } catch (err) {
      setError("Errore durante l'eliminazione");
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async (fileId: number, chiaveR2: string) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/file/${fileId}/download`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = chiaveR2.split("/").pop() || "file.pdf";
        a.click();
      }
    } catch (err) {
      console.error("Error downloading file:", err);
    }
  };

  const handleFileDelete = async (fileId: number) => {
    if (!confirm("Sei sicuro di voler eliminare questo file?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/file/${fileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== fileId));
      }
    } catch (err) {
      console.error("Error deleting file:", err);
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/attivita/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json() as { data: Attivita };
        setAttivita(data.data);
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

  if (error || !attivita) {
    return (
      <div className="space-y-4">
        <ErrorAlert message={error || "Attività non trovata"} />
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
              Attività #{attivita.id}
            </h1>
            <p className="text-gray-600 mt-1">
              Creata il {formatDate(attivita.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {!editing && <AttivitaStatusBadge status={attivita.stato} />}
            <button
              onClick={() => setEditing(!editing)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Pencil size={16} />
              {editing ? "Annulla" : "Modifica"}
            </button>
          </div>
        </div>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {/* Cliente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Cliente</h2>
        <p className="text-gray-700">Cliente ID: {attivita.id_cliente}</p>
      </div>

      {/* Apparecchiatura */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Apparecchiatura</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modello</label>
              <input
                type="text"
                value={editForm.modello}
                onChange={(e) => setEditForm({ ...editForm, modello: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Codice Inventario Cliente</label>
              <input
                type="text"
                value={editForm.codice_inventario_cliente}
                onChange={(e) => setEditForm({ ...editForm, codice_inventario_cliente: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Modello</p>
              <p className="text-gray-900 font-medium">{attivita.modello || "N/D"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Seriale</p>
              <p className="text-gray-900 font-medium">{attivita.seriale || "N/D"}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Codice Inventario Cliente</p>
              <p className="text-gray-900 font-medium">{attivita.codice_inventario_cliente || "N/D"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Stato */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Stato Attività</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stato</label>
              <select
                value={editForm.stato}
                onChange={(e) => setEditForm({ ...editForm, stato: e.target.value as "APERTO" | "CHIUSO" | "RIAPERTO" })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="APERTO">Aperto</option>
                <option value="CHIUSO">Chiuso</option>
                <option value="RIAPERTO">Riaperto</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Chiusura</label>
              <input
                type="date"
                value={editForm.data_chiusura}
                onChange={(e) => setEditForm({ ...editForm, data_chiusura: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600">Stato:</p>
              <AttivitaStatusBadge status={attivita.stato} />
            </div>
            {attivita.data_chiusura && (
              <div>
                <p className="text-sm text-gray-600">Data Chiusura</p>
                <p className="text-gray-900 font-medium">{formatDate(attivita.data_chiusura)}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apertura Richiesta */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Apertura Richiesta</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Apertura</label>
              <input
                type="date"
                value={editForm.data_apertura_richiesta}
                onChange={(e) => setEditForm({ ...editForm, data_apertura_richiesta: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Modalità</label>
              <input
                type="text"
                value={editForm.modalita_apertura_richiesta}
                onChange={(e) => setEditForm({ ...editForm, modalita_apertura_richiesta: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Data Apertura</p>
              <p className="text-gray-900 font-medium">{formatDate(attivita.data_apertura_richiesta)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Modalità</p>
              <p className="text-gray-900 font-medium">{attivita.modalita_apertura_richiesta || "N/D"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Presa in Carico */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Presa in Carico</h2>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Presa in Carico</label>
              <input
                type="date"
                value={editForm.data_presa_in_carico}
                onChange={(e) => setEditForm({ ...editForm, data_presa_in_carico: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reparto</label>
              <input
                type="text"
                value={editForm.reparto}
                onChange={(e) => setEditForm({ ...editForm, reparto: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="es. Laboratorio, Magazzino"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tecnico</label>
              <input
                type="text"
                value={editForm.tecnico}
                onChange={(e) => setEditForm({ ...editForm, tecnico: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Nome del tecnico"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Urgenza</label>
              <select
                value={editForm.urgenza}
                onChange={(e) => setEditForm({ ...editForm, urgenza: e.target.value as "" | "BASSA" | "MEDIA" | "ALTA" })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleziona urgenza</option>
                <option value="BASSA">Bassa</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
              </select>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Data Presa in Carico</p>
              <p className="text-gray-900 font-medium">{formatDate(attivita.data_presa_in_carico)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Reparto</p>
              <p className="text-gray-900 font-medium">{attivita.reparto || "N/D"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tecnico</p>
              <p className="text-gray-900 font-medium">{attivita.tecnico || "N/D"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Urgenza</p>
              <p className="text-gray-900 font-medium">{attivita.urgenza || "N/D"}</p>
            </div>
          </div>
        )}
      </div>

      {/* Preventivo */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Preventivo</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero Preventivo</label>
              <input
                type="text"
                value={editForm.numero_preventivo}
                onChange={(e) => setEditForm({ ...editForm, numero_preventivo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Preventivo</label>
              <input
                type="date"
                value={editForm.data_preventivo}
                onChange={(e) => setEditForm({ ...editForm, data_preventivo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Numero</p>
              <p className="text-gray-900 font-medium">{attivita.numero_preventivo || "N/D"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data</p>
              <p className="text-gray-900 font-medium">{formatDate(attivita.data_preventivo)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Accettazione */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Accettazione Preventivo</h2>
        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Numero Accettazione</label>
              <input
                type="text"
                value={editForm.numero_accettazione_preventivo}
                onChange={(e) => setEditForm({ ...editForm, numero_accettazione_preventivo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Accettazione</label>
              <input
                type="date"
                value={editForm.data_accettazione_preventivo}
                onChange={(e) => setEditForm({ ...editForm, data_accettazione_preventivo: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Numero</p>
              <p className="text-gray-900 font-medium">{attivita.numero_accettazione_preventivo || "N/D"}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data</p>
              <p className="text-gray-900 font-medium">{formatDate(attivita.data_accettazione_preventivo)}</p>
            </div>
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Note Generali</h2>
        {editing ? (
          <div>
            <textarea
              value={editForm.note_generali}
              onChange={(e) => setEditForm({ ...editForm, note_generali: e.target.value })}
              rows={5}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              placeholder="Inserisci note generali..."
            />
          </div>
        ) : (
          attivita.note_generali ? (
            <p className="text-gray-700 whitespace-pre-wrap">{attivita.note_generali}</p>
          ) : (
            <p className="text-gray-500">Nessuna nota</p>
          )
        )}
      </div>

      {/* File Allegati */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">File Allegati</h2>
        {files.length > 0 ? (
          <FileList
            files={files}
            onDownload={handleDownload}
            onDelete={handleFileDelete}
          />
        ) : (
          <p className="text-gray-500 mb-4">Nessun file allegato</p>
        )}

        <div className="mt-4 pt-4 border-t">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Carica nuovo file</h3>
          <FileUploader
            accept={{ "application/pdf": [".pdf"] }}
            maxSize={10 * 1024 * 1024}
            onUploadComplete={(file) => {
              setFiles([...files, {
                id: file.id,
                nome_file_originale: file.nome_file_originale,
                chiave_r2: file.chiave_r2,
                dimensione: file.dimensione,
                data_caricamento: new Date().toISOString(),
              }]);
            }}
            uploadContext={{
              tipo_riferimento: "attivita",
              id_riferimento: parseInt(id),
            }}
          />
        </div>
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
            {deleting ? "Eliminazione..." : "Elimina Attività"}
          </button>
        )}
      </div>
    </div>
  );
}
