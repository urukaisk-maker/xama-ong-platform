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

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-md bg-slate-200/70 dark:bg-slate-800/70 ${className}`}
    />
  );
}

export function SkeletonRow({ cols = 4 }: { cols?: number }) {
  return (
    <tr className="border-t border-slate-100/60 dark:border-slate-800/60">
      {[...Array(cols)].map((_, i) => (
        <td key={i} className="px-4 py-3">
          <Skeleton className={`h-4 ${i === 0 ? "w-3/4" : "w-1/2"}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({
  rows = 6,
  cols = 4,
}: {
  rows?: number;
  cols?: number;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white/80 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200/60 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-800/40">
          <tr>
            {[...Array(cols)].map((_, i) => (
              <th key={i} className="px-4 py-3">
                <Skeleton className="h-3 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[...Array(rows)].map((_, i) => (
            <SkeletonRow key={i} cols={cols} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SkeletonKPI({
  count = 4,
  cols = "md:grid-cols-4",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-4 ${cols}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200/60 bg-white/80 p-6 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80"
        >
          <Skeleton className="mb-3 h-4 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonDashboard() {
  return (
    <div className="space-y-8">
      <section>
        <Skeleton className="mb-3 h-4 w-24" />
        <SkeletonKPI count={4} cols="md:grid-cols-4" />
      </section>
      <section>
        <Skeleton className="mb-3 h-4 w-24" />
        <SkeletonKPI count={4} cols="md:grid-cols-4" />
      </section>
      <section>
        <Skeleton className="mb-3 h-4 w-24" />
        <SkeletonKPI count={5} cols="md:grid-cols-5" />
      </section>
      <section>
        <Skeleton className="mb-3 h-4 w-24" />
        <SkeletonKPI count={3} cols="md:grid-cols-3" />
      </section>
    </div>
  );
}

export function SkeletonCardGrid({
  count = 6,
  cols = "md:grid-cols-2 lg:grid-cols-3",
}: {
  count?: number;
  cols?: string;
}) {
  return (
    <div className={`grid grid-cols-1 gap-3 ${cols}`}>
      {[...Array(count)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-slate-200/60 bg-white/80 p-4 backdrop-blur-md dark:border-slate-800/60 dark:bg-slate-900/80"
        >
          <div className="mb-2 flex items-start justify-between">
            <div className="flex-1">
              <Skeleton className="mb-2 h-3 w-16" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>
          <Skeleton className="mb-3 h-3 w-32" />
          <Skeleton className="h-8 w-full rounded-md" />
        </div>
      ))}
    </div>
  );
}
