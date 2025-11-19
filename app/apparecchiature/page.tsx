"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Apparecchiatura {
  id: number;
  id_cliente: number;
  modello: string;
  seriale: string | null;
  data_test_funzionali: string | null;
  data_test_elettrici: string | null;
  note: string | null;
}

export default function ApparecchiaturePage() {
  const [apparecchiature, setApparecchiature] = useState<Apparecchiatura[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchApparecchiature();
  }, []);

  const fetchApparecchiature = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/apparecchiature", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json() as { data?: Apparecchiatura[] };
        setApparecchiature(data.data || []);
      }
    } catch (error) {
      console.error("Error fetching apparecchiature:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8">Caricamento...</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Gestione Apparecchiature</h1>

      <div className="grid gap-4">
        {apparecchiature.map((item) => (
          <div
            key={item.id}
            className="bg-white border rounded-lg p-6 shadow hover:shadow-lg transition-shadow"
          >
            <h3 className="text-xl font-semibold">{item.modello}</h3>
            <p className="text-gray-600 mt-2">
              Seriale: {item.seriale || "N/D"}
            </p>
            <p className="text-gray-600">Cliente ID: {item.id_cliente}</p>
            {item.note && <p className="text-gray-700 mt-2">{item.note}</p>}
            <div className="mt-4 flex gap-4 text-sm text-gray-600">
              {item.data_test_funzionali && (
                <span>Test funzionali: {new Date(item.data_test_funzionali).toLocaleDateString()}</span>
              )}
              {item.data_test_elettrici && (
                <span>Test elettrici: {new Date(item.data_test_elettrici).toLocaleDateString()}</span>
              )}
            </div>
          </div>
        ))}

        {apparecchiature.length === 0 && (
          <p className="text-center text-gray-500 py-8">
            Nessuna apparecchiatura trovata
          </p>
        )}
      </div>
    </div>
  );
}
