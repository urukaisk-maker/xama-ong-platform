import AnimatedCounter from "@/components/AnimatedCounter";

type Stats = {
  total_kg_recovered: number;
  co2_avoided_kg: number;
  nevera_served: number;
  total_families: number;
  total_people: number;
  total_volunteers: number;
  total_volunteer_hours: number;
  reus_families: number;
  tarragona_families: number;
};

async function getStats(): Promise<Stats | null> {
  // URL interna (para el servidor de Next dentro de Docker)
  // Fallback a la pública si no está definida (para desarrollo local sin Docker)
  const API =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    "http://localhost:8100";

  try {
    const res = await fetch(`${API}/api/public/stats`, {
      next: { revalidate: 60 }, // ISR: se regenera cada 60 seg
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export default async function PublicStats() {
  const stats = await getStats();

  if (!stats) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-32 animate-pulse rounded-xl bg-slate-100"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <StatCard icon="🥕" value={stats.total_kg_recovered} decimals={0} suffix=" kg" label="Alimentos recuperados" color="emerald" />
      <StatCard icon="🌱" value={stats.co2_avoided_kg} decimals={0} suffix=" kg" label="CO₂ evitado" color="green" />
      <StatCard icon="🍽" value={stats.nevera_served} decimals={0} label="Raciones Nevera" color="amber" />
      <StatCard icon="👥" value={stats.total_people} decimals={0} label="Personas atendidas" color="slate" />
      <StatCard icon="🏠" value={stats.total_families} decimals={0} label="Familias" color="emerald" />
      <StatCard icon="🤝" value={stats.total_volunteers} decimals={0} label="Voluntarios" color="green" />
      <StatCard icon="⏱" value={stats.total_volunteer_hours} decimals={1} suffix=" h" label="Horas aportadas" color="slate" />
      <StatCard icon="📍" value={stats.reus_families + stats.tarragona_families} decimals={0} label="Familias activas" color="amber" />
    </div>
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-2 text-2xl">{icon}</div>
      <div className={`text-2xl font-bold md:text-3xl ${colors[color]}`}>
        <AnimatedCounter target={value} decimals={decimals} suffix={suffix} />
      </div>
      <div className="mt-1 text-xs text-slate-500 md:text-sm">{label}</div>
    </div>
  );
}
