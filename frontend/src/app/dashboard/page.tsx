"use client";
import { useEffect, useState } from "react";
import { FileSpreadsheet, FileText } from "lucide-react";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import Surface from "@/components/ui/Surface";
import { LoadingState, SkeletonDashboard } from "@/components/ui/Loading";
import { api, downloadFile } from "@/lib/api";
import type { ImpactMetrics } from "@/lib/types";
import { toast } from "sonner";

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
      .catch(() => toast.error("No se pudieron cargar las métricas"))
      .finally(() => setLoading(false));
  }, []);

  const download = async (kind: "pdf" | "csv" | "xlsx") => {
    setDownloading(kind);
    try {
      const urls = {
        csv: `/api/metrics/export.csv?year=${year}`,
        xlsx: `/api/metrics/export.xlsx?year=${year}`,
        pdf: `/api/metrics/report.pdf?year=${year}`,
      };
      const filenames = {
        csv: `xama-informe-${year}.csv`,
        xlsx: `xama-informe-${year}.xlsx`,
        pdf: `xama-informe-${year}.pdf`,
      };
      await downloadFile(urls[kind], filenames[kind]);
      toast.success(`Informe ${kind.toUpperCase()} descargado`);
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "Error al descargar el informe"
      );
    } finally {
      setDownloading(null);
    }
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Resumen del impacto {year}
          </p>
        </div>
        {canDownload && (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              loading={downloading === "csv"}
              disabled={downloading !== null}
              icon={<FileSpreadsheet className="h-4 w-4" />}
              onClick={() => download("csv")}
            >
              CSV
            </Button>
            <Button
              variant="success"
              loading={downloading === "xlsx"}
              disabled={downloading !== null}
              icon={<FileSpreadsheet className="h-4 w-4" />}
              onClick={() => download("xlsx")}
            >
              Excel
            </Button>
            <Button
              variant="secondary"
              loading={downloading === "pdf"}
              disabled={downloading !== null}
              icon={<FileText className="h-4 w-4" />}
              onClick={() => download("pdf")}
            >
              Informe PDF
            </Button>
          </div>
        )}
      </div>

            {loading ? (
        <SkeletonDashboard />
      ) : !m ? (
        <p className="text-rose-600">No se pudieron cargar las métricas</p>
      ) : (
        <>
          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Impacto
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <BigCard
                title="Kg recuperados"
                value={m.total_kg_recovered.toFixed(1)}
                unit="kg"
                color="emerald"
                icon="🥕"
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
                icon="🍽"
              />
              <BigCard
                title="Cumplimiento Nevera"
                value={m.nevera_compliance_pct.toFixed(0)}
                unit="%"
                color={m.nevera_compliance_pct >= 80 ? "emerald" : "amber"}
                icon="✓"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Inventario
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card title="Productos" value={m.total_products} icon="📦" />
              <Card title="Lotes" value={m.total_batches} icon="🗂" />
              <Card
                title="Stock total"
                value={`${m.total_kg_recovered.toFixed(1)} kg`}
                icon="⚖️"
              />
              <Card
                title="Caducados"
                value={`${m.expiring_soon_kg.toFixed(1)} kg`}
                accent={m.expiring_soon_kg > 0 ? "rose" : "slate"}
                icon="⚠️"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Familias atendidas
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
              <Card title="Total" value={m.total_families} icon="🏠" />
              <Card
                title="Activas"
                value={m.active_families}
                accent="emerald"
                icon="✓"
              />
              <Card title="Personas" value={m.total_people} icon="👥" />
              <Card title="Reus" value={m.reus_families} icon="📍" />
              <Card
                title="Tarragona"
                value={m.tarragona_families}
                icon="📍"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Repartos y derivaciones
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <Card
                title="Entregas completadas"
                value={m.deliveries_done}
                accent="emerald"
                icon="✓"
              />
              <Card
                title="Entregas pendientes"
                value={m.deliveries_pending}
                icon="⏳"
              />
              <Card
                title="Derivaciones totales"
                value={m.derivations_total}
                icon="📋"
              />
              <Card
                title="Derivaciones servidas"
                value={m.derivations_served}
                accent="emerald"
                icon="✓"
              />
            </div>
          </section>

          <section className="mb-8">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Voluntariado
            </h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card title="Voluntarios" value={m.total_volunteers} icon="🤝" />
              <Card
                title="Horas totales"
                value={m.total_volunteer_hours}
                accent="emerald"
                icon="⏱"
              />
              <Card title="Turnos" value={m.total_shifts} icon="📅" />
            </div>
          </section>

          <p className="text-xs text-slate-400 dark:text-slate-500">
            Última actualización:{" "}
            {new Date(m.generated_at).toLocaleString("es-ES")}
          </p>
        </>
      )}
    </AppShell>
  );
}

function Card({
  title,
  value,
  accent = "slate",
  icon,
}: {
  title: string;
  value: string | number;
  accent?: "slate" | "emerald" | "amber" | "rose";
  icon?: string;
}) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  };
  return (
    <Surface className="p-5">
      <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
        {icon && <span className="mr-1.5">{icon}</span>}
        {title}
      </p>
      <p className={`text-2xl font-semibold tracking-tight ${colors[accent]}`}>
        {value}
      </p>
    </Surface>
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
    <Surface className="p-6">
      <p className="mb-1 text-sm text-slate-500 dark:text-slate-400">
        {icon && <span className="mr-1.5">{icon}</span>}
        {title}
      </p>
      <p className={`text-4xl font-semibold tracking-tight ${colors[color]}`}>
        {value}
        {unit && <span className="ml-1 text-lg font-medium">{unit}</span>}
      </p>
    </Surface>
  );
}
