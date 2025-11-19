"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Attivita {
  id: number;
  id_cliente: number;
  modello: string | null;
  seriale: string | null;
  stato: string;
  data_apertura_richiesta: string | null;
  data_chiusura: string | null;
  note_generali: string | null;
}

export default function AttivitaPage() {
  const [attivita, setAttivita] = useState<Attivita[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ stato: "", modello: "" });
  const router = useRouter();

  useEffect(() => {
    fetchAttivita();
  }, []);

  const fetchAttivita = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();
      if (filter.stato) params.append("stato", filter.stato);
      if (filter.modello) params.append("modello", filter.modello);

      const response = await fetch(`/api/attivita?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data?: Attivita[] };
        setAttivita(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching attivita:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Caricamento...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Gestione Attività</h1>

      <div className="mb-6 flex gap-4">
        <select
          className="px-4 py-2 border rounded"
          value={filter.stato}
          onChange={(e) => setFilter({ ...filter, stato: e.target.value })}
        >
          <option value="">Tutti gli stati</option>
          <option value="APERTO">Aperto</option>
          <option value="CHIUSO">Chiuso</option>
          <option value="RIAPERTO">Riaperto</option>
        </select>

        <input
          type="text"
          placeholder="Cerca per modello..."
          className="px-4 py-2 border rounded flex-1"
          value={filter.modello}
          onChange={(e) => setFilter({ ...filter, modello: e.target.value })}
        />

        <button
          onClick={fetchAttivita}
          className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Filtra
        </button>
      </div>

      <div className="grid gap-4">
        {attivita.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/attivita/${item.id}`)}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">
                  {item.modello || "N/D"} - {item.seriale || "N/D"}
                </h3>
                <p className="text-gray-600 mt-2">
                  Cliente ID: {item.id_cliente}
                </p>
                {item.note_generali && (
                  <p className="text-gray-700 mt-2">{item.note_generali}</p>
                )}
              </div>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  item.stato === "APERTO"
                    ? "bg-green-100 text-green-800"
                    : item.stato === "CHIUSO"
                    ? "bg-gray-100 text-gray-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {item.stato}
              </span>
            </div>
          </div>
        ))}

        {attivita.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nessuna attività trovata
          </p>
        )}
      </div>
    </div>
  );
}
