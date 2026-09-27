"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import { api } from "@/lib/api";

type TrashFamily = {
  id: string;
  reference_code: string;
  site: string;
  adults: number;
  minors: number;
  address: string | null;
  phone: string | null;
  created_at: string | null;
  deliveries_count: number;
  has_deliveries: boolean;
};

type TrashUser = {
  id: string;
  email: string;
  full_name: string;
  site: string | null;
  role_name: string | null;
  created_at: string | null;
};

type TrashData = {
  families: TrashFamily[];
  users: TrashUser[];
};

export default function TrashPage() {
  const [data, setData] = useState<TrashData | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"families" | "users">("families");
  const [err, setErr] = useState<string | null>(null);
  const [restoring, setRestoring] = useState<string | null>(null);

  const { user } = useUser();

  const load = async () => {
    setLoading(true);
    try {
      const d = await api<TrashData>("/api/admin/trash");
      setData(d);
      setErr(null);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role_name === "junta") load();
  }, [user]);

  if (user && user.role_name !== "junta") {
    return (
      <AppShell>
        <p className="text-rose-600">
          Solo la Junta puede acceder a la papelera.
        </p>
      </AppShell>
    );
  }

  const restoreFamily = async (id: string) => {
    setRestoring(id);
    try {
      await api(`/api/admin/trash/restore/family/${id}`, { method: "POST" });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setRestoring(null);
    }
  };

  const restoreUser = async (id: string) => {
    setRestoring(id);
    try {
      await api(`/api/admin/trash/restore/user/${id}`, { method: "POST" });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    } finally {
      setRestoring(null);
    }
  };

  return (
    <AppShell>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Papelera
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Elementos desactivados que pueden restaurarse
        </p>
      </div>

      {err && <p className="mb-4 text-rose-600">{err}</p>}

      <div className="mb-6 flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab("families")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
            tab === "families"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Familias{" "}
          {data && (
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
              {data.families.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("users")}
          className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
            tab === "users"
              ? "border-emerald-600 text-emerald-600 dark:text-emerald-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          Usuarios{" "}
          {data && (
            <span className="ml-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
              {data.users.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando…</p>
      ) : !data ? null : tab === "families" ? (
        <FamiliesTab
          families={data.families}
          onRestore={restoreFamily}
          restoring={restoring}
        />
      ) : (
        <UsersTab
          users={data.users}
          onRestore={restoreUser}
          restoring={restoring}
        />
      )}
    </AppShell>
  );
}

function FamiliesTab({
  families,
  onRestore,
  restoring,
}: {
  families: TrashFamily[];
  onRestore: (id: string) => void;
  restoring: string | null;
}) {
  if (families.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 text-4xl">📭</div>
        <p className="text-slate-500 dark:text-slate-400">
          No hay familias en la papelera
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Código</th>
            <th className="px-4 py-3">Sede</th>
            <th className="px-4 py-3">Personas</th>
            <th className="px-4 py-3">Entregas</th>
            <th className="px-4 py-3">Contacto</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="dark:text-slate-200">
          {families.map((f) => (
            <tr
              key={f.id}
              className="border-t border-slate-100 dark:border-slate-800"
            >
              <td className="px-4 py-3 font-mono text-xs">
                {f.reference_code}
              </td>
              <td className="px-4 py-3 capitalize">{f.site}</td>
              <td className="px-4 py-3">{f.adults + f.minors}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {f.deliveries_count}
              </td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {f.phone ?? "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onRestore(f.id)}
                  disabled={restoring === f.id}
                  className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                >
                  {restoring === f.id ? "Restaurando…" : "↻ Restaurar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function UsersTab({
  users,
  onRestore,
  restoring,
}: {
  users: TrashUser[];
  onRestore: (id: string) => void;
  restoring: string | null;
}) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-3 text-4xl">📭</div>
        <p className="text-slate-500 dark:text-slate-400">
          No hay usuarios en la papelera
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">Nombre</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Rol</th>
            <th className="px-4 py-3">Sede</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="dark:text-slate-200">
          {users.map((u) => (
            <tr
              key={u.id}
              className="border-t border-slate-100 dark:border-slate-800"
            >
              <td className="px-4 py-3 font-medium">{u.full_name}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {u.email}
              </td>
              <td className="px-4 py-3 capitalize">{u.role_name ?? "—"}</td>
              <td className="px-4 py-3 capitalize">{u.site ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <button
                  onClick={() => onRestore(u.id)}
                  disabled={restoring === u.id}
                  className="rounded-md border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900"
                >
                  {restoring === u.id ? "Restaurando…" : "↻ Restaurar"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
