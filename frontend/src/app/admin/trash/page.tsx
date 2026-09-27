"use client";
import { useEffect, useState } from "react";
import { RotateCcw, Users, Home, Inbox } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Loading";
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
      toast.error("Error al cargar la papelera");
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

  const restoreFamily = async (id: string, code: string) => {
    setRestoring(id);
    try {
      await api(`/api/admin/trash/restore/family/${id}`, { method: "POST" });
      toast.success(`Familia ${code} restaurada`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setRestoring(null);
    }
  };

  const restoreUser = async (id: string, email: string) => {
    setRestoring(id);
    try {
      await api(`/api/admin/trash/restore/user/${id}`, { method: "POST" });
      toast.success(`Usuario ${email} restaurado`);
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
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

      <div className="mb-6 flex gap-1 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setTab("families")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
            tab === "families"
              ? "border-xama-600 text-xama-600 dark:text-xama-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Home className="h-4 w-4" />
          Familias
          {data && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
              {data.families.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("users")}
          className={`flex items-center gap-2 border-b-2 px-4 py-2 text-sm font-medium transition ${
            tab === "users"
              ? "border-xama-600 text-xama-600 dark:text-xama-400"
              : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <Users className="h-4 w-4" />
          Usuarios
          {data && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-slate-800">
              {data.users.length}
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <LoadingState label="Cargando papelera…" />
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
  onRestore: (id: string, code: string) => void;
  restoring: string | null;
}) {
  if (families.length === 0) {
    return <EmptyState text="No hay familias en la papelera" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
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
              className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
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
                <Button
                  size="sm"
                  variant="success"
                  loading={restoring === f.id}
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                  onClick={() => onRestore(f.id, f.reference_code)}
                >
                  Restaurar
                </Button>
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
  onRestore: (id: string, email: string) => void;
  restoring: string | null;
}) {
  if (users.length === 0) {
    return <EmptyState text="No hay usuarios en la papelera" />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
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
              className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <td className="px-4 py-3 font-medium">{u.full_name}</td>
              <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                {u.email}
              </td>
              <td className="px-4 py-3 capitalize">{u.role_name ?? "—"}</td>
              <td className="px-4 py-3 capitalize">{u.site ?? "—"}</td>
              <td className="px-4 py-3 text-right">
                <Button
                  size="sm"
                  variant="success"
                  loading={restoring === u.id}
                  icon={<RotateCcw className="h-3.5 w-3.5" />}
                  onClick={() => onRestore(u.id, u.email)}
                >
                  Restaurar
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Inbox className="h-8 w-8 text-slate-400" />
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}
