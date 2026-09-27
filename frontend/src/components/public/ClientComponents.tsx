"use client";
import { useState } from "react";

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button
      onClick={copy}
      className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-slate-700"
    >
      {copied ? "✓ Copiado" : label}
    </button>
  );
}

export function DonationCertificateForm() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const [data, setData] = useState({
    donor_name: "",
    donor_tax_id: "",
    amount: 25,
    donation_date: new Date().toISOString().slice(0, 10),
    concept: "Donación puntual",
    donor_address: "",
    recurring: false,
  });

  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

  const download = async () => {
    setLoading(true);
    setErr(null);
    try {
      const res = await fetch(`${API}/api/donations/certificate.pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Error ${res.status}`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `certificado-donacion-${data.donor_tax_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setDone(true);
      setTimeout(() => setDone(false), 4000);
    } catch (e) {
      setErr(
        e instanceof Error ? e.message : "Error al generar el certificado"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm transition focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="mt-10 rounded-2xl border border-emerald-200 bg-emerald-50/30 p-6 md:p-8">
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-xl">
          📄
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            ¿Ya has donado? Descarga tu certificado
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Genera el certificado fiscal de tu donación (Ley 49/2002) para
            deducirla en tu declaración.
          </p>
        </div>
      </div>

      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Generar certificado
        </button>
      ) : (
        <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Nombre completo / Razón social *
              </span>
              <input
                value={data.donor_name}
                onChange={(e) =>
                  setData({ ...data, donor_name: e.target.value })
                }
                className={inputCls}
                placeholder="Maria García López"
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                DNI / NIE / CIF *
              </span>
              <input
                value={data.donor_tax_id}
                onChange={(e) =>
                  setData({ ...data, donor_tax_id: e.target.value })
                }
                className={inputCls}
                placeholder="12345678Z"
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Importe (€) *
              </span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={data.amount}
                onChange={(e) =>
                  setData({ ...data, amount: Number(e.target.value) })
                }
                className={inputCls}
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block font-medium text-slate-700">
                Fecha de la donación *
              </span>
              <input
                type="date"
                value={data.donation_date}
                onChange={(e) =>
                  setData({ ...data, donation_date: e.target.value })
                }
                className={inputCls}
                required
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Domicilio (opcional)
              </span>
              <input
                value={data.donor_address}
                onChange={(e) =>
                  setData({ ...data, donor_address: e.target.value })
                }
                className={inputCls}
                placeholder="Carrer Major 12, Reus"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Concepto
              </span>
              <input
                value={data.concept}
                onChange={(e) =>
                  setData({ ...data, concept: e.target.value })
                }
                className={inputCls}
                placeholder="Donación puntual"
              />
            </label>

            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={data.recurring}
                onChange={(e) =>
                  setData({ ...data, recurring: e.target.checked })
                }
                className="h-4 w-4"
              />
              <span className="text-slate-700">
                Es una donación recurrente (mensual)
              </span>
            </label>
          </div>

          {err && (
            <div className="rounded-md bg-rose-50 p-2 text-sm text-rose-700">
              {err}
            </div>
          )}

          {done && (
            <div className="rounded-md bg-emerald-100 p-2 text-sm text-emerald-800">
              ✓ Certificado descargado
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              onClick={download}
              disabled={
                loading ||
                !data.donor_name ||
                !data.donor_tax_id ||
                !data.amount
              }
              className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Generando…" : "Descargar certificado PDF"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setErr(null);
                setDone(false);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 transition hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
