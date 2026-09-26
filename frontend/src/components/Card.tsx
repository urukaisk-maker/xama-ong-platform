import { ReactNode } from "react";

export default function Card({
  title,
  value,
  hint,
  accent = "slate",
}: {
  title: string;
  value: ReactNode;
  hint?: string;
  accent?: "slate" | "emerald" | "amber" | "rose";
}) {
  const accents = {
    slate: "text-slate-900",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  };
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm text-slate-500">{title}</p>
      <p className={`mt-1 text-3xl font-bold ${accents[accent]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}
