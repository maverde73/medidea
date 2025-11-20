"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";

const clienteSchema = z.object({
  nome: z.string().min(1, "Nome obbligatorio"),
  indirizzo: z.string().optional(),
  contatti: z.string().optional(),
});

type ClienteFormData = z.infer<typeof clienteSchema>;

export default function NewClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClienteFormData>({
    resolver: zodResolver(clienteSchema),
  });

  const onSubmit = async (data: ClienteFormData) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/clienti", {
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
        router.push(`/clienti/${result.data.id}`);
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
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Cliente</h1>
        <p className="text-gray-600 mt-2">Compila il form per registrare un nuovo cliente</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Cliente creato con successo!</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Dati Cliente */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dati Cliente</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("nome")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Inserisci nome cliente"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Indirizzo</label>
              <input
                type="text"
                {...register("indirizzo")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Inserisci indirizzo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contatti</label>
              <textarea
                {...register("contatti")}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Inserisci contatti (telefono, email, ecc.)"
              />
            </div>
          </div>
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
              "Crea Cliente"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
