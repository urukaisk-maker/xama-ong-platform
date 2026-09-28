cat > ~/proyectos/xama-ong-platform/frontend/src/components/public/SponsorsSection.tsx <<'EOF'
import {
  Instagram,
  Twitter,
  Facebook,
  Play,
  ExternalLink,
  Heart,
  Users,
} from "lucide-react";
import { SITE_CONFIG } from "@/lib/site-config";

const { ong } = SITE_CONFIG;

const SOCIAL_ICONS = {
  instagram: Instagram,
  twitter: Twitter,
  facebook: Facebook,
  youtube: Play,
} as const;

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  twitter: "X / Twitter",
  facebook: "Facebook",
  youtube: "YouTube",
};

export default function SponsorsSection() {
  const socialEntries = Object.entries(ong.social).filter(
    ([, url]) => url && url.length > 0
  ) as Array<[keyof typeof SOCIAL_ICONS, string]>;

  return (
    <section className="border-t border-slate-100 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-6 py-20">
        {socialEntries.length > 0 && (
          <div className="mb-16 text-center">
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                <Heart className="h-6 w-6" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
              Síguenos
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
              Publicamos el día a día de XAMA: recogidas, repartos y
              agradecimientos a quienes lo hacen posible.
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              {socialEntries.map(([key, url]) => {
                const Icon = SOCIAL_ICONS[key];
                return (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={SOCIAL_LABELS[key] ?? key}
                    className="group flex items-center gap-2 rounded-full border border-slate-200/60 bg-white/80 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-md transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:text-emerald-600 hover:shadow-md dark:border-slate-800/60 dark:bg-slate-900/80 dark:text-slate-200 dark:hover:border-emerald-700 dark:hover:text-emerald-400"
                  >
                    <Icon className="h-4 w-4" />
                    <span>{SOCIAL_LABELS[key] ?? key}</span>
                  </a>
                );
              })}
            </div>
          </div>
        )}

        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl dark:text-white">
            Con el apoyo de
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-slate-600 dark:text-slate-300">
            Instituciones, empresas y entidades que hacen posible nuestra
            actividad diaria.
          </p>

          <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-2xl border border-slate-200/60 bg-white p-4 shadow-sm dark:border-slate-800/60 dark:bg-slate-900/80">
            <img
              src="/patrocinadores.jpg"
              alt="Instituciones y empresas que apoyan a XAMA-ONG"
              className="h-auto w-full"
              loading="lazy"
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
            {ong.sponsors.map((s) => (
              <span key={s.name}>{s.name}</span>
            ))}
          </div>
        </div>

        {ong.externalLinks.length > 0 && (
          <div className="mt-16 rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-8 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Reconocimiento
            </p>
            {ong.externalLinks.map((link) => (
              <a
                key={link.url}
                href={link.url}
                target="_blank"
                rel="noreferrer"
                className="group mt-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-900 transition hover:text-emerald-600 dark:text-white dark:hover:text-emerald-400"
              >
                {link.label}
                <ExternalLink className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </a>
            ))}
            <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              XAMA forma parte de la Xarxa d'Ajuda Mútua Alimentària de
              Catalunya, una red de entidades que trabajan juntas para
              garantizar el derecho a la alimentación.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
EOF
