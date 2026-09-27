import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Quote,
  Sparkles,
  Heart,
} from "lucide-react";
import DeveloperModal from "@/components/DeveloperModal";
import IconByName from "@/components/IconByName";
import PublicStats from "@/components/PublicStats";
import PublicPageClient from "./PublicPageClient";
import { SITE_CONFIG } from "@/lib/site-config";

const { ong, testimonials, pillars, companyBenefits } = SITE_CONFIG;

export const revalidate = 60; // ISR: revalida cada 60 segundos

export default function PublicPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-10 border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
              X
            </div>
            <span className="text-lg font-bold text-slate-900">{ong.name}</span>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="#donar"
              className="hidden rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 hover:shadow-md md:inline-block"
            >
              Donar
            </a>
            <Link
              href="/login"
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Acceder
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── Hero ─── */}
      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 text-center md:pt-24">
        <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-800">
          📍 {ong.address}
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight text-slate-900 md:text-6xl">
          Recuperamos alimentos,{" "}
          <span className="text-emerald-600">alimentamos esperanza</span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          En {ong.name} rescatamos los excedentes de comercios, agricultores y
          empresas para hacerlos llegar a las familias que más lo necesitan.
          Cero desperdicio, máxima dignidad.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#donar"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
          >
            Quiero donar <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="#voluntariado"
            className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Ser voluntario
          </a>
        </div>
      </section>

      {/* ─── Contadores (server) ─── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        <PublicStats />
      </section>

      {/* ─── Cómo lo hacemos ─── */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Cómo lo hacemos
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Cuatro pilares simples que convierten el desperdicio en
              dignidad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white">
                  <IconByName name={p.icon} className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── DONAR (parte cliente) ─── */}
      <PublicPageClient.SectionDonar />

      {/* ─── VOLUNTARIADO ─── */}
      <section
        id="voluntariado"
        className="border-t border-slate-100 bg-slate-50"
      >
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
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900">
                Únete al equipo de voluntarios
              </h3>
              <p className="mb-6 text-sm text-slate-600">
                Escríbenos y te contamos cómo funciona. Te asignamos un turno,
                un rol y te acompañamos en las primeras jornadas.
              </p>
              <a
                href={`mailto:${ong.email}?subject=Quiero%20ser%20voluntario%2Fa%20en%20${ong.name}`}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg"
              >
                Quiero ser voluntario <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIOS ─── */}
      <section className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <Quote className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Lo que dicen de nosotros
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Voluntarios, familias y empresas que forman parte de XAMA.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-emerald-100" />
                <p className="mb-6 text-sm italic leading-relaxed text-slate-700">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {t.author}
                    </p>
                    <p className="text-xs text-slate-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── EMPRESAS ─── */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800">
                <Sparkles className="h-3.5 w-3.5" />
                Para empresas
              </div>
              <h2 className="mb-4 text-3xl font-bold text-slate-900 md:text-4xl">
                ¿Eres empresa?
              </h2>
              <p className="mb-6 text-slate-600">
                Si tu negocio genera excedentes alimentarios, podemos
                recogerlos cada semana y certificar el impacto ambiental y
                social. Sin coste para ti, con beneficios reales.
              </p>

              <ul className="mb-8 space-y-3">
                {companyBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
                    <span className="text-slate-700">{b}</span>
                  </li>
                ))}
              </ul>

              <a
                href={`mailto:${ong.email}?subject=Colaboraci%C3%B3n%20empresarial%20con%20${ong.name}`}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg"
              >
                Contactar con {ong.name} <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  Impacto corporativo
                </h3>
              </div>
              <p className="mb-6 text-sm text-slate-600">
                Cada kg de alimento recuperado evita ~2,5 kg de CO₂. Te damos
                las cifras listas para tu memoria de sostenibilidad.
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    Ahorro medio de una panadería
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    ~30 kg/semana
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-xs text-slate-500">
                    CO₂ evitado por donante/año
                  </p>
                  <p className="text-lg font-bold text-emerald-600">
                    ~3.000 kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 py-20 text-white">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Únete a XAMA-ONG
          </h2>
          <p className="mb-8 text-lg text-emerald-50">
            Dona, hazte voluntario o trae el excedente de tu empresa. Cada
            gesto se convierte en comida sobre la mesa de una familia.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#donar"
              className="inline-flex items-center gap-2 rounded-md bg-white px-6 py-3 text-sm font-semibold text-emerald-700 transition-all hover:-translate-y-0.5 hover:shadow-xl"
            >
              Quiero donar <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href="#voluntariado"
              className="inline-flex items-center gap-2 rounded-md border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              Quiero ser voluntario
            </a>
          </div>
          <p className="mt-8 text-sm text-emerald-100">
            📧 {ong.email} · 📱 Bizum: {ong.bizumPhone}
          </p>
        </div>
      </section>

      {/* ─── Footer (cliente para el modal) ─── */}
      <PublicPageClient.Footer />
    </main>
  );
}
