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
      <nav className="border-b border-emerald-100 bg-white/80 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
              X
            </div>
            <span className="text-lg font-bold text-slate-900">XAMA-ONG</span>
          </div>
          <div className="flex items-center gap-3">
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
            href="#ayudar"
            className="rounded-md bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            Quiero ayudar
          </a>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Acceso voluntarios
          </Link>
        </div>
      </section>

      {/* ─── Contadores ─── */}
      <section className="mx-auto max-w-6xl px-6 pb-16">
        {stats ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              icon="🥕"
              value={stats.total_kg_recovered}
              decimals={0}
              suffix=" kg"
              label="Alimentos recuperados"
              color="emerald"
            />
            <StatCard
              icon="🌱"
              value={stats.co2_avoided_kg}
              decimals={0}
              suffix=" kg"
              label="CO₂ evitado"
              color="green"
            />
            <StatCard
              icon="🍽"
              value={stats.nevera_served}
              decimals={0}
              label="Raciones Nevera"
              color="amber"
            />
            <StatCard
              icon="👥"
              value={stats.total_people}
              decimals={0}
              label="Personas atendidas"
              color="slate"
            />
            <StatCard
              icon="🏠"
              value={stats.total_families}
              decimals={0}
              label="Familias"
              color="emerald"
            />
            <StatCard
              icon="🤝"
              value={stats.total_volunteers}
              decimals={0}
              label="Voluntarios"
              color="green"
            />
            <StatCard
              icon="⏱"
              value={stats.total_volunteer_hours}
              decimals={1}
              suffix=" h"
              label="Horas aportadas"
              color="slate"
            />
            <StatCard
              icon="📍"
              value={stats.reus_families + stats.tarragona_families}
              decimals={0}
              label="Familias activas"
              color="amber"
            />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-32 animate-pulse rounded-xl bg-slate-100"
              />
            ))}
          </div>
        )}
      </section>

      {/* ─── Cómo ayudar ─── */}
      <section id="ayudar" className="border-t border-slate-100 bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Tres formas de cambiar las cosas
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600">
              Cada gesto, cada hora, cada donativo se convierte en comida
              sobre la mesa de una familia.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <HelpCard
              icon="💶"
              title="Dona"
              desc="Un donativo puntual o mensual cubre el transporte, el almacén y la logística de reparto. Con 20€ alimentamos a una familia durante una semana."
              cta="Hacer un donativo"
              href="#donar"
            />
            <HelpCard
              icon="⏰"
              title="Sé voluntario"
              desc="¿Tienes 4 horas a la semana? Necesitamos manos para recoger, clasificar y repartir. Reus y Tarragona, turnos de mañana y tarde."
              cta="Apuntarme"
              href="#voluntariado"
            />
            <HelpCard
              icon="🏢"
              title="Somos tu empresa"
              desc="Si tu negocio genera excedentes alimentarios, podemos recogerlos cada semana y certificar el impacto ambiental y social."
              cta="Contactar"
              href="mailto:hola@xamaong.cat"
            />
          </div>
        </div>
      </section>

      {/* ─── Cómo funciona ─── */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <h2 className="mb-12 text-center text-3xl font-bold text-slate-900 md:text-4xl">
          Cómo funciona
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <Step
            num="01"
            title="Recogemos"
            desc="Comercios, agricultores y empresas nos avisan de sus excedentes. Nuestros voluntarios los recogen en furgoneta."
          />
          <Step
            num="02"
            title="Clasificamos"
            desc="En el almacén revisamos el estado de cada producto, controlamos caducidades y preparamos las cestas."
          />
          <Step
            num="03"
            title="Repartimos"
            desc="Cada semana, familias de Reus y Tarragona vienen a recoger su cesta. Sin colas, sin papeles, con dignidad."
          />
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-slate-200 bg-slate-900 py-12 text-slate-300">
        <div className="mx-auto max-w-6xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold">
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
                <li>📧 hola@xamaong.cat</li>
                <li>📞 977 000 000</li>
                <li>📍 Reus · Tarragona</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-white">
                Enlaces
              </h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <a href="#ayudar" className="hover:text-white">
                    Cómo ayudar
                  </a>
                </li>
                <li>
                  <Link href="/login" className="hover:text-white">
                    Acceso voluntarios
                  </Link>
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
            © {new Date().getFullYear()} XAMA-ONG · Hecho con voluntad y código
            abierto
          </div>
        </div>
      </footer>
    </main>
  );
}

function StatCard({
  icon,
  value,
  decimals,
  suffix,
  label,
  color,
}: {
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

function HelpCard({
  icon,
  title,
  desc,
  cta,
  href,
}: {
  icon: string;
  title: string;
  desc: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-4 text-3xl">{icon}</div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mb-6 flex-1 text-sm text-slate-600">{desc}</p>
      <a
        href={href}
        className="inline-block rounded-md bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
      >
        {cta}
      </a>
    </div>
  );
}

function Step({
  num,
  title,
  desc,
}: {
  num: string;
  title: string;
  desc: string;
}) {
  return (
    <div>
      <div className="mb-3 text-sm font-bold text-emerald-600">{num}</div>
      <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>
      <p className="text-sm text-slate-600">{desc}</p>
    </div>
  );
}
