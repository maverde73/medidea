"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LoadingSpinner, ErrorAlert, AttivitaStatusBadge, FileList } from "@/components/ui";

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
  created_at: string;
  updated_at: string;
}

interface FileInfo {
  id: number;
  filename: string;
  chiave_r2: string;
  dimensione: number;
  tipo_riferimento: string;
  created_at: string;
}

export default function AttivitaDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [attivita, setAttivita] = useState<Attivita | null>(null);
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

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
          className="text-indigo-600 hover:text-indigo-800"
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
          <AttivitaStatusBadge stato={attivita.stato} />
        </div>
      </div>

        {/* Cliente */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dati Cliente</h2>
          <p className="text-gray-700">Cliente ID: {attivita.id_cliente}</p>
        </div>

        {/* Apparecchiatura */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dati Apparecchiatura</h2>
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
        </div>

        {/* Apertura Richiesta */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Apertura Richiesta</h2>
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
        </div>

        {/* Preventivo */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Preventivo</h2>
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
        </div>

        {/* Accettazione */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Accettazione Preventivo</h2>
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
        </div>

        {/* Note */}
        {attivita.note_generali && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Note Generali</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{attivita.note_generali}</p>
          </div>
        )}

        {/* File Allegati */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">File Allegati</h2>
          {files.length > 0 ? (
            <FileList
              files={files}
              onDownload={handleDownload}
              onDelete={handleFileDelete}
            />
          ) : (
            <p className="text-gray-500">Nessun file allegato</p>
          )}
        </div>

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
        >
          {deleting ? "Eliminazione..." : "Elimina Attività"}
        </button>
      </div>
    </div>
  );
}
