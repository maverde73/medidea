"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Trash2, Pencil } from "lucide-react";
import { LoadingSpinner, ErrorAlert, AttivitaStatusBadge, FileList, FileUploader, ModelSelector, EquipmentSelector } from "@/components/ui";
import { TechnicianSelect } from "@/components/tecnici/TechnicianSelect";
import { InterventionTypeSelector } from "@/components/ui/InterventionTypeSelector";
import { GlobalServiceToggle } from "@/components/ui/GlobalServiceToggle";
import { MultiEquipmentSelector } from "@/components/ui/MultiEquipmentSelector";
import { SparePartsManager } from "@/components/ui/SparePartsManager";
import { Button } from "@/components/ui/button";

interface Attivita {
  id: number;
  id_cliente: number;
  id_apparecchiatura: number | null;
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
  id_tecnico: number | null;
  urgenza: string | null;
  created_at: string;
  updated_at: string;
  // Client requirement fields
  numero_verbale?: string | null;
  global_service?: number | null;
  id_cliente_finale?: number | null;
  sorgente_ordine?: string | null;
  data_ordine?: string | null;
  numero_contratto?: string | null;
  data_contratto?: string | null;
  data_intervento?: string | null;
  ore_lavoro?: number | null;
  ore_viaggio?: number | null;
  modalita_intervento?: string | null;
  tipi_apparecchiatura_json?: string | null;
  tipi_intervento_json?: string | null;
  descrizione_richiesta?: string | null;
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
  const [saveError, setSaveError] = useState<{ error: string; details?: { field: string; message: string }[] } | null>(null);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(initialMode === "edit");
  const [reparti, setReparti] = useState<{ id: number; nome: string }[]>([]);
  const [modalita, setModalita] = useState<{ id: number; descrizione: string }[]>([]);
  const [isNewEquipment, setIsNewEquipment] = useState(false);

  useEffect(() => {
    const fetchLookups = async () => {
      const token = localStorage.getItem("token");
      try {
        const [resReparti, resModalita] = await Promise.all([
          fetch("/api/reparti", { headers: { Authorization: `Bearer ${token}` } }),
          fetch("/api/modalita-apertura", { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const dataReparti = (await resReparti.json()) as { success: boolean; data: { id: number; nome: string }[] };
        const dataModalita = (await resModalita.json()) as { success: boolean; data: { id: number; descrizione: string }[] };

        if (dataReparti.success) setReparti(dataReparti.data);
        if (dataModalita.success) setModalita(dataModalita.data);
      } catch (error) {
        console.error("Error fetching lookups", error);
      }
    };
    fetchLookups();
  }, []);

  const [editForm, setEditForm] = useState({
    id_apparecchiatura: null as number | null,
    id_modello: null as number | null,
    modello: "", // Used for display or fallback
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
    id_tecnico: null as number | null,
    urgenza: "" as "" | "BASSA" | "MEDIA" | "ALTA",
    // Client requirement fields
    numero_verbale: "",
    data_intervento: "",
    descrizione_richiesta: "",
    sorgente_ordine: "",
    data_ordine: "",
    numero_contratto: "",
    data_contratto: "",
    ore_lavoro: null as number | null,
    ore_viaggio: null as number | null,
    modalita_intervento: "",
    tipi_apparecchiatura_json: "",
    tipi_intervento_json: "",
    global_service: null as number | null,
    id_cliente_finale: null as number | null,
  });

  useEffect(() => {
    fetchAttivita();
    fetchFiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        const activity = data.data; // Renamed for clarity as per instruction
        setAttivita(activity);
        setEditForm({
          id_apparecchiatura: activity.id_apparecchiatura,
          id_modello: null, //activity.id_modello, NOTE: Model is now separate, fetched from apparecchiatura
          modello: activity.modello || "",
          seriale: activity.seriale || "",
          codice_inventario_cliente: activity.codice_inventario_cliente || "",
          stato: activity.stato,
          data_apertura_richiesta: activity.data_apertura_richiesta || "",
          modalita_apertura_richiesta: activity.modalita_apertura_richiesta || "",
          numero_preventivo: activity.numero_preventivo || "",
          data_preventivo: activity.data_preventivo || "",
          numero_accettazione_preventivo: activity.numero_accettazione_preventivo || "",
          data_accettazione_preventivo: activity.data_accettazione_preventivo || "",
          data_chiusura: activity.data_chiusura || "",
          note_generali: activity.note_generali || "",
          data_presa_in_carico: activity.data_presa_in_carico || "",
          reparto: activity.reparto || "",
          tecnico: activity.tecnico || "",
          id_tecnico: activity.id_tecnico,
          urgenza: (activity.urgenza as "" | "BASSA" | "MEDIA" | "ALTA") || "",
          // Client requirement fields
          numero_verbale: activity.numero_verbale || "",
          data_intervento: activity.data_intervento || "",
          descrizione_richiesta: activity.descrizione_richiesta || "",
          sorgente_ordine: activity.sorgente_ordine || "",
          data_ordine: activity.data_ordine || "",
          numero_contratto: activity.numero_contratto || "",
          data_contratto: activity.data_contratto || "",
          ore_lavoro: activity.ore_lavoro || null,
          ore_viaggio: activity.ore_viaggio || null,
          modalita_intervento: activity.modalita_intervento || "",
          tipi_apparecchiatura_json: activity.tipi_apparecchiatura_json || "",
          tipi_intervento_json: activity.tipi_intervento_json || "",
          global_service: activity.global_service || null,
          id_cliente_finale: activity.id_cliente_finale || null,
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
    setSaveError(null);
    try {
      const token = localStorage.getItem("token");
      // Prepare payload
      const payload = {
        ...editForm,
        data_apertura_richiesta: editForm.data_apertura_richiesta || null,
        data_preventivo: editForm.data_preventivo || null,
        data_accettazione_preventivo: editForm.data_accettazione_preventivo || null,
        data_chiusura: editForm.data_chiusura || null,
        data_presa_in_carico: editForm.data_presa_in_carico || null,
        // Also handle other optional fields that might be empty strings
        codice_inventario_cliente: editForm.codice_inventario_cliente || null,
        modalita_apertura_richiesta: editForm.modalita_apertura_richiesta || null,
        numero_preventivo: editForm.numero_preventivo || null,
        numero_accettazione_preventivo: editForm.numero_accettazione_preventivo || null,
        note_generali: editForm.note_generali || null,
        reparto: editForm.reparto || null,
        tecnico: editForm.tecnico || null,
        id_tecnico: editForm.id_tecnico || null,
        urgenza: editForm.urgenza || null,
        // Equipment logic
        id_modello: isNewEquipment ? editForm.id_modello : undefined,
        seriale: isNewEquipment ? editForm.seriale : undefined,
        id_apparecchiatura: isNewEquipment ? undefined : editForm.id_apparecchiatura,
      };

      // Remove fields that shouldn't be sent if they are not relevant
      if (!isNewEquipment) {
        // If selecting existing, we don't send id_modello/seriale as they are for creating new
        // But we send id_apparecchiatura
      } else {
        // If creating new, we don't send id_apparecchiatura (or send it as undefined/null)
      }

      const response = await fetch(`/api/attivita/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json() as { data: Attivita };
        setAttivita(data.data);
        setEditing(false);
        setSaveError(null);
        // Update form with new data
        setEditForm(prev => ({
          ...prev,
          id_apparecchiatura: data.data.id_apparecchiatura || null,
          modello: data.data.modello || "",
          seriale: data.data.seriale || "",
        }));
        setIsNewEquipment(false);
      } else {
        const errorData = await response.json() as { error: string; details?: { field: string; message: string }[] };
        setSaveError({
          error: errorData.error || "Errore durante l'aggiornamento",
          details: errorData.details
        });
      }
    } catch (err) {
      setSaveError({ error: "Errore di rete durante l'aggiornamento" });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/D";
    return new Date(dateString).toLocaleDateString("it-IT");
  };

  if (loading && !attivita) {
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
              onClick={() => {
                setEditing(!editing);
                // Reset equipment state when entering edit mode
                setIsNewEquipment(false);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              <Pencil size={16} />
              {editing ? "Annulla" : "Modifica"}
            </button>
          </div>
        </div>
      </div>

      {saveError && (
        <ErrorAlert
          message={saveError.error}
          onDismiss={() => setSaveError(null)}
        >
          {saveError.details && (
            <ul className="list-disc pl-5 mt-2 space-y-1">
              {saveError.details.map((err, i) => (
                <li key={i}>
                  <span className="font-medium">{err.field}:</span> {err.message}
                </li>
              ))}
            </ul>
          )}
        </ErrorAlert>
      )}

      {/* Cliente */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Dati Cliente</h2>
        <p className="text-gray-700">Cliente ID: {attivita.id_cliente}</p>
        {/* We could fetch and display client name here if needed, but it's not in the Attivita interface currently used in state, 
            though the API returns it. For now, we stick to what we have. */}
      </div>

      {/* Apparecchiatura */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Dati Apparecchiatura</h2>
          {editing && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsNewEquipment(!isNewEquipment);
                // Reset fields when toggling
                if (!isNewEquipment) {
                  setEditForm(prev => ({ ...prev, id_apparecchiatura: null, id_modello: null, seriale: "" }));
                } else {
                  // Restore original if cancelling? For now just reset.
                  setEditForm(prev => ({ ...prev, id_apparecchiatura: attivita.id_apparecchiatura, id_modello: null, seriale: attivita.seriale || "" }));
                }
              }}
            >
              {isNewEquipment ? "Seleziona Esistente" : "Nuova Apparecchiatura"}
            </Button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            {isNewEquipment ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Modello <span className="text-red-500">*</span>
                  </label>
                  <ModelSelector
                    value={editForm.id_modello || undefined}
                    onSelect={(id) => setEditForm({ ...editForm, id_modello: id })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Seriale
                  </label>
                  <input
                    type="text"
                    value={editForm.seriale}
                    onChange={(e) => setEditForm({ ...editForm, seriale: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                    placeholder="Inserisci numero seriale"
                  />
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apparecchiatura <span className="text-red-500">*</span>
                </label>
                <EquipmentSelector
                  idCliente={attivita.id_cliente}
                  value={editForm.id_apparecchiatura || undefined}
                  onSelect={(id) => setEditForm({ ...editForm, id_apparecchiatura: id })}
                />
              </div>
            )}

            <div className="mt-4">
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

      {/* NEW: Multi-Equipment Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Apparecchiature Collegate</h2>
        <MultiEquipmentSelector
          idAttivita={parseInt(id)}
          idCliente={attivita.id_cliente}
          onUpdate={fetchAttivita}
        />
      </div>

      {/* NEW: Spare Parts Management */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Ricambi Utilizzati</h2>
        <SparePartsManager
          idAttivita={parseInt(id)}
          onUpdate={fetchAttivita}
        />
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
              <select
                value={editForm.modalita_apertura_richiesta}
                onChange={(e) => setEditForm({ ...editForm, modalita_apertura_richiesta: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleziona modalità</option>
                {modalita.map((m) => (
                  <option key={m.id} value={m.descrizione}>
                    {m.descrizione}
                  </option>
                ))}
              </select>
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
              <select
                value={editForm.reparto}
                onChange={(e) => setEditForm({ ...editForm, reparto: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Seleziona reparto</option>
                {reparti.map((r) => (
                  <option key={r.id} value={r.nome}>
                    {r.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tecnico</label>
              <TechnicianSelect
                value={editForm.id_tecnico?.toString()}
                onChange={(val) => setEditForm({ ...editForm, id_tecnico: parseInt(val) })}
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

      {/* NEW: Identificativi e Guasto Segnalato */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Identificativi e Guasto</h2>
        {editing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Numero Verbale</label>
                <input
                  type="text"
                  value={editForm.numero_verbale}
                  onChange={(e) => setEditForm({ ...editForm, numero_verbale: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="es. 1212DL"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Data Intervento</label>
                <input
                  type="date"
                  value={editForm.data_intervento}
                  onChange={(e) => setEditForm({ ...editForm, data_intervento: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Guasto Segnalato</label>
              <textarea
                value={editForm.descrizione_richiesta}
                onChange={(e) => setEditForm({ ...editForm, descrizione_richiesta: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="Descrivi il guasto o la richiesta"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {attivita.numero_verbale && (
              <p><span className="font-medium">Numero Verbale:</span> {attivita.numero_verbale}</p>
            )}
            {attivita.data_intervento && (
              <p><span className="font-medium">Data Intervento:</span> {new Date(attivita.data_intervento).toLocaleDateString()}</p>
            )}
            {attivita.descrizione_richiesta && (
              <p><span className="font-medium">Guasto Segnalato:</span> {attivita.descrizione_richiesta}</p>
            )}
            {!attivita.numero_verbale && !attivita.data_intervento && !attivita.descrizione_richiesta && (
              <p className="text-gray-500">Nessuna informazione</p>
            )}
          </div>
        )}
      </div>

      {/* NEW: Ordine e Contratto */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Ordine e Contratto Manutenzione</h2>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Sorgente Ordine</label>
              <select
                value={editForm.sorgente_ordine}
                onChange={(e) => setEditForm({ ...editForm, sorgente_ordine: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="">Seleziona...</option>
                {modalita.map((m) => (
                  <option key={m.id} value={m.descrizione}>
                    {m.descrizione}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Ordine</label>
              <input
                type="date"
                value={editForm.data_ordine}
                onChange={(e) => setEditForm({ ...editForm, data_ordine: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">N° Contratto</label>
              <input
                type="text"
                value={editForm.numero_contratto}
                onChange={(e) => setEditForm({ ...editForm, numero_contratto: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="es. CONTR-2025-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Data Contratto</label>
              <input
                type="date"
                value={editForm.data_contratto}
                onChange={(e) => setEditForm({ ...editForm, data_contratto: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {attivita.sorgente_ordine && (
              <p><span className="font-medium">Sorgente Ordine:</span> {attivita.sorgente_ordine}</p>
            )}
            {attivita.data_ordine && (
              <p><span className="font-medium">Data Ordine:</span> {new Date(attivita.data_ordine).toLocaleDateString()}</p>
            )}
            {attivita.numero_contratto && (
              <p><span className="font-medium">N° Contratto:</span> {attivita.numero_contratto}</p>
            )}
            {attivita.data_contratto && (
              <p><span className="font-medium">Data Contratto:</span> {new Date(attivita.data_contratto).toLocaleDateString()}</p>
            )}
            {!attivita.sorgente_ordine && !attivita.data_ordine && !attivita.numero_contratto && !attivita.data_contratto && (
              <p className="text-gray-500">Nessuna informazione</p>
            )}
          </div>
        )}
      </div>

      {/* NEW: Tempistiche */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Tempistiche</h2>
        {editing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Ore Lavoro (opzionale)</label>
              <input
                type="number"
                step="0.5"
                value={editForm.ore_lavoro || ""}
                onChange={(e) => setEditForm({ ...editForm, ore_lavoro: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="es. 2.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Ore Viaggio (opzionale)</label>
              <input
                type="number"
                step="0.5"
                value={editForm.ore_viaggio || ""}
                onChange={(e) => setEditForm({ ...editForm, ore_viaggio: e.target.value ? parseFloat(e.target.value) : null })}
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="es. 0.5"
              />
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {attivita.ore_lavoro !== null && attivita.ore_lavoro !== undefined && (
              <p><span className="font-medium">Ore Lavoro:</span> {attivita.ore_lavoro} h</p>
            )}
            {attivita.ore_viaggio !== null && attivita.ore_viaggio !== undefined && (
              <p><span className="font-medium">Ore Viaggio:</span> {attivita.ore_viaggio} h</p>
            )}
            {(attivita.ore_lavoro === null || attivita.ore_lavoro === undefined) && (attivita.ore_viaggio === null || attivita.ore_viaggio === undefined) && (
              <p className="text-gray-500">Nessuna informazione</p>
            )}
          </div>
        )}
      </div>

      {/* NEW: Global Service */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Global Service</h2>
        {editing ? (
          <GlobalServiceToggle
            value={editForm.global_service}
            onChange={(enabled, clienteFinaleId) => {
              setEditForm({
                ...editForm,
                global_service: enabled ? 1 : 0,
                id_cliente_finale: clienteFinaleId || null,
              });
            }}
            currentClientId={attivita.id_cliente}
          />
        ) : (
          <div className="space-y-2">
            <p><span className="font-medium">Attivo:</span> {attivita.global_service ? "Sì" : "No"}</p>
            {attivita.id_cliente_finale && (
              <p><span className="font-medium">Cliente Finale ID:</span> {attivita.id_cliente_finale}</p>
            )}
            {!attivita.global_service && (
              <p className="text-gray-500">Non in Global Service</p>
            )}
          </div>
        )}
      </div>

      {/* NEW: Classificazione Intervento */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Classificazione Intervento</h2>
        {editing ? (
          <div className="space-y-4">
            <InterventionTypeSelector
              type="modalita"
              value={editForm.modalita_intervento}
              onChange={(value) => setEditForm({ ...editForm, modalita_intervento: value })}
              label="Modalità Intervento"
            />

            <InterventionTypeSelector
              type="apparecchiatura"
              value={editForm.tipi_apparecchiatura_json}
              onChange={(value) => setEditForm({ ...editForm, tipi_apparecchiatura_json: value })}
            />

            <InterventionTypeSelector
              type="intervento"
              value={editForm.tipi_intervento_json}
              onChange={(value) => setEditForm({ ...editForm, tipi_intervento_json: value })}
            />
          </div>
        ) : (
          <div className="space-y-2">
            {attivita.modalita_intervento && (
              <p><span className="font-medium">Modalità:</span> {attivita.modalita_intervento}</p>
            )}
            {attivita.tipi_apparecchiatura_json && (
              <p><span className="font-medium">Tipi Apparecchiatura:</span> {attivita.tipi_apparecchiatura_json}</p>
            )}
            {attivita.tipi_intervento_json && (
              <p><span className="font-medium">Tipi Intervento:</span> {attivita.tipi_intervento_json}</p>
            )}
            {!attivita.modalita_intervento && !attivita.tipi_apparecchiatura_json && !attivita.tipi_intervento_json && (
              <p className="text-gray-500">Nessuna classificazione</p>
            )}
          </div>
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
