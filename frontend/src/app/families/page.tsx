"use client";
import { useEffect, useState } from "react";
import { Upload, Plus, Users } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import ConfirmDelete, { TrashIcon } from "@/components/ConfirmDelete";
import Button from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Loading";
import { api, downloadFile, getToken } from "@/lib/api";
import type { Family } from "@/lib/types";

const COORD_ROLES = ["junta", "coordinador_reus", "coordinador_tarragona"];
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

type ImportRow = {
  line: number;
  reference_code: string;
  status: "valid" | "invalid" | "duplicate";
  message: string | null;
  data: Record<string, unknown> | null;
};

type ImportPreview = {
  total_rows: number;
  valid: number;
  invalid: number;
  duplicates: number;
  imported: number;
  errors: string[];
  rows: ImportRow[];
};

export default function FamiliesPage() {
  const [families, setFamilies] = useState<Family[]>([]);
  const [siteFilter, setSiteFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { user } = useUser();
  const canImport =
    user?.role_name != null && COORD_ROLES.includes(user.role_name);

  const load = async () => {
    setLoading(true);
    try {
      const q = siteFilter ? `?site=${siteFilter}` : "";
      const data = await api<Family[]>(`/api/families${q}`);
      setFamilies(data);
    } catch {
      toast.error("Error al cargar las familias");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [siteFilter]);

  const deleteFamily = async (id: string) => {
    await api(`/api/families/${id}`, { method: "DELETE" });
    toast.success("Familia eliminada");
    load();
  };

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Familias
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {families.length} familia{families.length === 1 ? "" : "s"}
            {siteFilter && ` en ${siteFilter}`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className={inputCls}
          >
            <option value="">Todas las sedes</option>
            <option value="reus">Reus</option>
            <option value="tarragona">Tarragona</option>
          </select>
          {canImport && (
            <Button
              variant="outline"
              icon={<Upload className="h-4 w-4" />}
              onClick={() => {
                setShowImport(!showImport);
                setShowForm(false);
              }}
            >
              {showImport ? "Cancelar" : "Importar CSV"}
            </Button>
          )}
          <Button
            variant="primary"
            icon={<Plus className="h-4 w-4" />}
            onClick={() => {
              setShowForm(!showForm);
              setShowImport(false);
            }}
          >
            {showForm ? "Cancelar" : "Nueva familia"}
          </Button>
        </div>
      </div>

      {showImport && canImport && (
        <ImportCSVModal onImported={load} onClose={() => setShowImport(false)} />
      )}

      {showForm && (
        <NewFamilyForm
          onCreated={() => {
            setShowForm(false);
            toast.success("Familia creada");
            load();
          }}
        />
      )}

            {loading ? (
        <SkeletonTable rows={8} cols={canImport ? 8 : 7} />
      ) : families.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Users className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            Sin familias todavía
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Pulsa "Nueva familia" o importa un CSV para empezar.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Código</th>
                <th className="px-4 py-3">Sede</th>
                <th className="px-4 py-3">Adultos</th>
                <th className="px-4 py-3">Menores</th>
                <th className="px-4 py-3">Contacto</th>
                <th className="px-4 py-3">Restricciones</th>
                <th className="px-4 py-3">Estado</th>
                {canImport && <th className="px-4 py-3"></th>}
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
                  {canImport && (
                    <td className="px-4 py-3 text-right">
                      <ConfirmDelete
                        title="¿Borrar esta familia?"
                        message={`${f.reference_code} · ${f.adults + f.minors} personas. Si tiene entregas, se desactivará en lugar de borrar.`}
                        onConfirm={() => deleteFamily(f.id)}
                        trigger={TrashIcon}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function ImportCSVModal({
  onImported,
  onClose,
}: {
  onImported: () => void;
  onClose: () => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState<number | null>(null);

  const callPreview = async (f: File) => {
    setLoading(true);
    setErr(null);
    setPreview(null);
    setDone(null);
    try {
      const fd = new FormData();
      fd.append("file", f);
      const token = getToken();
      const res = await fetch(`${API_URL}/api/families/import/preview`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }
      setPreview(await res.json());
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  const runImport = async () => {
    if (!file) return;
    setImporting(true);
    setErr(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const token = getToken();
      const res = await fetch(`${API_URL}/api/families/import`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Error ${res.status}`);
      }
      const data: ImportPreview = await res.json();
      setPreview(data);
      setDone(data.imported);
      toast.success(`${data.imported} familias importadas`);
      onImported();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = async () => {
    try {
      await downloadFile(
        "/api/families/template.csv",
        "xama-familias-plantilla.csv"
      );
      toast.success("Plantilla descargada");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <div className="mb-6 animate-slide-up space-y-4 rounded-xl border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Importar familias desde CSV
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Columnas obligatorias:{" "}
            <code className="rounded bg-slate-200 px-1 text-xs dark:bg-slate-800">
              reference_code
            </code>
            ,{" "}
            <code className="rounded bg-slate-200 px-1 text-xs dark:bg-slate-800">
              site
            </code>{" "}
            (reus|tarragona).
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="file"
          accept=".csv"
          onChange={(e) => {
            const f = e.target.files?.[0] ?? null;
            setFile(f);
            if (f) callPreview(f);
          }}
          className="block text-sm text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-700 dark:text-slate-300 dark:file:bg-xama-600 dark:hover:file:bg-xama-700"
        />
        <Button variant="outline" size="sm" onClick={downloadTemplate}>
          Descargar plantilla
        </Button>
      </div>

      {loading && (
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Analizando CSV…
        </p>
      )}

      {err && <p className="text-sm text-rose-600">{err}</p>}

      {preview && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <SummaryPill label="Total filas" value={preview.total_rows} />
            <SummaryPill
              label="Válidas"
              value={preview.valid}
              color="emerald"
            />
            <SummaryPill
              label="Duplicadas"
              value={preview.duplicates}
              color="amber"
            />
            <SummaryPill
              label="Inválidas"
              value={preview.invalid}
              color="rose"
            />
            {done !== null && (
              <SummaryPill
                label="Importadas"
                value={preview.imported}
                color="emerald"
              />
            )}
          </div>

          {preview.errors.length > 0 && (
            <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
              {preview.errors.map((e, i) => (
                <p key={i}>• {e}</p>
              ))}
            </div>
          )}

          <div className="max-h-80 overflow-y-auto rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-50 text-left uppercase text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-2">Línea</th>
                  <th className="px-3 py-2">Código</th>
                  <th className="px-3 py-2">Estado</th>
                  <th className="px-3 py-2">Motivo</th>
                </tr>
              </thead>
              <tbody className="dark:text-slate-200">
                {preview.rows.map((r) => (
                  <tr
                    key={r.line}
                    className="border-t border-slate-100 dark:border-slate-800"
                  >
                    <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
                      {r.line}
                    </td>
                    <td className="px-3 py-1.5 font-mono">
                      {r.reference_code}
                    </td>
                    <td className="px-3 py-1.5">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-3 py-1.5 text-slate-500 dark:text-slate-400">
                      {r.message ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {done === null && preview.valid > 0 && (
            <Button
              variant="success"
              loading={importing}
              onClick={runImport}
              className="w-full"
            >
              {importing
                ? "Importando…"
                : `Importar ${preview.valid} familia${preview.valid === 1 ? "" : "s"}`}
            </Button>
          )}

          {done !== null && (
            <div className="rounded-md bg-emerald-100 p-3 text-sm text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              ✓ {done} familia{done === 1 ? "" : "s"} importada
              {done === 1 ? "" : "s"} correctamente
            </div>
          )}

          {done === null && preview.valid === 0 && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No hay filas válidas para importar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function SummaryPill({
  label,
  value,
  color = "slate",
}: {
  label: string;
  value: number;
  color?: "slate" | "emerald" | "amber" | "rose";
}) {
  const colors = {
    slate: "text-slate-900 dark:text-white",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
      <p className={`text-xl font-bold ${colors[color]}`}>{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    valid:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    duplicate:
      "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    invalid: "bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-300",
  };
  const labels: Record<string, string> = {
    valid: "válida",
    duplicate: "duplicada",
    invalid: "inválida",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${map[status] ?? ""}`}
    >
      {labels[status] ?? status}
    </span>
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
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <form
      onSubmit={submit}
      className="mb-6 animate-slide-up space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
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

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        icon={<Plus className="h-4 w-4" />}
      >
        {loading ? "Creando…" : "Crear familia"}
      </Button>
    </form>
  );
}
