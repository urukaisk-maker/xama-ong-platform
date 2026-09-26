"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Family } from "@/lib/types";

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [siteFilter, setSiteFilter] = useState("");
  const [loading, setLoading] = useState(true);

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

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Familias</h1>
        <select
          value={siteFilter}
          onChange={(e) => setSiteFilter(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las sedes</option>
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Adultos</th>
                <th className="px-4 py-3">Menores</th>
                <th className="px-4 py-3">Restricciones</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {families.map((f) => (
                <tr key={f.id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-mono text-xs">{f.reference_code}</td>
                  <td className="px-4 py-3 capitalize">{f.site}</td>
                  <td className="px-4 py-3">{f.adults}</td>
                  <td className="px-4 py-3">{f.minors}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {f.dietary_restrictions ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        f.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {f.active ? "activa" : "inactiva"}
                    </span>
                  </td>
                </tr>
              ))}
              {families.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
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
