"use client";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  RefreshCw,
  Trash2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Loading";
import { api } from "@/lib/api";

type Preview = {
  batches_count: number;
  deliveries_count: number;
  families_count: number;
  batches: Array<{
    id: string;
    quantity: number;
    expiry_date: string;
    days_expired: number;
  }>;
  deliveries: Array<{
    id: string;
    delivery_date: string;
    site: string;
    status: string;
  }>;
  families: Array<{
    id: string;
    reference_code: string;
    site: string;
  }>;
};

type CleanupResult = {
  dry_run: boolean;
  batches_deleted: number;
  deliveries_deleted: number;
  families_deactivated: number;
  details: Record<string, number>;
};

export default function MaintenancePage() {
  const [preview, setPreview] = useState<Preview | null>(null);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [batchesDays, setBatchesDays] = useState(30);
  const [deliveriesDays, setDeliveriesDays] = useState(365);
  const [familiesMonths, setFamiliesMonths] = useState(6);

  const { user } = useUser();

  useEffect(() => {
    if (!user || user.role_name !== "junta") return;
    loadPreview();
  }, [user]);

  const loadPreview = async () => {
    setLoading(true);
    setErr(null);
    setResult(null);
    try {
      const p = await api<Preview>(
        `/api/admin/maintenance/preview?batches_expired_days=${batchesDays}&deliveries_before_days=${deliveriesDays}&families_inactive_months=${familiesMonths}`
      );
      setPreview(p);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
      toast.error("Error al calcular la vista previa");
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    if (
      !confirm(
        `Vas a borrar:\n\n• ${preview?.batches_count ?? 0} lotes caducados\n• ${preview?.deliveries_count ?? 0} entregas antiguas\n• Desactivar ${preview?.families_count ?? 0} familias inactivas\n\nEsta acción no se puede deshacer.\n\n¿Continuar?`
      )
    ) {
      return;
    }

    setExecuting(true);
    setErr(null);
    try {
      const r = await api<CleanupResult>("/api/admin/maintenance/cleanup", {
        method: "POST",
        body: JSON.stringify({
          dry_run: false,
          batches_expired_days: batchesDays,
          deliveries_before_days: deliveriesDays,
          families_inactive_months: familiesMonths,
        }),
      });
      setResult(r);
      toast.success(
        `Limpieza completada: ${r.batches_deleted + r.deliveries_deleted + r.families_deactivated} elementos afectados`
      );
      loadPreview();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setExecuting(false);
    }
  };

  if (user && user.role_name !== "junta") {
    return (
      <AppShell>
        <p className="text-rose-600">
          Solo la Junta puede acceder al mantenimiento.
        </p>
      </AppShell>
    );
  }

  const inputCls =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  const totalToDelete =
    (preview?.batches_count ?? 0) +
    (preview?.deliveries_count ?? 0) +
    (preview?.families_count ?? 0);

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Mantenimiento
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Tareas de limpieza para mantener la base de datos ordenada
        </p>
      </div>

      {err && (
        <div className="mb-4 rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {err}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Parámetros de limpieza
          </h2>

          <div className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Lotes caducados hace más de…
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={batchesDays}
                  onChange={(e) => setBatchesDays(Number(e.target.value))}
                  className={inputCls}
                />
                <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  días
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Entregas anteriores a hace…
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="3650"
                  value={deliveriesDays}
                  onChange={(e) => setDeliveriesDays(Number(e.target.value))}
                  className={inputCls}
                />
                <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  días
                </span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Desactivar familias sin entregas desde hace…
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={familiesMonths}
                  onChange={(e) => setFamiliesMonths(Number(e.target.value))}
                  className={inputCls}
                />
                <span className="whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                  meses
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              loading={loading}
              icon={<RefreshCw className="h-4 w-4" />}
              onClick={loadPreview}
              className="w-full"
            >
              {loading ? "Calculando…" : "Actualizar vista previa"}
            </Button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
            Vista previa
          </h2>

          {loading ? (
            <LoadingState label="Calculando…" />
          ) : preview ? (
            <div className="space-y-3">
              <PreviewRow
                label="Lotes caducados"
                count={preview.batches_count}
                color="rose"
              />
              <PreviewRow
                label="Entregas antiguas"
                count={preview.deliveries_count}
                color="amber"
              />
              <PreviewRow
                label="Familias a desactivar"
                count={preview.families_count}
                color="slate"
              />

              <Button
                variant="danger"
                loading={executing}
                disabled={executing || totalToDelete === 0}
                icon={<Trash2 className="h-4 w-4" />}
                onClick={runCleanup}
                className="mt-4 w-full"
              >
                {executing ? "Ejecutando…" : "Ejecutar limpieza"}
              </Button>

              {totalToDelete > 0 && !result && (
                <p className="flex items-start gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" />
                  Esta acción no se puede deshacer. La vista previa se
                  actualizará después de ejecutar.
                </p>
              )}
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400">
              Pulsa "Actualizar vista previa"
            </p>
          )}

          {result && (
            <div className="mt-4 rounded-md bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ Limpieza completada:
              <ul className="mt-2 ml-4 list-disc space-y-0.5">
                <li>{result.batches_deleted} lotes borrados</li>
                <li>{result.deliveries_deleted} entregas borradas</li>
                <li>
                  {result.families_deactivated} familias desactivadas
                </li>
              </ul>
            </div>
          )}
        </section>
      </div>

      {preview && preview.batches_count > 0 && (
        <DetailSection title="Lotes a borrar" count={preview.batches_count}>
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Cantidad</th>
                <th className="px-3 py-2">Caducó</th>
                <th className="px-3 py-2">Días vencido</th>
              </tr>
            </thead>
            <tbody className="dark:text-slate-200">
              {preview.batches.slice(0, 20).map((b) => (
                <tr
                  key={b.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-1.5">{b.quantity}</td>
                  <td className="px-3 py-1.5">{b.expiry_date}</td>
                  <td className="px-3 py-1.5 font-medium text-rose-600 dark:text-rose-400">
                    {b.days_expired}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>
      )}

      {preview && preview.deliveries_count > 0 && (
        <DetailSection
          title="Entregas a borrar"
          count={preview.deliveries_count}
        >
          <table className="w-full text-xs">
            <thead className="bg-slate-50 text-left text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-3 py-2">Fecha</th>
                <th className="px-3 py-2">Sede</th>
                <th className="px-3 py-2">Estado</th>
              </tr>
            </thead>
            <tbody className="dark:text-slate-200">
              {preview.deliveries.slice(0, 20).map((d) => (
                <tr
                  key={d.id}
                  className="border-t border-slate-100 dark:border-slate-800"
                >
                  <td className="px-3 py-1.5">{d.delivery_date}</td>
                  <td className="px-3 py-1.5 capitalize">{d.site}</td>
                  <td className="px-3 py-1.5">{d.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </DetailSection>
      )}
    </AppShell>
  );
}

function PreviewRow({
  label,
  count,
  color,
}: {
  label: string;
  count: number;
  color: "rose" | "amber" | "slate";
}) {
  const colors = {
    rose: "text-rose-600 dark:text-rose-400",
    amber: "text-amber-600 dark:text-amber-400",
    slate: "text-slate-900 dark:text-white",
  };
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950">
      <span className="text-sm text-slate-700 dark:text-slate-300">
        {label}
      </span>
      <span className={`text-xl font-bold ${colors[color]}`}>{count}</span>
    </div>
  );
}

function DetailSection({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-6 rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50"
      >
        <span className="text-sm font-semibold text-slate-900 dark:text-white">
          {title} ({count})
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>
      {open && (
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          {children}
        </div>
      )}
    </section>
  );
}
