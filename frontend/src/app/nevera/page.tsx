"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Derivation, Ration, RationSummary } from "@/lib/types";

export default function NeveraPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [rations, setRations] = useState<Ration[]>([]);
  const [summary, setSummary] = useState<RationSummary | null>(null);
  const [derivations, setDerivations] = useState<Derivation[]>([]);
  const [loading, setLoading] = useState(true);

  const [target, setTarget] = useState(20);
  const [served, setServed] = useState(0);
  const [rationDate, setRationDate] = useState(today);

  const [derivForm, setDerivForm] = useState({
    reference_code: "",
    person_name: "",
    origin: "servicios_sociales",
    reason: "",
    rations: 1,
  });
  const [derivErr, setDerivErr] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const [r, s, d] = await Promise.all([
      api<Ration[]>("/api/nevera/rations"),
      api<RationSummary>("/api/nevera/rations/summary"),
      api<Derivation[]>("/api/nevera/derivations"),
    ]);
    setRations(r);
    setSummary(s);
    setDerivations(d);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const saveRation = async (e: React.FormEvent) => {
    e.preventDefault();
    await api("/api/nevera/rations", {
      method: "POST",
      body: JSON.stringify({
        date: rationDate,
        target_rations: target,
        served_rations: served,
      }),
    });
    load();
  };

  const createDerivation = async (e: React.FormEvent) => {
    e.preventDefault();
    setDerivErr(null);
    try {
      await api("/api/nevera/derivations", {
        method: "POST",
        body: JSON.stringify(derivForm),
      });
      setDerivForm({
        reference_code: "",
        person_name: "",
        origin: "servicios_sociales",
        reason: "",
        rations: 1,
      });
      load();
    } catch (e) {
      setDerivErr(e instanceof Error ? e.message : "Error");
    }
  };

  const serve = async (id: string) => {
    try {
      await api(`/api/nevera/derivations/${id}/serve`, { method: "PATCH" });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  const inputCls =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
        Nevera Solidària
      </h1>

      {summary && (
        <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          <Stat label="Días registrados" value={summary.total_days} />
          <Stat
            label="Raciones servidas"
            value={summary.total_served}
            accent="emerald"
          />
          <Stat label="Media diaria" value={summary.avg_served} />
          <Stat
            label="Cumplimiento"
            value={`${summary.compliance_pct}%`}
            accent={summary.compliance_pct >= 80 ? "emerald" : "amber"}
          />
        </div>
      )}

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <form
          onSubmit={saveRation}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Registrar raciones del día
          </h2>
          <div className="space-y-3">
            <input
              type="date"
              value={rationDate}
              onChange={(e) => setRationDate(e.target.value)}
              className={inputCls}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="mb-1 block text-slate-500 dark:text-slate-400">
                  Objetivo
                </span>
                <input
                  type="number"
                  min="0"
                  value={target}
                  onChange={(e) => setTarget(Number(e.target.value))}
                  className={inputCls}
                />
              </label>
              <label className="text-sm">
                <span className="mb-1 block text-slate-500 dark:text-slate-400">
                  Servidas
                </span>
                <input
                  type="number"
                  min="0"
                  value={served}
                  onChange={(e) => setServed(Number(e.target.value))}
                  className={inputCls}
                />
              </label>
            </div>
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              Guardar
            </button>
          </div>
        </form>

        <form
          onSubmit={createDerivation}
          className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Nueva derivación
          </h2>
          <div className="space-y-3">
            <input
              placeholder="Referencia (DER-XXXX)"
              value={derivForm.reference_code}
              onChange={(e) =>
                setDerivForm({ ...derivForm, reference_code: e.target.value })
              }
              className={inputCls}
              required
            />
            <input
              placeholder="Nombre (opcional)"
              value={derivForm.person_name}
              onChange={(e) =>
                setDerivForm({ ...derivForm, person_name: e.target.value })
              }
              className={inputCls}
            />
            <select
              value={derivForm.origin}
              onChange={(e) =>
                setDerivForm({ ...derivForm, origin: e.target.value })
              }
              className={inputCls}
            >
              <option value="servicios_sociales">Servicios Sociales</option>
              <option value="policia_local">Policía Local</option>
              <option value="cruz_roja">Cruz Roja</option>
              <option value="voluntario">Voluntario/a</option>
              <option value="otro">Otro</option>
            </select>
            <input
              placeholder="Motivo"
              value={derivForm.reason}
              onChange={(e) =>
                setDerivForm({ ...derivForm, reason: e.target.value })
              }
              className={inputCls}
            />
            <input
              type="number"
              min="1"
              value={derivForm.rations}
              onChange={(e) =>
                setDerivForm({ ...derivForm, rations: Number(e.target.value) })
              }
              className={inputCls}
              placeholder="Raciones"
            />
            {derivErr && <p className="text-sm text-rose-600">{derivErr}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              Crear derivación
            </button>
          </div>
        </form>
      </div>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
          Histórico de raciones
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Objetivo</th>
                <th className="px-4 py-3">Servidas</th>
                <th className="px-4 py-3">Cumplimiento</th>
              </tr>
            </thead>
            <tbody className="dark:text-slate-200">
              {rations.slice(0, 14).map((r) => {
                const pct = (r.served_rations / r.target_rations) * 100;
                return (
                  <tr
                    key={r.id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 font-medium">{r.date}</td>
                    <td className="px-4 py-3">{r.target_rations}</td>
                    <td className="px-4 py-3">{r.served_rations}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          pct >= 80
                            ? "font-medium text-emerald-600 dark:text-emerald-400"
                            : "font-medium text-amber-600 dark:text-amber-400"
                        }
                      >
                        {pct.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {rations.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                  >
                    Sin registros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
          Derivaciones
        </h2>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Referencia</th>
                <th className="px-4 py-3">Persona</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Raciones</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="dark:text-slate-200">
              {derivations.map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {d.reference_code}
                  </td>
                  <td className="px-4 py-3">{d.person_name ?? "Anónimo"}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {d.origin}
                  </td>
                  <td className="px-4 py-3">{d.rations}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        d.status === "servida"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                      }`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.status !== "servida" && (
                      <button
                        onClick={() => serve(d.id)}
                        className="rounded-md bg-emerald-600 px-3 py-1 text-xs text-white hover:bg-emerald-700"
                      >
                        Servir
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {derivations.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                  >
                    Sin derivaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}

function Stat({
  label,
  value,
  accent = "slate",
}: {
  label: string;
  value: string | number;
  accent?: "slate" | "emerald" | "amber";
}) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[accent]}`}>{value}</p>
    </div>
  );
}
