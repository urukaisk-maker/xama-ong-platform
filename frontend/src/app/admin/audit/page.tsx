"use client";
import { useEffect, useState } from "react";
import { ClipboardList, Filter, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Loading";
import { api } from "@/lib/api";

type Entry = {
  id: string;
  user_email: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  description: string | null;
  created_at: string | null;
};

type LogResponse = {
  total: number;
  limit: number;
  offset: number;
  entries: Entry[];
};

type Summary = {
  days: number;
  by_action: Array<{ action: string; count: number }>;
  top_users: Array<{ email: string; count: number }>;
  by_resource: Array<{ resource: string; count: number }>;
};

const ACTION_COLORS: Record<string, string> = {
  delete: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
  soft_delete:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  deactivate:
    "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  restore:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  maintenance_cleanup:
    "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  donation_certificate:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

const ACTION_LABELS: Record<string, string> = {
  delete: "borrado",
  soft_delete: "desactivado (soft)",
  deactivate: "desactivado",
  restore: "restaurado",
  maintenance_cleanup: "limpieza",
  donation_certificate: "certificado donación",
};

export default function AuditPage() {
  const [data, setData] = useState<LogResponse | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState("");
  const [resourceFilter, setResourceFilter] = useState("");
  const [daysFilter, setDaysFilter] = useState<number>(30);

  const { user } = useUser();

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "100" });
      if (actionFilter) params.set("action", actionFilter);
      if (resourceFilter) params.set("resource_type", resourceFilter);
      if (daysFilter) params.set("days", String(daysFilter));

      const [d, s] = await Promise.all([
        api<LogResponse>(`/api/audit/log?${params.toString()}`),
        api<Summary>(`/api/audit/summary?days=${daysFilter}`),
      ]);
      setData(d);
      setSummary(s);
    } catch {
      toast.error("Error al cargar el registro de auditoría");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role_name === "junta") load();
  }, [user, actionFilter, resourceFilter, daysFilter]);

  if (user && user.role_name !== "junta") {
    return (
      <AppShell>
        <p className="text-rose-600">
          Solo la Junta puede ver el registro de auditoría.
        </p>
      </AppShell>
    );
  }

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Auditoría
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Registro de acciones: quién borró, restauró o modificó qué
          </p>
        </div>
        <Button
          variant="outline"
          loading={loading}
          icon={<RefreshCw className="h-4 w-4" />}
          onClick={load}
        >
          Actualizar
        </Button>
      </div>

      {summary && summary.by_action.length > 0 && (
        <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <SummaryCard title="Por tipo de acción">
            {summary.by_action.map((a) => (
              <SummaryLine
                key={a.action}
                label={ACTION_LABELS[a.action] ?? a.action}
                count={a.count}
              />
            ))}
          </SummaryCard>

          <SummaryCard title="Usuarios más activos">
            {summary.top_users.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Sin datos
              </p>
            ) : (
              summary.top_users.map((u) => (
                <SummaryLine key={u.email} label={u.email} count={u.count} />
              ))
            )}
          </SummaryCard>

          <SummaryCard title="Recursos afectados">
            {summary.by_resource.map((r) => (
              <SummaryLine
                key={r.resource}
                label={r.resource.replace(/_/g, " ")}
                count={r.count}
              />
            ))}
          </SummaryCard>
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-slate-400">
          <Filter className="h-4 w-4" />
          <span className="text-xs font-medium uppercase tracking-wide">
            Filtrar
          </span>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className={inputCls}
        >
          <option value="">Todas las acciones</option>
          <option value="delete">Borrados</option>
          <option value="soft_delete">Desactivados (soft)</option>
          <option value="deactivate">Desactivados</option>
          <option value="restore">Restaurados</option>
          <option value="maintenance_cleanup">Limpiezas</option>
          <option value="donation_certificate">Certificados donación</option>
        </select>

        <select
          value={resourceFilter}
          onChange={(e) => setResourceFilter(e.target.value)}
          className={inputCls}
        >
          <option value="">Todos los recursos</option>
          <option value="batch">Lotes</option>
          <option value="product">Productos</option>
          <option value="family">Familias</option>
          <option value="delivery">Entregas</option>
          <option value="nevera_ration">Raciones</option>
          <option value="derivation">Derivaciones</option>
          <option value="user">Usuarios</option>
          <option value="donation">Donaciones</option>
          <option value="system">Sistema</option>
        </select>

        <select
          value={daysFilter}
          onChange={(e) => setDaysFilter(Number(e.target.value))}
          className={inputCls}
        >
          <option value={7}>Últimos 7 días</option>
          <option value={30}>Últimos 30 días</option>
          <option value={90}>Últimos 90 días</option>
          <option value={365}>Último año</option>
        </select>
      </div>

      {loading ? (
        <LoadingState label="Cargando auditoría…" />
      ) : !data || data.entries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <ClipboardList className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            Sin registros
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No hay acciones registradas en este rango.
          </p>
        </div>
      ) : (
        <>
          <div className="mb-2 text-xs text-slate-500 dark:text-slate-400">
            Mostrando {data.entries.length} de {data.total} registros
          </div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Usuario</th>
                  <th className="px-4 py-3">Acción</th>
                  <th className="px-4 py-3">Recurso</th>
                  <th className="px-4 py-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="dark:text-slate-200">
                {data.entries.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500 dark:text-slate-400">
                      {e.created_at
                        ? new Date(e.created_at).toLocaleString("es-ES", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {e.user_email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                          ACTION_COLORS[e.action] ??
                          "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        {ACTION_LABELS[e.action] ?? e.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs capitalize text-slate-600 dark:text-slate-400">
                      {e.resource_type.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {e.description ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AppShell>
  );
}

function SummaryCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function SummaryLine({ label, count }: { label: string; count: number }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="truncate text-slate-600 dark:text-slate-400">
        {label}
      </span>
      <span className="font-semibold text-slate-900 dark:text-white">
        {count}
      </span>
    </div>
  );
}
