"use client";
import { useEffect, ReactNode } from "react";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  width?: "md" | "lg" | "xl";
};

const widths = {
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
};

export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  width = "lg",
}: Props) {
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

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm transition-opacity duration-200 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Panel lateral */}
      <div
        className={`fixed inset-y-0 right-0 z-50 flex w-full ${widths[width]} flex-col border-l border-slate-200/60 bg-white/95 shadow-2xl backdrop-blur-md transition-transform duration-300 ease-out dark:border-slate-800/60 dark:bg-slate-900/95 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200/60 px-6 py-5 dark:border-slate-800/60">
          <div>
            <h2
              id="drawer-title"
              className="text-lg font-bold tracking-tight text-slate-900 dark:text-white"
            >
              {title}
            </h2>
            {subtitle && (
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="border-t border-slate-200/60 bg-slate-50/50 px-6 py-4 dark:border-slate-800/60 dark:bg-slate-800/30">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
