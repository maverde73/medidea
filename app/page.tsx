"use client";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <main className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Medidea
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Sistema di gestione attività giornaliere e apparecchiature
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Gestione Attività
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Registra e monitora attività giornaliere, interventi e documenti
              </p>
              <button
                onClick={() => router.push("/attivita")}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Vai alle Attività
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Gestione Apparecchiature
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Monitora test elettrici, funzionali e documentazione tecnica
              </p>
              <button
                onClick={() => router.push("/apparecchiature")}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors"
              >
                Vai alle Apparecchiature
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
