"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ClientSelector, LoadingSpinner, ErrorAlert, ModelSelector } from "@/components/ui";

const apparecchiaturaSchema = z.object({
  id_cliente: z.number().positive("Cliente obbligatorio"),
  id_modello: z.number().positive("Modello obbligatorio"),
  seriale: z.string().optional(),
  data_test_funzionali: z.string().optional(),
  data_test_elettrici: z.string().optional(),
  note: z.string().optional(),
});

type ApparecchiaturaFormData = z.infer<typeof apparecchiaturaSchema>;

export default function NewApparecchiaturaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ApparecchiaturaFormData>({
    resolver: zodResolver(apparecchiaturaSchema),
    defaultValues: {
      id_cliente: 0,
    },
  });

  const selectedClientId = watch("id_cliente");

  const onSubmit = async (data: ApparecchiaturaFormData) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/apparecchiature", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json() as { error?: string };
        throw new Error(errorData.error || "Errore durante la creazione");
      }

      const result = await response.json() as { data: { id: number } };
      setSuccess(true);

      setTimeout(() => {
        router.push(`/apparecchiature/${result.data.id}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore sconosciuto");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Nuova Apparecchiatura</h1>
        <p className="text-gray-600 mt-2">Compila il form per registrare una nuova apparecchiatura</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Apparecchiatura creata con successo!</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Dati Cliente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dati Cliente</h2>
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
            <p className="mt-1 text-sm text-red-600">{errors.id_cliente.message}</p>
          )}
        </div>

        {/* Dati Apparecchiatura */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dati Apparecchiatura</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <ModelSelector
                value={watch("id_modello")}
                onSelect={(value) => setValue("id_modello", value || 0, { shouldValidate: true })}
                error={errors.id_modello?.message}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Seriale</label>
              <input
                type="text"
                {...register("seriale")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Inserisci numero seriale"
              />
            </div>
          </div>
        </div>

        {/* Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test e Verifiche</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Test Funzionali
              </label>
              <input
                type="date"
                {...register("data_test_funzionali")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Data Test Elettrici
              </label>
              <input
                type="date"
                {...register("data_test_elettrici")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Note</h2>
          <textarea
            {...register("note")}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
            placeholder="Inserisci eventuali note..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            disabled={loading}
          >
            Annulla
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 inline-flex items-center"
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" variant="white" />
                <span className="ml-2">Creazione...</span>
              </>
            ) : (
              "Crea Apparecchiatura"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
