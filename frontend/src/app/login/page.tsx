"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api, setToken } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@xama.local");
  const [password, setPassword] = useState("admin1234");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{ access_token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      setToken(res.access_token);
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "mb-4 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:focus:ring-emerald-500";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-4 dark:bg-slate-950">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl bg-white p-8 shadow-lg dark:bg-slate-900"
      >
        <h1 className="mb-1 text-2xl font-bold text-slate-900 dark:text-white">
          XAMA-ONG
        </h1>
        <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">
          Accede a la plataforma
        </p>

        <Link
          href="/public"
          className="mb-6 block text-center text-xs text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
        >
          ← Volver a la portada pública
        </Link>

        {error && (
          <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {error}
          </div>
        )}

        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Email
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputCls}
          required
        />

        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Contraseña
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputCls} mb-6`}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {loading ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </div>
  );
}
