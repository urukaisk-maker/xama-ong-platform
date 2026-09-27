"use client";
import { useEffect } from "react";
import { SITE_CONFIG } from "@/lib/site-config";

const { developer } = SITE_CONFIG;

export default function DeveloperModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  // Cierra con Escape + bloquea scroll del body
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dev-modal-title"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-10 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón cerrar */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          ✕
        </button>

        {/* Cabecera */}
        <div className="mb-6 flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 text-2xl font-bold text-white">
            MC
          </div>
          <div>
            <h2
              id="dev-modal-title"
              className="text-2xl font-bold text-slate-900 dark:text-white"
            >
              {developer.name}
            </h2>
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {developer.role}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              📍 {developer.location}
            </p>
          </div>
        </div>

        {/* Bio corta */}
        <div className="mb-6 rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
          <p className="text-sm italic text-slate-700 dark:text-slate-300">
            "{developer.bio}"
          </p>
        </div>

        {/* Bio larga */}
        <div className="prose prose-sm max-w-none text-slate-700 dark:text-slate-300">
          <p className="whitespace-pre-line leading-relaxed">
            {developer.longBio}
          </p>
        </div>

        {/* Enlaces */}
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={developer.presentationUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
          >
            Descubre más
            <span aria-hidden>→</span>
          </a>
          {developer.projects.map((p) => (
            <a
              key={p.url}
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {p.label}
              <span aria-hidden>↗</span>
            </a>
          ))}
        </div>

        {/* Footer del modal */}
        <div className="mt-8 border-t border-slate-200 pt-4 text-center text-xs text-slate-400 dark:border-slate-800">
          Desarrollador de la Plataforma Integral XAMA-ONG
        </div>
      </div>
    </div>
  );
}
