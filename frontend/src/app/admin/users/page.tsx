"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
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
      setErr(e instanceof Error ? e.message : "Error");
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

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Usuarios</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          {showForm ? "Cancelar" : "+ Nuevo usuario"}
        </button>
      </div>

      {err && <p className="mb-4 text-rose-600">{err}</p>}

      {showForm && (
        <NewUserForm
          roles={roles}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-medium">{u.full_name}</td>
                  <td className="px-4 py-3 text-slate-600">{u.email}</td>
                  <td className="px-4 py-3 capitalize">
                    {roleName(u.role_id)}
                  </td>
                  <td className="px-4 py-3 capitalize">
                    {u.site ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        u.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {u.active ? "activo" : "inactivo"}
                    </span>
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

  return (
    <form
      onSubmit={submit}
      className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <input
          placeholder="Nombre completo"
          value={data.full_name}
          onChange={(e) => setData({ ...data, full_name: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={data.email}
          onChange={(e) => setData({ ...data, email: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={data.password}
          onChange={(e) => setData({ ...data, password: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
          minLength={4}
        />
        <select
          value={data.role_id}
          onChange={(e) =>
            setData({ ...data, role_id: Number(e.target.value) })
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
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
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Sin sede</option>
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Creando…" : "Crear usuario"}
      </button>
    </form>
  );
}
