"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import { api, downloadFile } from "@/lib/api";
import type { ImpactMetrics } from "@/lib/types";

export default function DashboardPage() {
  const [m, setM] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  const { user } = useUser();
  const canDownload =
    user?.role_name === "junta" ||
    user?.role_name === "coordinador_reus" ||
    user?.role_name === "coordinador_tarragona";

  const year = new Date().getFullYear();

  useEffect(() => {
    api<ImpactMetrics>("/api/metrics/impact")
      .then(setM)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const download = async (kind: "pdf" | "csv" | "xlsx") => {
    setDownloading(kind);
    try {
      if (kind === "pdf") {
        await downloadFile(
          `/api/metrics/report.pdf?year=${year}`,
          `xama-informe-${year}.pdf`
        );
      } else if (kind === "csv") {
        await downloadFile(
          `/api/metrics/export.csv?year=${year}`,
          `xama-informe-${year}.csv`
        );
      } else {
        await downloadFile(
          `/api/metrics/export.xlsx?year=${year}`,
          `xama-informe-${year}.xlsx`
        );
      }
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al descargar");
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        {canDownload && (
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => download("csv")}
              disabled={downloading !== null}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {downloading === "csv" ? "…" : "CSV"}
            </button>
            <button
              onClick={() => download("xlsx")}
              disabled={downloading !== null}
              className="rounded-md border border-emerald-300 bg-emerald-50 px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
            >
              {downloading === "xlsx" ? "…" : "Excel"}
            </button>
            <button
              onClick={() => download("pdf")}
              disabled={downloading !== null}
              className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            >
              {downloading === "pdf" ? "…" : "PDF"}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando…</p>
      ) : !m ? (
        <p className="text-rose-600">No se pudieron cargar las métricas</p>
      ) : (
        <>
          <Section title="Impacto">
            <BigCard
              title="Kg recuperados"
              value={m.total_kg_recovered.toFixed(1)}
              unit="kg"
              color="emerald"
            />
            <BigCard
              title="CO₂ evitado"
              value={m.co2_avoided_kg.toFixed(1)}
              unit="kg"
              color="emerald"
              icon="🌱"
            />
            <BigCard
              title="Raciones Nevera"
              value={m.nevera_served}
              unit={`/ ${m.nevera_target}`}
              color="slate"
            />
            <BigCard
              title="Cumplimiento Nevera"
              value={m.nevera_compliance_pct.toFixed(0)}
              unit="%"
              color={m.nevera_compliance_pct >= 80 ? "emerald" : "amber"}
            />
          </Section>

          <Section title="Inventario" cols="md:grid-cols-4">
            <Card title="Productos" value={m.total_products} />
            <Card title="Lotes" value={m.total_batches} />
            <Card
              title="Stock total"
              value={`${m.total_kg_recovered.toFixed(1)} kg`}
            />
            <Card
              title="Caducados"
              value={`${m.expiring_soon_kg.toFixed(1)} kg`}
              accent={m.expiring_soon_kg > 0 ? "rose" : "slate"}
            />
          </Section>

          <Section title="Familias atendidas" cols="md:grid-cols-5">
            <Card title="Total" value={m.total_families} />
            <Card title="Activas" value={m.active_families} accent="emerald" />
            <Card title="Personas" value={m.total_people} />
            <Card title="Reus" value={m.reus_families} />
            <Card title="Tarragona" value={m.tarragona_families} />
          </Section>

          <Section title="Repartos y derivaciones">
            <Card
              title="Entregas completadas"
              value={m.deliveries_done}
              accent="emerald"
            />
            <Card title="Entregas pendientes" value={m.deliveries_pending} />
            <Card title="Derivaciones totales" value={m.derivations_total} />
            <Card
              title="Derivaciones servidas"
              value={m.derivations_served}
              accent="emerald"
            />
          </Section>

          <Section title="Voluntariado" cols="md:grid-cols-3">
            <Card title="Voluntarios" value={m.total_volunteers} />
            <Card
              title="Horas totales"
              value={m.total_volunteer_hours}
              accent="emerald"
            />
            <Card title="Turnos" value={m.total_shifts} />
          </Section>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Última actualización:{" "}
            {new Date(m.generated_at).toLocaleString("es-ES")}
          </p>
        </>
      )}
    </AppShell>
  );
}

function Section({
  title,
  children,
  cols = "md:grid-cols-4",
}: {
  title: string;
  children: React.ReactNode;
  cols?: string;
}) {
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500 dark:text-slate-400">
        {title}
      </h2>
      <div className={`grid grid-cols-1 gap-4 ${cols}`}>{children}</div>
    </section>
  );
}

function Card({
  title,
  value,
  accent = "slate",
}: {
  title: string;
  value: string | number;
  accent?: "slate" | "emerald" | "amber" | "rose";
}) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      <p className={`mt-1 text-2xl font-bold ${colors[accent]}`}>{value}</p>
    </div>
  );
}

function BigCard({
  title,
  value,
  unit,
  color,
  icon,
}: {
  title: string;
  value: string | number;
  unit?: string;
  color: "slate" | "emerald" | "amber";
  icon?: string;
}) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
        {icon && <span className="mr-1">{icon}</span>}
        {title}
      </p>
      <p className={`text-4xl font-bold ${colors[color]}`}>
        {value}
        {unit && <span className="ml-1 text-lg font-medium">{unit}</span>}
      </p>
    </div>
  );
}
