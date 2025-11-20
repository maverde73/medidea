"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json() as {
        success?: boolean;
        token?: string;
        user?: { email: string; role: string };
        error?: string;
      };

      if (response.ok && data.success) {
        localStorage.setItem("token", data.token!);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/attivita");
      } else {
        setError(data.error || "Login fallito");
      }
    } catch (err) {
      setError("Errore di connessione");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Medidea Login</h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Inserisci email"
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-2 border rounded focus:outline-none focus:border-primary-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-500 text-white py-2 rounded hover:bg-primary-600 disabled:bg-gray-400"
          >
            {loading ? "Accesso..." : "Accedi"}
          </button>
        </form>

        <p className="mt-4 text-sm text-gray-600 text-center">
          Dev: admin@medidea.local / qualsiasi password
        </p>
      </div>
    </div>
  );
}
