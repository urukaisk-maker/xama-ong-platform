"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { HoursSummary } from "@/lib/types";

export default function VolunteersPage() {
  const [data, setData] = useState<HoursSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    api<HoursSummary>("/api/volunteers/hours/summary")
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Voluntariado</h1>

      {loading && <p className="text-slate-500">Cargando…</p>}
      {err && <p className="text-rose-600">{err}</p>}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Voluntarios</p>
              <p className="text-3xl font-bold">{data.total_volunteers}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Horas totales</p>
              <p className="text-3xl font-bold text-emerald-600">
                {data.total_hours}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <p className="text-sm text-slate-500">Turnos asignados</p>
              <p className="text-3xl font-bold">{data.total_shifts_assigned}</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Voluntario</th>
                  <th className="px-4 py-3">Horas</th>
                  <th className="px-4 py-3">Turnos</th>
                  <th className="px-4 py-3">Asistidos</th>
                </tr>
              </thead>
              <tbody>
                {data.ranking.map((v, i) => (
                  <tr key={v.user_id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-slate-400">{i + 1}</td>
                    <td className="px-4 py-3 font-medium">{v.full_name}</td>
                    <td className="px-4 py-3">{v.total_hours}</td>
                    <td className="px-4 py-3">{v.total_shifts}</td>
                    <td className="px-4 py-3">{v.shifts_attended}</td>
                  </tr>
                ))}
                {data.ranking.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                      Sin datos
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}
