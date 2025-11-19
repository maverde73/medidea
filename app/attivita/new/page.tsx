"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  ClientSelector,
  FileUploader,
  LoadingSpinner,
  ErrorAlert,
  type UploadedFileInfo,
} from "@/components/ui";

// Validation schema
const attivitaSchema = z.object({
  // Cliente
  id_cliente: z.number({ required_error: "Cliente obbligatorio" }).positive("Cliente obbligatorio"),

  // Apparecchiatura
  modello: z.string().min(1, "Modello obbligatorio"),
  seriale: z.string().optional(),
  codice_inventario_cliente: z.string().optional(),

  // Apertura richiesta
  modalita_apertura_richiesta: z.string().optional(),
  data_apertura_richiesta: z.string().min(1, "Data apertura obbligatoria"),

  // Preventivo
  numero_preventivo: z.string().optional(),
  data_preventivo: z.string().optional(),

  // Accettazione
  numero_accettazione_preventivo: z.string().optional(),
  data_accettazione_preventivo: z.string().optional(),

  // Note
  note_generali: z.string().optional(),
});

type AttivitaFormData = z.infer<typeof attivitaSchema>;

export default function NewAttivitaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<{
    preventivo?: UploadedFileInfo;
    accettazione?: UploadedFileInfo;
  }>({});

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AttivitaFormData>({
    resolver: zodResolver(attivitaSchema),
    defaultValues: {
      id_cliente: 0, // Default to 0 to trigger validation
      data_apertura_richiesta: new Date().toISOString().split("T")[0],
    },
  });

  const selectedClientId = watch("id_cliente");

  const onSubmit = async (data: AttivitaFormData) => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Create attività
      const response = await fetch("/api/attivita", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Errore durante la creazione");
      }

      const result = await response.json() as { data: { id: number } };
      const attivitaId = result.data.id;

      setSuccess(true);

      // Redirect to detail page after short delay
      setTimeout(() => {
        router.push(`/attivita/${attivitaId}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (type: "preventivo" | "accettazione") => (
    fileInfo: UploadedFileInfo
  ) => {
    setUploadedFiles((prev) => ({ ...prev, [type]: fileInfo }));
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Nuova Attività Giornaliera
        </h1>
        <p className="text-gray-600 mt-2">
          Compila il form per registrare una nuova attività
        </p>
      </div>

        {/* Success Message */}
        {success && (
          <ErrorAlert
            type="success"
            title="Attività creata con successo!"
            message="Verrai reindirizzato alla pagina di dettaglio..."
            dismissible={false}
            className="mb-6"
          />
        )}

        {/* Error Message */}
        {error && (
          <ErrorAlert
            type="error"
            title="Errore durante la creazione"
            message={error}
            onDismiss={() => setError(null)}
            className="mb-6"
          />
        )}

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Dati Cliente */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Dati Cliente
            </h2>
            <ClientSelector
              value={selectedClientId || null}
              onChange={(clientId) => {
                setValue("id_cliente", clientId || 0, { shouldValidate: true });
              }}
              required
              label="Cliente"
              showNewClientLink={false}
            />
            {errors.id_cliente && (
              <p className="mt-1 text-sm text-red-600">
                {errors.id_cliente.message}
              </p>
            )}
          </div>

          {/* Dati Apparecchiatura */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Dati Apparecchiatura
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modello <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  {...register("modello")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Inserisci modello"
                />
                {errors.modello && (
                  <p className="mt-1 text-sm text-red-600">{errors.modello.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Seriale
                </label>
                <input
                  type="text"
                  {...register("seriale")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Inserisci numero seriale"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Codice Inventario Cliente
                </label>
                <input
                  type="text"
                  {...register("codice_inventario_cliente")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Inserisci codice inventario"
                />
              </div>
            </div>
          </div>

          {/* Apertura Richiesta */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Apertura Richiesta
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Apertura <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  {...register("data_apertura_richiesta")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
                {errors.data_apertura_richiesta && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.data_apertura_richiesta.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Modalità Apertura
                </label>
                <input
                  type="text"
                  {...register("modalita_apertura_richiesta")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="es. Email, Telefono, Visita"
                />
              </div>
            </div>
          </div>

          {/* Preventivo */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Preventivo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero Preventivo
                </label>
                <input
                  type="text"
                  {...register("numero_preventivo")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Inserisci numero"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Preventivo
                </label>
                <input
                  type="date"
                  {...register("data_preventivo")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {uploadedFiles.preventivo && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ File caricato: {uploadedFiles.preventivo.filename}
                </p>
              </div>
            )}
            <FileUploader
              accept={{ "application/pdf": [".pdf"] }}
              maxSize={10 * 1024 * 1024}
              onUploadComplete={handleFileUpload("preventivo")}
              uploadContext={{
                tipo_riferimento: "preventivo",
                id_riferimento: 0,
              }}
            />
          </div>

          {/* Accettazione */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Accettazione Preventivo
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numero Accettazione
                </label>
                <input
                  type="text"
                  {...register("numero_accettazione_preventivo")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                  placeholder="Inserisci numero"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data Accettazione
                </label>
                <input
                  type="date"
                  {...register("data_accettazione_preventivo")}
                  className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            {uploadedFiles.accettazione && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                <p className="text-sm text-green-800">
                  ✓ File caricato: {uploadedFiles.accettazione.filename}
                </p>
              </div>
            )}
            <FileUploader
              accept={{ "application/pdf": [".pdf"] }}
              maxSize={10 * 1024 * 1024}
              onUploadComplete={handleFileUpload("accettazione")}
              uploadContext={{
                tipo_riferimento: "accettazione",
                id_riferimento: 0,
              }}
            />
          </div>

          {/* Note Generali */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Note Generali
            </h2>
            <textarea
              {...register("note_generali")}
              rows={4}
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
              placeholder="Inserisci eventuali note aggiuntive..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center transition-colors"
            >
              {loading ? (
                <>
                  <LoadingSpinner size="sm" variant="white" />
                  <span className="ml-2">Creazione in corso...</span>
                </>
              ) : (
                "Crea Attività"
              )}
            </button>
          </div>
        </form>
    </div>
  );
}
