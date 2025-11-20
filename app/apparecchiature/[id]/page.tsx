"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { LoadingSpinner, ErrorAlert } from "@/components/ui";

interface Apparecchiatura {
  id: number;
  id_cliente: number;
  modello: string;
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
  const id = params.id as string;

  const [apparecchiatura, setApparecchiatura] = useState<Apparecchiatura | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchApparecchiatura();
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
        <h1 className="text-3xl font-bold text-gray-900">
          Apparecchiatura #{apparecchiatura.id}
        </h1>
        <p className="text-gray-600 mt-1">
          Creata il {formatDate(apparecchiatura.created_at)}
        </p>
      </div>

        {/* Cliente */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dati Cliente</h2>
          <p className="text-gray-700">Cliente ID: {apparecchiatura.id_cliente}</p>
        </div>

        {/* Dati Apparecchiatura */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Dati Apparecchiatura</h2>
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
        </div>

        {/* Test e Verifiche */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test e Verifiche</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Data Test Funzionali</p>
              <p className="text-gray-900 font-medium">
                {formatDate(apparecchiatura.data_test_funzionali)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Data Test Elettrici</p>
              <p className="text-gray-900 font-medium">
                {formatDate(apparecchiatura.data_test_elettrici)}
              </p>
            </div>
          </div>
        </div>

        {/* Note */}
        {apparecchiatura.note && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Note</h2>
            <p className="text-gray-700 whitespace-pre-wrap">{apparecchiatura.note}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {deleting ? "Eliminazione..." : "Elimina Apparecchiatura"}
          </button>
        </div>
    </div>
  );
}
