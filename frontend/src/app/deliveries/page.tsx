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
  const [showForm, setShowForm] = useState(false);

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

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Entregas del día
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
        >
          {showForm ? "Cancelar" : "+ Nueva entrega"}
        </button>
      </div>

      {showForm && (
        <NewDeliveryForm
          families={families}
          defaultSite={site}
          defaultDate={date}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      <div className="mb-6 flex gap-3">
        <select
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className={inputCls}
        >
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className={`rounded-xl border bg-white p-4 dark:bg-slate-900 ${
                d.status === "entregada"
                  ? "border-emerald-200 dark:border-emerald-800"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {d.id.slice(0, 8)}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {familyName(d.family_id)}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    d.status === "entregada"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  }`}
                >
                  {d.status}
                </span>
              </div>

              {d.checked_in_at && (
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Entregada:{" "}
                  {new Date(d.checked_in_at).toLocaleString("es-ES")}
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
            <p className="text-slate-400 dark:text-slate-500">
              Sin entregas programadas
            </p>
          )}
        </div>
      )}
    </AppShell>
  );
}

function NewDeliveryForm({
  families,
  defaultSite,
  defaultDate,
  onCreated,
}: {
  families: Family[];
  defaultSite: string;
  defaultDate: string;
  onCreated: () => void;
}) {
  const [familyId, setFamilyId] = useState(families[0]?.id ?? "");
  const [deliveryDate, setDeliveryDate] = useState(defaultDate);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (families.length && !familyId) setFamilyId(families[0].id);
  }, [families, familyId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/api/deliveries", {
        method: "POST",
        body: JSON.stringify({
          family_id: familyId,
          delivery_date: deliveryDate,
          site: defaultSite,
          notes: notes || null,
        }),
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <form
      onSubmit={submit}
      className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          value={familyId}
          onChange={(e) => setFamilyId(e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Selecciona familia</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.reference_code} · {f.adults + f.minors} personas
            </option>
          ))}
        </select>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className={inputCls}
          required
        />
        <input
          placeholder="Notas"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputCls}
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <button
        type="submit"
        disabled={loading || !familyId}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
      >
        {loading ? "Creando…" : "Crear entrega"}
      </button>
    </form>
  );
}
