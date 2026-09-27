"use client";
import { useState } from "react";
import Link from "next/link";
import DeveloperModal from "@/components/DeveloperModal";
import { CopyButton, DonationCertificateForm } from "@/components/public/ClientComponents";
import { SITE_CONFIG } from "@/lib/site-config";

const { ong, developer } = SITE_CONFIG;

export function SectionDonar() {
  return (
    <section
      id="donar"
      className="border-t border-emerald-100 bg-emerald-50/50"
    >
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
            Tu donativo, en comida
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600">
            Cada euro se convierte en alimentos rescatados y puestos sobre la
            mesa de una familia. Sin intermediarios, sin gastos innecesarios.
          </p>
        </div>

        <div className="mb-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          <ImpactCard amount="10€" desc="25 kg de alimentos recuperados" />
          <ImpactCard amount="25€" desc="1 cesta semanal para una familia" />
          <ImpactCard amount="50€" desc="Raciones Nevera para 10 personas" />
          <ImpactCard amount="100€" desc="Reparto completo para 5 familias" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm">
            <div className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              Recomendado
            </div>
            <div className="mb-4 text-4xl">📱</div>
            <h3 className="mb-2 text-2xl font-bold text-slate-900">Bizum</h3>
            <p className="mb-6 text-sm text-slate-600">
              Envía tu donación desde tu app bancaria al número de {ong.name}.
              Rápido, sin comisiones para ti.
            </p>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                Número Bizum
              </div>
              <div className="mb-3 font-mono text-xl font-bold tracking-wider text-slate-900">
                {ong.bizumPhone}
              </div>
              <CopyButton value={ong.bizumPhone} label="Copiar número" />
            </div>
            <p className="mt-4 text-xs text-slate-500">
              💡 En el concepto de la operación, indica{" "}
              <b>&quot;Donación&quot;</b>. Te enviaremos un email de
              agradecimiento y un certificado de donación para tu deducción
              fiscal.
            </p>
          </div>

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
                  {ong.iban}
                </div>
                <CopyButton value={ong.iban} label="Copiar IBAN" />
              </div>
              <div className="border-t border-slate-200 pt-3">
                <div className="mb-1 text-xs font-medium uppercase tracking-wider text-slate-500">
                  Titular
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {ong.ibanHolder}
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-slate-500">
              💡 En el concepto, indica tu nombre y{" "}
              <b>&quot;Donación&quot;</b> para emitir el certificado.
            </p>
          </div>
        </div>

        <DonationCertificateForm />
      </div>
    </section>
  );
}

export function Footer() {
  const [devOpen, setDevOpen] = useState(false);

  return (
    <>
      <footer className="border-t border-slate-200 bg-slate-900 py-14 text-slate-300">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
                  X
                </div>
                <span className="text-lg font-bold text-white">{ong.name}</span>
              </div>
              <p className="text-sm leading-relaxed">
                {ong.fullName} dedicada a la recuperación de alimentos y su
                distribución a familias en situación de vulnerabilidad.
              </p>
              <ul className="mt-4 space-y-1 text-sm">
                <li>📧 {ong.email}</li>
                <li>📱 Bizum: {ong.bizumPhone}</li>
                <li>📍 {ong.address}</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Enlaces
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#donar" className="transition hover:text-white">
                    Donar
                  </a>
                </li>
                <li>
                  <a
                    href="#voluntariado"
                    className="transition hover:text-white"
                  >
                    Voluntariado
                  </a>
                </li>
                <li>
                  <Link href="/login" className="transition hover:text-white">
                    Acceso voluntarios
                  </Link>
                </li>
                <li>
                  <a
                    href="https://github.com/urukaisk-maker/xama-ong-platform"
                    className="transition hover:text-white"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Código abierto
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Legal
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/legal/terms"
                    className="transition hover:text-white"
                  >
                    Términos de uso
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/privacy"
                    className="transition hover:text-white"
                  >
                    Política de privacidad
                  </Link>
                </li>
                <li>
                  <Link
                    href="/legal/cookies"
                    className="transition hover:text-white"
                  >
                    Política de cookies
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 border-t border-slate-800 pt-8">
            <button
              onClick={() => setDevOpen(true)}
              className="group w-full rounded-lg bg-slate-800/50 p-5 text-left transition hover:bg-slate-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              aria-label={`Ver más sobre ${developer.name}`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Desarrollado por
                  </p>
                  <p className="mt-1 text-lg font-bold text-white group-hover:text-emerald-300">
                    {developer.name}
                  </p>
                  <p className="text-sm text-slate-400">
                    {developer.role} · {developer.location}
                  </p>
                </div>
                <span className="hidden rounded-full border border-slate-700 bg-slate-900 px-3 py-1 text-xs font-medium text-emerald-400 transition group-hover:border-emerald-600 group-hover:bg-emerald-950 sm:inline-block">
                  Ver perfil →
                </span>
              </div>
            </button>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-slate-800 pt-6 text-center text-xs text-slate-400 md:flex-row md:text-left">
            <p>
              © {new Date().getFullYear()} {ong.name} · Todos los derechos
              reservados
            </p>
            <p>
              Hecho con voluntad y código abierto por{" "}
              <button
                onClick={() => setDevOpen(true)}
                className="text-emerald-400 hover:text-emerald-300"
              >
                {developer.name}
              </button>
            </p>
          </div>
        </div>
      </footer>

      <DeveloperModal open={devOpen} onClose={() => setDevOpen(false)} />
    </>
  );
}

function ImpactCard({ amount, desc }: { amount: string; desc: string }) {
  return (
    <div className="rounded-xl border border-emerald-200 bg-white p-5 text-center shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-1 text-2xl font-bold text-emerald-600">{amount}</div>
      <div className="text-xs text-slate-600">{desc}</div>
    </div>
  );
}


