"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Shift } from "@/lib/types";

const ROLE_COLORS: Record<string, { bg: string; text: string; dot: string; label: string }> = {
  vehiculo: {
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
    label: "Vehículo",
  },
  clasificacion: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    label: "Clasificación",
  },
  cestas: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
    label: "Cestas",
  },
  puerta: {
    bg: "bg-rose-50",
    text: "text-rose-700",
    dot: "bg-rose-500",
    label: "Puerta",
  },
};

const MONTHS = [
  "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
  "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre",
];
const WEEKDAYS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function CalendarPage() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth()); // 0-11
  const [site, setSite] = useState<string>("");
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  // Calcular rango del mes (con margen de lunes a domingo)
  const { firstDay, lastDay, weeks } = useMemo(() => {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);

    // Empezamos en lunes
    const firstWeekday = (first.getDay() + 6) % 7; // lunes=0
    const start = new Date(first);
    start.setDate(first.getDate() - firstWeekday);

    // Terminamos en domingo
    const lastWeekday = (last.getDay() + 6) % 7;
    const end = new Date(last);
    end.setDate(last.getDate() + (6 - lastWeekday));

    // Generar matriz de semanas
    const days: Date[][] = [];
    const cursor = new Date(start);
    while (cursor <= end) {
      const week: Date[] = [];
      for (let i = 0; i < 7; i++) {
        week.push(new Date(cursor));
        cursor.setDate(cursor.getDate() + 1);
      }
      days.push(week);
    }

    return { firstDay: first, lastDay: last, weeks: days };
  }, [year, month]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const from = toISO(weeks[0][0]);
      const to = toISO(weeks[weeks.length - 1][6]);
      const q = new URLSearchParams({ from_date: from, to_date: to });
      if (site) q.set("site", site);
      const data = await api<Shift[]>(`/api/shifts?${q.toString()}`);
      setShifts(data);
      setLoading(false);
    };
    load();
  }, [year, month, site, weeks]);

  const shiftsByDay = useMemo(() => {
    const map: Record<string, Shift[]> = {};
    for (const s of shifts) {
      if (!map[s.shift_date]) map[s.shift_date] = [];
      map[s.shift_date].push(s);
    }
    return map;
  }, [shifts]);

  const prevMonth = () => {
    if (month === 0) {
      setYear(year - 1);
      setMonth(11);
    } else {
      setMonth(month - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (month === 11) {
      setYear(year + 1);
      setMonth(0);
    } else {
      setMonth(month + 1);
    }
    setSelectedDay(null);
  };

  const todayISO = toISO(today);

  const selectedShifts = selectedDay ? shiftsByDay[selectedDay] ?? [] : [];

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Calendario de turnos</h1>
          <p className="text-sm text-slate-500">
            Vista mensual · {shifts.length} turnos
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/shifts"
            className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
          >
            Vista lista
          </Link>
        </div>
      </div>

      {/* Controles */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={prevMonth}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            ←
          </button>
          <h2 className="text-lg font-semibold text-slate-900">
            {MONTHS[month]} {year}
          </h2>
          <button
            onClick={nextMonth}
            className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            →
          </button>
          <button
            onClick={() => {
              setYear(today.getFullYear());
              setMonth(today.getMonth());
            }}
            className="ml-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-600 hover:bg-slate-50"
          >
            Hoy
          </button>
        </div>

        <select
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="">Todas las sedes</option>
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
      </div>

      {/* Leyenda */}
      <div className="mb-4 flex flex-wrap gap-3 text-xs">
        {Object.entries(ROLE_COLORS).map(([key, c]) => (
          <div key={key} className="flex items-center gap-1.5">
            <span className={`h-2.5 w-2.5 rounded-full ${c.dot}`} />
            <span className="text-slate-600">{c.label}</span>
          </div>
        ))}
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          {/* Calendario */}
          <div className="lg:col-span-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              {/* Cabecera de días */}
              <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                {WEEKDAYS.map((d) => (
                  <div
                    key={d}
                    className="px-2 py-2 text-center text-xs font-semibold uppercase text-slate-500"
                  >
                    {d}
                  </div>
                ))}
              </div>

              {/* Semanas */}
              <div className="grid grid-cols-7">
                {weeks.flat().map((d, i) => {
                  const iso = toISO(d);
                  const inMonth = d.getMonth() === month;
                  const isToday = iso === todayISO;
                  const dayShifts = shiftsByDay[iso] ?? [];
                  const selected = iso === selectedDay;

                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedDay(iso)}
                      className={`relative min-h-[90px] border-b border-r border-slate-100 p-2 text-left transition ${
                        !inMonth ? "bg-slate-50/50" : "bg-white"
                      } ${selected ? "ring-2 ring-emerald-500 ring-inset" : "hover:bg-slate-50"}`}
                    >
                      <div
                        className={`mb-1 text-xs font-semibold ${
                          isToday
                            ? "inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-600 text-white"
                            : inMonth
                            ? "text-slate-700"
                            : "text-slate-300"
                        }`}
                      >
                        {d.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {dayShifts.slice(0, 3).map((s) => {
                          const c = ROLE_COLORS[s.role] ?? {
                            bg: "bg-slate-100",
                            text: "text-slate-700",
                            dot: "bg-slate-400",
                            label: s.role,
                          };
                          return (
                            <div
                              key={s.id}
                              className={`flex items-center gap-1 rounded px-1 py-0.5 text-[10px] ${c.bg} ${c.text}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                              <span className="truncate">{c.label}</span>
                            </div>
                          );
                        })}
                        {dayShifts.length > 3 && (
                          <div className="text-[10px] text-slate-400">
                            +{dayShifts.length - 3} más
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div className="lg:col-span-1">
            {selectedDay ? (
              <div className="rounded-xl border border-slate-200 bg-white p-5">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {new Date(selectedDay + "T00:00:00").toLocaleDateString(
                      "es-ES",
                      {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      }
                    )}
                  </h3>
                  <button
                    onClick={() => setSelectedDay(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ✕
                  </button>
                </div>

                {selectedShifts.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    Sin turnos programados
                  </p>
                ) : (
                  <div className="space-y-3">
                    {selectedShifts.map((s) => {
                      const c = ROLE_COLORS[s.role] ?? {
                        bg: "bg-slate-100",
                        text: "text-slate-700",
                        dot: "bg-slate-400",
                        label: s.role,
                      };
                      return (
                        <div
                          key={s.id}
                          className={`rounded-lg border border-slate-200 p-3 ${c.bg}`}
                        >
                          <div className="mb-1 flex items-center justify-between">
                            <span className={`text-sm font-semibold ${c.text}`}>
                              {c.label}
                            </span>
                            <span className="text-xs capitalize text-slate-500">
                              {s.site}
                            </span>
                          </div>
                          <div className="mb-2 text-xs text-slate-600">
                            {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-slate-500">
                              {s.assignments.length}/{s.capacity} apuntados
                            </span>
                            {s.assignments.length < s.capacity && (
                              <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-[10px] font-medium text-white">
                                Libre
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
                <div className="mb-2 text-3xl">📅</div>
                <p className="text-sm text-slate-500">
                  Selecciona un día para ver los turnos
                </p>
              </div>
            )}

            {/* Resumen del mes */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase text-slate-500">
                Resumen de {MONTHS[month]}
              </h3>
              <div className="space-y-2 text-sm">
                {Object.entries(ROLE_COLORS).map(([key, c]) => {
                  const count = shifts.filter((s) => s.role === key).length;
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`h-2 w-2 rounded-full ${c.dot}`} />
                        <span className="text-slate-600">{c.label}</span>
                      </div>
                      <span className="font-semibold text-slate-900">
                        {count}
                      </span>
                    </div>
                  );
                })}
                <div className="mt-2 border-t border-slate-100 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-600">Total</span>
                    <span className="font-bold text-slate-900">
                      {shifts.length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
