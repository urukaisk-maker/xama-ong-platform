"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Family } from "@/lib/types";

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [siteFilter, setSiteFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const q = siteFilter ? `?site=${siteFilter}` : "";
    const data = await api<Family[]>(`/api/families${q}`);
    setFamilies(data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [siteFilter]);

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Familias
        </h1>
        <div className="flex gap-3">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className={inputCls}
          >
            <option value="">Todas las sedes</option>
            <option value="reus">Reus</option>
            <option value="tarragona">Tarragona</option>
          </select>
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
          >
            {showForm ? "Cancelar" : "+ Nueva familia"}
          </button>
        </div>
      </div>

      {showForm && (
        <NewFamilyForm
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {loading ? (
        <p className="text-slate-500 dark:text-slate-400">Cargando…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Adultos</th>
                <th className="px-4 py-3">Menores</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Restricciones</th>
                <th className="px-4 py-3">Estado</th>
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
                  <td className="px-4 py-3">{f.adults}</td>
                  <td className="px-4 py-3">{f.minors}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {f.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {f.dietary_restrictions ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        f.active
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                      }`}
                    >
                      {f.active ? "activa" : "inactiva"}
                    </span>
                  </td>
                </tr>
              ))}
              {families.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-slate-400 dark:text-slate-500"
                  >
                    Sin familias
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function NewFamilyForm({ onCreated }: { onCreated: () => void }) {
  const [data, setData] = useState({
    reference_code: "",
    site: "reus",
    adults: 0,
    minors: 0,
    address: "",
    phone: "",
    dietary_restrictions: "",
    notes: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/api/families", {
        method: "POST",
        body: JSON.stringify({
          reference_code: data.reference_code,
          site: data.site,
          adults: data.adults,
          minors: data.minors,
          address: data.address || null,
          phone: data.phone || null,
          dietary_restrictions: data.dietary_restrictions || null,
          notes: data.notes || null,
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
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <form
      onSubmit={submit}
      className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input
          placeholder="Referencia (FAM-XXX)"
          value={data.reference_code}
          onChange={(e) =>
            setData({ ...data, reference_code: e.target.value })
          }
          className={inputCls}
          required
        />
        <select
          value={data.site}
          onChange={(e) => setData({ ...data, site: e.target.value })}
          className={inputCls}
        >
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
        <input
          type="number"
          min="0"
          placeholder="Adultos"
          value={data.adults}
          onChange={(e) => setData({ ...data, adults: Number(e.target.value) })}
          className={inputCls}
        />
        <input
          type="number"
          min="0"
          placeholder="Menores"
          value={data.minors}
          onChange={(e) => setData({ ...data, minors: Number(e.target.value) })}
          className={inputCls}
        />
        <input
          placeholder="Dirección"
          value={data.address}
          onChange={(e) => setData({ ...data, address: e.target.value })}
          className={`col-span-2 ${inputCls}`}
        />
        <input
          placeholder="Teléfono"
          value={data.phone}
          onChange={(e) => setData({ ...data, phone: e.target.value })}
          className={inputCls}
        />
        <input
          placeholder="Restricciones alimentarias"
          value={data.dietary_restrictions}
          onChange={(e) =>
            setData({ ...data, dietary_restrictions: e.target.value })
          }
          className={inputCls}
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-emerald-600 dark:hover:bg-emerald-700"
      >
        {loading ? "Creando…" : "Crear familia"}
      </button>
    </form>
  );
}
