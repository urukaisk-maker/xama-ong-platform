import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Quote,
  Sparkles,
  Heart,
} from "lucide-react";
import IconByName from "@/components/IconByName";
import PublicStats from "@/components/PublicStats";
import { SectionDonar, Footer } from "./PublicPageClient";
import { SITE_CONFIG } from "@/lib/site-config";

const { ong, testimonials, pillars, companyBenefits } = SITE_CONFIG;

export const revalidate = 60;

export default function PublicPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <nav className="sticky top-0 z-10 border-b border-emerald-100 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white">
              X
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {ong.name}
            </span>
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
              className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Acceder
            </Link>
          </div>
        </div>
      </nav>

      <section className="mx-auto max-w-6xl px-6 pt-16 pb-12 text-center md:pt-24">
        <div className="mb-4 inline-block rounded-full bg-emerald-100 px-4 py-1 text-sm font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
          📍 {ong.address}
        </div>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-tight tracking-tight text-slate-900 md:text-6xl dark:text-white">
          Recuperamos alimentos,{" "}
          <span className="text-emerald-600 dark:text-emerald-400">
            alimentamos esperanza
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600 dark:text-slate-300">
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
            className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Ser voluntario
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-16">
        <PublicStats />
      </section>

      <section className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Cómo lo hacemos
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Cuatro pilares simples que convierten el desperdicio en dignidad.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {pillars.map((p) => (
              <div
                key={p.title}
                className="group rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/80 dark:hover:border-emerald-700"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition group-hover:bg-emerald-600 group-hover:text-white dark:bg-emerald-950 dark:text-emerald-300">
                  <IconByName name={p.icon} className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <SectionDonar />

      <section
        id="voluntariado"
        className="border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50"
      >
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              También puedes darnos tu tiempo
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              ¿Tienes 4 horas a la semana? Necesitamos manos para recoger,
              clasificar y repartir. Reus y Tarragona, turnos de mañana y tarde.
            </p>
          </div>

          <div className="mx-auto max-w-2xl">
            <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-8 text-center shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80">
              <div className="mb-3 flex justify-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  <Heart className="h-6 w-6" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                Únete al equipo de voluntarios
              </h3>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
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

      <section className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Quote className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Lo que dicen de nosotros
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Voluntarios, familias y empresas que forman parte de XAMA.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div
                key={i}
                className="relative rounded-2xl border border-slate-200/60 bg-white/80 p-6 shadow-sm backdrop-blur-md transition-all hover:-translate-y-1 hover:shadow-lg dark:border-slate-800/60 dark:bg-slate-900/80"
              >
                <Quote className="absolute right-5 top-5 h-8 w-8 text-emerald-100 dark:text-emerald-900" />
                <p className="mb-6 text-sm italic leading-relaxed text-slate-700 dark:text-slate-200">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 border-t border-slate-100 pt-4 dark:border-slate-800">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    {t.author.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {t.author}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Para empresas
              </div>
              <h2 className="mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
                ¿Eres empresa?
              </h2>
              <p className="mb-6 text-slate-600 dark:text-slate-300">
                Si tu negocio genera excedentes alimentarios, podemos recogerlos
                cada semana y certificar el impacto ambiental y social. Sin
                coste para ti, con beneficios reales.
              </p>

              <ul className="mb-8 space-y-3">
                {companyBenefits.map((b, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="text-slate-700 dark:text-slate-200">
                      {b}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href={`mailto:${ong.email}?subject=Colaboraci%C3%B3n%20empresarial%20con%20${ong.name}`}
                className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-lg dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Contactar con {ong.name} <ArrowRight className="h-4 w-4" />
              </a>
            </div>

            <div className="rounded-2xl border border-slate-200/60 bg-white/80 p-8 shadow-sm backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Impacto corporativo
                </h3>
              </div>
              <p className="mb-6 text-sm text-slate-600 dark:text-slate-300">
                Cada kg de alimento recuperado evita ~2,5 kg de CO₂. Te damos
                las cifras listas para tu memoria de sostenibilidad.
              </p>
              <div className="space-y-3">
                <div className="rounded-lg border border-slate-100/60 bg-slate-50 p-3 dark:border-slate-800/60 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ahorro medio de una panadería
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ~30 kg/semana
                  </p>
                </div>
                <div className="rounded-lg border border-slate-100/60 bg-slate-50 p-3 dark:border-slate-800/60 dark:bg-slate-950">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    CO₂ evitado por donante/año
                  </p>
                  <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                    ~3.000 kg
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-emerald-100 bg-gradient-to-br from-emerald-600 to-emerald-800 py-20 text-white dark:border-emerald-900">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Únete a XAMA-ONG
          </h2>
          <p className="mb-8 text-lg text-emerald-50">
            Dona, hazte voluntario o trae el excedente de tu empresa. Cada gesto
            se convierte en comida sobre la mesa de una familia.
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

      <Footer />
    </main>
  );
}
