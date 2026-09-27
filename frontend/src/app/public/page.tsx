"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import AnimatedCounter from "@/components/AnimatedCounter";

type Stats = {
  total_kg_recovered: number;
  co2_avoided_kg: number;
  nevera_served: number;
  total_families: number;
  total_people: number;
  total_volunteers: number;
  total_volunteer_hours: number;
  active_families: number;
  reus_families: number;
  tarragona_families: number;
};

const DONATION_CONFIG = {
  bizumPhone: "600 000 000",
  iban: "ES00 0000 0000 0000 0000 0000",
  ibanHolder: "XAMA ONG",
  email: "hola@xamaong.cat",
  bankName: "CaixaBank",
};

export default function PublicPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";
    fetch(`${API}/api/public/stats`)
      .then((r) => r.json())
      .then(setStats)
      .catch(() => {});
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-10 border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
              X
            </div>
            <span className="text-lg font-bold text-slate-900">XAMA-ONG</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#donar"
              className="hidden rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 md:inline-block"
            >
              Donar
            </a>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Acceder
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 text-center md:pt-24">
        <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-800">
          Reus · Tarragona
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
          Recuperamos alimentos,{" "}
          <span className="text-emerald-600">alimentamos esperanza</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          En XAMA rescatamos los excedentes de comercios, agricultores y
          empresas para hacerlos llegar a las familias que más lo necesitan.
          Cero desperdicio, máxima dignidad.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#donar"
            className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Quiero donar
          </a>
          <a
            href="#voluntariado"
            className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Ser voluntario
          </a>
        </div>
      </section>

      {/* ─── Contadores ─── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        {stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard icon="🥕" value={stats.total_kg_recovered} decimals={0} suffix=" kg" label="Alimentos recuperados" color="emerald" />
            <StatCard icon="🌱" value={stats.co2_avoided_kg} decimals={0} suffix=" kg" label="CO₂ evitado" color="green" />
            <StatCard icon="🍽" value={stats.nevera_served} decimals={0} label="Raciones Nevera" color="amber" />
            <StatCard icon="👥" value={stats.total_people} decimals={0} label="Personas atendidas" color="slate" />
            <StatCard icon="🏠" value={stats.total_families} decimals={0} label="Familias" color="emerald" />
            <StatCard icon="🤝" value={stats.total_volunteers} decimals={0} label="Voluntarios" color="green" />
            <StatCard icon="⏱" value={stats.total_volunteer_hours} decimals={1} suffix=" h" label="Horas aportadas" color="slate" />
            <StatCard icon="📍" value={stats.reus_families + stats.tarragona_families} decimals={0} label="Familias activas" color="amber" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-xl bg-slate-100" />
            ))}
          </div>
        )}
      </section>

      {/* ═══════════════════════════════════════════ */}
      {/* ─── DONAR ─── */}
      {/* ═══════════════════════════════════════════ */}
      <section id="donar" className="border-t border-emerald-100 bg-emerald-50/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Tu donativo, en comida
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Cada euro se convierte en alimentos rescatados y puestos sobre
              la mesa de una familia. Sin intermediarios, sin gastos
              innecesarios.
            </p>
          </div>

          <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            <ImpactCard amount="10€" desc="25 kg de alimentos recuperados" />
            <ImpactCard amount="25€" desc="1 cesta semanal para una familia" />
            <ImpactCard amount="50€" desc="Raciones Nevera para 10 personas" />
            <ImpactCard amount="100€" desc="Reparto completo para 5 familias" />
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Bizum */}
            <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
              <div className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Recomendado
              </div>
              <div className="mb-4 text-4xl">📱</div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">
                Bizum
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                Envía tu donación desde tu app bancaria al número de XAMA.
                Rápido, sin comisiones para ti.
              </p>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Número Bizum
                </div>
                <div className="mb-3 font-mono text-xl font-bold tracking-wider text-slate-900">
                  {DONATION_CONFIG.bizumPhone}
                </div>
                <CopyButton value={DONATION_CONFIG.bizumPhone} label="Copiar número" />
              </div>

              <p className="mt-4 text-xs text-slate-500">
                💡 En el concepto de la operación, indica{" "}
                <b>&quot;Donación&quot;</b>. Te enviaremos un email de
                agradecimiento y un certificado de donación para tu
                deducción fiscal.
              </p>
            </div>

            {/* Transferencia */}
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 text-4xl">🏦</div>
              <h3 className="mb-2 text-2xl font-bold text-slate-900">
                Transferencia bancaria
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                Ideal para donaciones grandes o recurrentes. Sin comisión en
                muchos bancos.
              </p>

              <div className="space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div>
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                    IBAN
                  </div>
                  <div className="mb-2 break-all font-mono text-sm font-semibold text-slate-900">
                    {DONATION_CONFIG.iban}
                  </div>
                  <CopyButton value={DONATION_CONFIG.iban} label="Copiar IBAN" />
                </div>
                <div className="border-t border-slate-200 pt-3">
                  <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                    Titular
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {DONATION_CONFIG.ibanHolder}
                  </div>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-500">
                💡 En el concepto, indica tu nombre y{" "}
                <b>&quot;Donación&quot;</b> para emitir el certificado.
              </p>
            </div>
          </div>

          {/* ─── Certificado de donación ─── */}
          <DonationCertificateForm />

          {/* Empresas / mecenazgo */}
          <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <div className="mb-3 text-3xl">🏢</div>
            <h3 className="mb-2 text-xl font-bold text-slate-900">
              ¿Eres empresa?
            </h3>
            <p className="mx-auto mb-4 max-w-2xl text-sm text-slate-600">
              Aceptamos donaciones corporativas, excedentes alimentarios y
              patrocinios. Emitimos certificados de impacto ambiental y
              social para vuestra memoria de sostenibilidad.
            </p>
            <a
              href={`mailto:${DONATION_CONFIG.email}`}
              className="inline-block rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white hover:bg-slate-700"
            >
              Contactar con XAMA
            </a>
          </div>

          <p className="mt-8 text-center text-xs text-slate-500">
            XAMA-ONG es una asociación sin ánimo de lucro. Las donaciones son
            deducibles fiscalmente según la Ley 49/2002. Emitimos certificados
            de donación para personas físicas y jurídicas.
          </p>
        </div>
      </section>

      {/* ─── VOLUNTARIADO ─── */}
      <section id="voluntariado" className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              También puedes darnos tu tiempo
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              ¿Tienes 4 horas a la semana? Necesitamos manos para recoger,
              clasificar y repartir. Reus y Tarragona, turnos de mañana y
              tarde.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
              <div className="mb-3 text-3xl">🤝</div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Únete al equipo de voluntarios
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                Escríbenos y te contamos cómo funciona. Te asignamos un turno,
                un rol y te acompañamos en las primeras jornadas.
              </p>
              <a
                href={`mailto:${DONATION_CONFIG.email}?subject=Quiero%20ser%20voluntario%2Fa%20en%20XAMA`}
                className="inline-block rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Quiero ser voluntario
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Cómo funciona ─── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 md:text-4xl">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step num="01" title="Recogemos" desc="Comercios, agricultores y empresas nos avisan de sus excedentes. Nuestros voluntarios los recogen en furgoneta." />
          <Step num="02" title="Clasificamos" desc="En el almacén revisamos el estado de cada producto, controlamos caducidades y preparamos las cestas." />
          <Step num="03" title="Repartimos" desc="Cada semana, familias de Reus y Tarragona vienen a recoger su cesta. Sin colas, sin papeles, con dignidad." />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
                  X
                </div>
                <span className="text-lg font-bold text-white">XAMA-ONG</span>
              </div>
              <p className="text-sm">
                Asociación sin ánimo de lucro dedicada a la recuperación de
                alimentos y su distribución a familias en situación de
                vulnerabilidad.
              </p>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Contacto
              </h3>
              <ul className="space-y-1 text-sm">
                <li>📧 {DONATION_CONFIG.email}</li>
                <li>📱 Bizum: {DONATION_CONFIG.bizumPhone}</li>
                <li>📍 Reus · Tarragona</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Enlaces
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="#donar" className="hover:text-white">Donar</a>
                </li>
                <li>
                  <a href="#voluntariado" className="hover:text-white">Voluntariado</a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">Acceso voluntarios</Link>
                </li>
                <li>
                  <a
                    href="https://github.com/urukaisk-maker/xama-ong-platform"
                    className="hover:text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Código abierto
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-10 border-t border-slate-800 pt-6 text-center text-xs text-slate-400">
            © {new Date().getFullYear()} XAMA-ONG · Hecho con voluntad y código abierto
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ─── Componentes ─── */

function StatCard({ icon, value, decimals, suffix, label, color }: {
  icon: string;
  value: number;
  decimals: number;
  suffix?: string;
  label: string;
  color: "emerald" | "green" | "amber" | "slate";
}) {
  const colors = {
    emerald: "text-emerald-600",
    green: "text-green-600",
    amber: "text-amber-600",
    slate: "text-slate-900",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className={`text-2xl font-bold md:text-3xl ${colors[color]}`}>
        <AnimatedCounter target={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="mt-1 text-xs text-slate-500 md:text-sm">{label}</div>
    </div>
  );
}

function ImpactCard({ amount, desc }: { amount: string; desc: string }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-5 text-center shadow-sm">
      <div className="mb-1 text-2xl font-bold text-emerald-600">{amount}</div>
      <div className="text-xs text-slate-600">{desc}</div>
    </div>
  );
}

function CopyButton({ value, label }: { value: string; label: string }) {
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
      className="w-full rounded-md bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-700"
    >
      {copied ? "✓ Copiado" : label}
    </button>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div>
      <div className="mb-3 text-sm font-bold text-emerald-600">{num}</div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}

/* ─── Formulario del certificado de donación ─── */
function DonationCertificateForm() {
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
      setErr(e instanceof Error ? e.message : "Error al generar el certificado");
    } finally {
      setLoading(false);
    }
  };

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
          className="rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
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
                onChange={(e) => setData({ ...data, donor_name: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                onChange={(e) => setData({ ...data, donor_tax_id: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                onChange={(e) => setData({ ...data, amount: Number(e.target.value) })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
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
                onChange={(e) => setData({ ...data, donation_date: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                required
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Domicilio (opcional)
              </span>
              <input
                value={data.donor_address}
                onChange={(e) => setData({ ...data, donor_address: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Carrer Major 12, Reus"
              />
            </label>

            <label className="text-sm md:col-span-2">
              <span className="mb-1 block font-medium text-slate-700">
                Concepto
              </span>
              <input
                value={data.concept}
                onChange={(e) => setData({ ...data, concept: e.target.value })}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                placeholder="Donación puntual"
              />
            </label>

            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={data.recurring}
                onChange={(e) => setData({ ...data, recurring: e.target.checked })}
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
              disabled={loading || !data.donor_name || !data.donor_tax_id || !data.amount}
              className="rounded-md bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Generando…" : "Descargar certificado PDF"}
            </button>
            <button
              onClick={() => {
                setOpen(false);
                setErr(null);
                setDone(false);
              }}
              className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
