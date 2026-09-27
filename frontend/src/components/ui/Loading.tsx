"use client";
import { Loader2 } from "lucide-react";

export function Spinner({ className = "h-5 w-5" }: { className?: string }) {
  return <Loader2 className={`animate-spin text-xama-600 ${className}`} />;
}

export function LoadingState({ label = "Cargando…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 p-12 text-slate-500 dark:text-slate-400">
      <Spinner />
      <span>{label}</span>
    </div>
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-t border-slate-100 dark:border-slate-800">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full text-sm">
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
