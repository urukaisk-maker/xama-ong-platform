"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Delivery, Family } from "@/lib/types";

export default function DeliveriesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [site, setSite] = useState("reus");
  const [date, setDate] = useState(today);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [d, f] = await Promise.all([
      api<Delivery[]>(`/api/deliveries?site=${site}&date=${date}`),
      api<Family[]>(`/api/families?site=${site}`),
    ]);
    setDeliveries(d);
    setFamilies(f);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [site, date]);

  const familyName = (id: string) =>
    families.find((f) => f.id === id)?.reference_code ?? id.slice(0, 8);

  const checkIn = async (id: string) => {
    await api(`/api/deliveries/${id}/check-in`, {
      method: "PATCH",
      body: JSON.stringify({ notes: "Entregada" }),
    });
    load();
  };

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Entregas del día</h1>

      <div className="mb-6 flex gap-3">
        <select
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className={`rounded-xl border bg-white p-4 ${
                d.status === "entregada"
                  ? "border-emerald-200"
                  : "border-slate-200"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-slate-500">
                    {d.id.slice(0, 8)}
                  </p>
                  <p className="font-semibold">{familyName(d.family_id)}</p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    d.status === "entregada"
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {d.status}
                </span>
              </div>

              {d.checked_in_at && (
                <p className="mb-2 text-xs text-slate-500">
                  Entregada: {new Date(d.checked_in_at).toLocaleString("es-ES")}
                </p>
              )}

              {d.status !== "entregada" && (
                <button
                  onClick={() => checkIn(d.id)}
                  className="w-full rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Marcar como entregada
                </button>
              )}
            </div>
          ))}
          {deliveries.length === 0 && (
            <p className="text-slate-400">Sin entregas programadas</p>
          )}
        </div>
      )}
    </AppShell>
  );
}
