"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";
import { TechnicianSelect } from "@/components/tecnici/TechnicianSelect";

const utenteSchema = z.object({
  email: z.string().email("Email non valida"),
  password: z.string().min(8, "La password deve essere di almeno 8 caratteri"),
  nome: z.string().min(1, "Nome obbligatorio"),
  cognome: z.string().min(1, "Cognome obbligatorio"),
  role: z.enum(["admin", "user", "tecnico"]),
  active: z.boolean(),
  id_tecnico: z.number().optional(),
});

type UtenteFormData = z.infer<typeof utenteSchema>;

export default function NewUtentePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UtenteFormData>({
    resolver: zodResolver(utenteSchema),
    defaultValues: {
      active: true,
      role: "user",
    },
  });

  const onSubmit = async (data: UtenteFormData) => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/utenti", {
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
        router.push(`/utenti/${result.data.id}`);
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
        <h1 className="text-3xl font-bold text-gray-900">Nuovo Utente</h1>
        <p className="text-gray-600 mt-2">Compila il form per creare un nuovo utente</p>
      </div>

      {error && <ErrorAlert message={error} onDismiss={() => setError("")} />}

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✓ Utente creato con successo!</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Dati Account */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dati Account</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("email")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="utente@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Almeno 8 caratteri"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dati Personali */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Dati Personali</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("nome")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Inserisci nome"
              />
              {errors.nome && (
                <p className="mt-1 text-sm text-red-600">{errors.nome.message}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cognome <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("cognome")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
                placeholder="Inserisci cognome"
              />
              {errors.cognome && (
                <p className="mt-1 text-sm text-red-600">{errors.cognome.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Ruolo e Permessi */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Ruolo e Permessi</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ruolo <span className="text-red-500">*</span>
              </label>
              <select
                {...register("role")}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500"
              >
                <option value="user">Utente</option>
                <option value="tecnico">Tecnico</option>
                <option value="admin">Amministratore</option>
              </select>
              {errors.role && (
                <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                {...register("active")}
                className="w-4 h-4 text-primary-500 border-gray-300 rounded focus:ring-primary-500"
                id="active"
              />
              <label htmlFor="active" className="ml-2 block text-sm text-gray-700">
                Account attivo
              </label>
            </div>

            {/* Selezione Tecnico (solo se ruolo è tecnico) */}
            {watch("role") === "tecnico" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Associa Tecnico
                </label>
                <TechnicianSelect
                  value={watch("id_tecnico")?.toString()}
                  onChange={(val) => setValue("id_tecnico", parseInt(val))}
                  onTechnicianSelect={(tecnico) => {
                    if (tecnico) {
                      setValue("nome", tecnico.nome);
                      setValue("cognome", tecnico.cognome);
                    }
                  }}
                  availableForUserOnly={true}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Seleziona il tecnico da associare a questo utente. Nome e Cognome verranno compilati automaticamente.
                </p>
              </div>
            )}
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
              "Crea Utente"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
