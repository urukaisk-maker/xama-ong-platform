"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import { api, downloadFile } from "@/lib/api";
import type { HoursSummary } from "@/lib/types";

export default function VolunteersPage() {
  const [data, setData] = useState<HoursSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { user } = useUser();
  const canDownloadForOthers =
    user?.role_name === "junta" ||
    user?.role_name === "coordinador_reus" ||
    user?.role_name === "coordinador_tarragona";

  useEffect(() => {
    api<HoursSummary>("/api/volunteers/hours/summary")
      .then(setData)
      .catch((e) => setErr(e instanceof Error ? e.message : "Error"))
      .finally(() => setLoading(false));
  }, []);

  const downloadMine = async () => {
    setDownloading("me");
    try {
      await downloadFile(
        "/api/volunteers/me/certificate.pdf",
        "mi-certificado-xama.pdf"
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setDownloading(null);
    }
  };

  const downloadFor = async (userId: string, name: string) => {
    setDownloading(userId);
    try {
      await downloadFile(
        `/api/volunteers/${userId}/certificate.pdf`,
        `certificado-${name.replace(/\s+/g, "_")}.pdf`
      );
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Voluntariado
        </h1>
        <button
          onClick={downloadMine}
          disabled={downloading !== null}
          className="rounded-md bg-emerald-600 px-4 py-2 text-sm text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          {downloading === "me" ? "Generando…" : "Descargar mi certificado"}
        </button>
      </div>

      {loading && (
        <p className="text-slate-500 dark:text-slate-400">Cargando…</p>
      )}
      {err && <p className="text-rose-600">{err}</p>}

      {data && (
        <>
          <div className="mb-6 grid grid-cols-3 gap-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Voluntarios
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.total_volunteers}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Horas totales
              </p>
              <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                {data.total_hours}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Turnos asignados
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">
                {data.total_shifts_assigned}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Voluntario</th>
                  <th className="px-4 py-3">Horas</th>
                  <th className="px-4 py-3">Turnos</th>
                  <th className="px-4 py-3">Asistidos</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="dark:text-slate-200">
                {data.ranking.map((v, i) => (
                  <tr
                    key={v.user_id}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-4 py-3 text-slate-400 dark:text-slate-500">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 font-medium">{v.full_name}</td>
                    <td className="px-4 py-3">{v.total_hours}</td>
                    <td className="px-4 py-3">{v.total_shifts}</td>
                    <td className="px-4 py-3">{v.shifts_attended}</td>
                    <td className="px-4 py-3 text-right">
                      {canDownloadForOthers && (
                        <button
                          onClick={() => downloadFor(v.user_id, v.full_name)}
                          disabled={downloading !== null}
                          className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                        >
                          {downloading === v.user_id ? "…" : "Certificado"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {data.ranking.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                    >
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
