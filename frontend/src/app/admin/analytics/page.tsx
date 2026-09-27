"use client";
import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import { LoadingState } from "@/components/ui/Loading";
import { api } from "@/lib/api";

type MonthlyPoint = {
  month: number;
  year: number;
  kg_recovered: number;
  deliveries: number;
  nevera_served: number;
  volunteer_hours: number;
};

type SiteComparison = {
  site: string;
  families: number;
  people: number;
  deliveries_done: number;
  deliveries_pending: number;
};

type TopVolunteer = {
  user_id: string;
  full_name: string;
  hours: number;
  shifts: number;
};

type DeliveryStatus = {
  status: string;
  count: number;
};

type Analytics = {
  year: number;
  monthly: MonthlyPoint[];
  sites: SiteComparison[];
  top_volunteers: TopVolunteer[];
  delivery_status: DeliveryStatus[];
};

const MONTHS_SHORT = [
  "Ene", "Feb", "Mar", "Abr", "May", "Jun",
  "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
];

const PIE_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#3b82f6"];

const tooltipStyle = {
  backgroundColor: "#0f172a",
  border: "none",
  borderRadius: "8px",
  color: "white",
  fontSize: 12,
};

export default function AnalyticsPage() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());

  const { user } = useUser();

  useEffect(() => {
    if (!user) return;
    if (user.role_name !== "junta") {
      setErr("Solo la Junta puede acceder a esta sección.");
      setLoading(false);
      return;
    }
    setLoading(true);
    api<Analytics>(`/api/metrics/analytics?year=${year}`)
      .then(setData)
      .catch((e) => {
        const msg = e instanceof Error ? e.message : "Error";
        setErr(msg);
        toast.error("Error al cargar la analítica");
      })
      .finally(() => setLoading(false));
  }, [user, year]);

  if (loading) {
    return (
      <AppShell>
        <LoadingState label="Cargando analítica…" />
      </AppShell>
    );
  }

  if (err) {
    return (
      <AppShell>
        <p className="text-rose-600">{err}</p>
      </AppShell>
    );
  }

  if (!data) return null;

  const monthlyData = data.monthly.map((p) => ({
    name: MONTHS_SHORT[p.month - 1],
    "Kg recuperados": Math.round(p.kg_recovered),
    Entregas: p.deliveries,
    "Raciones Nevera": p.nevera_served,
    "Horas voluntariado": Math.round(p.volunteer_hours),
  }));

  const siteData = data.sites.map((s) => ({
    name: s.site === "reus" ? "Reus" : "Tarragona",
    Familias: s.families,
    Personas: s.people,
    "Entregas OK": s.deliveries_done,
    "Entregas pend.": s.deliveries_pending,
  }));

  const volunteersData = data.top_volunteers.map((v) => ({
    name:
      v.full_name.length > 20 ? v.full_name.slice(0, 18) + "…" : v.full_name,
    horas: Math.round(v.hours * 10) / 10,
  }));

  const statusData = data.delivery_status.map((s) => ({
    name:
      s.status === "entregada"
        ? "Entregadas"
        : s.status === "pendiente"
        ? "Pendientes"
        : s.status,
    value: s.count,
  }));

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Analítica
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Visualización de datos {year}
          </p>
        </div>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          {[year - 1, year, year + 1].map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <ChartCard title="Evolución mensual" height={320}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="Kg recuperados"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Raciones Nevera"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Entregas"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="Horas voluntariado"
              stroke="#8b5cf6"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Comparativa por sede" height={300}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={siteData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="name" stroke="#64748b" fontSize={13} />
            <YAxis stroke="#64748b" fontSize={12} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Familias" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Personas" fill="#059669" radius={[4, 4, 0, 0]} />
            <Bar
              dataKey="Entregas OK"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="Entregas pend."
              fill="#f59e0b"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ChartCard title="Top 10 voluntarios por horas" height={350}>
          {volunteersData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={volunteersData}
                layout="vertical"
                margin={{ left: 20, right: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" stroke="#64748b" fontSize={12} />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#64748b"
                  fontSize={11}
                  width={120}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="horas" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sin datos de voluntariado todavía
            </p>
          )}
        </ChartCard>

        <ChartCard title="Estado de entregas" height={350}>
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={110}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Sin datos de entregas
            </p>
          )}
        </ChartCard>
      </div>
    </AppShell>
  );
}

function ChartCard({
  title,
  height,
  children,
}: {
  title: string;
  height: number;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-xama-600" />
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>
      <div style={{ width: "100%", height }}>
        {children}
      </div>
    </section>
  );
}
