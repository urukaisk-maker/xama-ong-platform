"use client";
import { useEffect, useState } from "react";
import { Plus, UserX } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import ConfirmDelete, { TrashIcon } from "@/components/ConfirmDelete";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Loading";
import { api } from "@/lib/api";
import type { Role, User } from "@/lib/types";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { user: me } = useUser();

  const load = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([
        api<User[]>("/api/auth/users"),
        api<Role[]>("/api/auth/roles"),
      ]);
      setUsers(u);
      setRoles(r);
      setErr(null);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error";
      setErr(msg);
      toast.error("Error al cargar los usuarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (me && me.role_name === "junta") load();
  }, [me]);

  if (me && me.role_name !== "junta") {
    return (
      <AppShell>
        <p className="text-rose-600">
          Solo la Junta puede gestionar usuarios.
        </p>
      </AppShell>
    );
  }

  const roleName = (id: number | null) =>
    roles.find((r) => r.id === id)?.name ?? "—";

  const deactivateUser = async (id: string, name: string) => {
    await api(`/api/auth/users/${id}`, { method: "DELETE" });
    toast.success(`${name} desactivado`);
    load();
  };

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Usuarios
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {users.length} usuario{users.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nuevo usuario"}
        </Button>
      </div>

      {err && <p className="mb-4 text-rose-600">{err}</p>}

      {showForm && (
        <NewUserForm
          roles={roles}
          onCreated={() => {
            setShowForm(false);
            toast.success("Usuario creado");
            load();
          }}
        />
      )}

      {loading ? (
        <LoadingState label="Cargando usuarios…" />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Estado</th>
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
                  <td className="px-4 py-3 capitalize">
                    {roleName(u.role_id)}
                  </td>
                  <td className="px-4 py-3 capitalize">{u.site ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        u.active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {u.active ? "activo" : "inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {me?.id !== u.id && u.active && (
                      <ConfirmDelete
                        title="¿Desactivar este usuario?"
                        message={`${u.full_name} (${u.email}) dejará de poder acceder. Es reversible desde la papelera.`}
                        onConfirm={() => deactivateUser(u.id, u.full_name)}
                        trigger={TrashIcon}
                        dangerLabel="Desactivar"
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function NewUserForm({
  roles,
  onCreated,
}: {
  roles: Role[];
  onCreated: () => void;
}) {
  const [data, setData] = useState({
    email: "",
    password: "",
    full_name: "",
    site: "",
    role_id: roles[0]?.id ?? 0,
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/api/auth/users", {
        method: "POST",
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          full_name: data.full_name,
          site: data.site || null,
          role_id: data.role_id,
        }),
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <form
      onSubmit={submit}
      className="mb-6 animate-slide-up space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <input
          placeholder="Nombre completo"
          value={data.full_name}
          onChange={(e) => setData({ ...data, full_name: e.target.value })}
          className={inputCls}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className={inputCls}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          className={inputCls}
          required
          minLength={4}
        />
        <select
          value={data.role_id}
          onChange={(e) =>
            setData({ ...data, role_id: Number(e.target.value) })
          }
          className={inputCls}
        >
          {roles.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        <select
          value={data.site}
          onChange={(e) => setData({ ...data, site: e.target.value })}
          className={inputCls}
        >
          <option value="">Sin sede</option>
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        icon={<Plus className="h-4 w-4" />}
      >
        {loading ? "Creando…" : "Crear usuario"}
      </Button>
    </form>
  );
}
