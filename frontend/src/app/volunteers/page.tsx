"use client";
import { useEffect, useState } from "react";
import { Award, Download, Users, Clock, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import Surface from "@/components/ui/Surface";
import { LoadingState, SkeletonKPI, SkeletonTable } from "@/components/ui/Loading";
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
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Error";
        setErr(msg);
        toast.error("Error al cargar el voluntariado");
      })
      .finally(() => setLoading(false));
  }, []);

  const downloadMine = async () => {
    setDownloading("me");
    try {
      await downloadFile(
        "/api/volunteers/me/certificate.pdf",
        "mi-certificado-xama.pdf"
      );
      toast.success("Certificado descargado");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
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
      toast.success(`Certificado de ${name} descargado`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Voluntariado
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Ranking de horas aportadas y certificados
          </p>
        </div>
        <Button
          variant="success"
          loading={downloading === "me"}
          disabled={downloading !== null}
          icon={<Award className="h-4 w-4" />}
          onClick={downloadMine}
        >
          {downloading === "me" ? "Generando…" : "Descargar mi certificado"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-6">
          <SkeletonKPI count={3} cols="md:grid-cols-3" />
          <SkeletonTable rows={8} cols={6} />
        </div>
      ) : err ? (
        <p className="text-rose-600">{err}</p>
      ) : !data ? null : (
        <>
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
            <StatCard
              icon={<Users className="h-5 w-5" />}
              label="Voluntarios"
              value={data.total_volunteers}
              color="slate"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Horas totales"
              value={data.total_hours}
              color="emerald"
            />
            <StatCard
              icon={<TrendingUp className="h-5 w-5" />}
              label="Turnos asignados"
              value={data.total_shifts_assigned}
              color="slate"
            />
          </div>

          <Surface hover={false} className="overflow-hidden">
            <table className="w-full text-sm">
              <thead className="border-b border-slate-200/60 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800/60 dark:bg-slate-800/40 dark:text-slate-400">
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
                {data.ranking.map((v, i) => {
                  const isTop3 = i < 3;
                  return (
                    <tr
                      key={v.user_id}
                      className={`border-t border-slate-100/60 transition-colors hover:bg-slate-50/80 dark:border-slate-800/60 dark:hover:bg-slate-800/40 ${
                        isTop3 ? "bg-emerald-50/30 dark:bg-emerald-950/10" : ""
                      }`}
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                            i === 0
                              ? "bg-amber-400/20 text-amber-700 dark:text-amber-300"
                              : i === 1
                              ? "bg-slate-300/30 text-slate-700 dark:text-slate-200"
                              : i === 2
                              ? "bg-orange-400/20 text-orange-700 dark:text-orange-300"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={v.full_name} size="md" />
                          <span className="font-medium">{v.full_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        {v.total_hours} h
                      </td>
                      <td className="px-4 py-3">{v.total_shifts}</td>
                      <td className="px-4 py-3">{v.shifts_attended}</td>
                      <td className="px-4 py-3 text-right">
                        {canDownloadForOthers && (
                          <Button
                            size="sm"
                            variant="outline"
                            loading={downloading === v.user_id}
                            disabled={downloading !== null}
                            icon={<Download className="h-3.5 w-3.5" />}
                            onClick={() => downloadFor(v.user_id, v.full_name)}
                          >
                            Certificado
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {data.ranking.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                    >
                      Sin datos todavía
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Surface>
        </>
      )}
    </AppShell>
  );
}

function StatCard({
  icon,
  label,
  value,
  color = "slate",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color?: "slate" | "emerald";
}) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600 dark:text-emerald-400",
  };
  return (
    <Surface className="p-5">
      <div className="mb-2 flex items-center gap-2 text-slate-400">
        {icon}
        <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
      </div>
      <p
        className={`text-3xl font-semibold tracking-tight ${colors[color]}`}
      >
        {value}
      </p>
    </Surface>
  );
}
