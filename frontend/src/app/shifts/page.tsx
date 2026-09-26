"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Shift } from "@/lib/types";

export default function ShiftsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [site, setSite] = useState("reus");
  const [date, setDate] = useState(today);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const s = await api<Shift[]>(
      `/api/shifts?site=${site}&target_date=${date}`
    );
    setShifts(s);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [site, date]);

  const join = async (id: string) => {
    try {
      await api(`/api/shifts/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      load();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error");
    }
  };

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Cuadrantes</h1>

      <div className="mb-6 flex gap-3">
        <select
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="space-y-3">
          {shifts.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200 bg-white p-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold capitalize">
                    {s.role}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                  </p>
                </div>
                <span className="text-xs text-slate-500">
                  {s.assignments.length}/{s.capacity}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {s.assignments.map((a) => (
                  <span
                    key={a.id}
                    className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-700"
                  >
                    {a.user_id.slice(0, 8)}
                  </span>
                ))}
                {s.assignments.length < s.capacity && (
                  <button
                    onClick={() => join(s.id)}
                    className="rounded-full border border-dashed border-slate-300 px-3 py-1 text-xs text-slate-600 hover:bg-slate-50"
                  >
                    + Apuntarme
                  </button>
                )}
              </div>
            </div>
          ))}
          {shifts.length === 0 && (
            <p className="text-slate-400">Sin turnos para este día</p>
          )}
        </div>
      )}
    </AppShell>
  );
}
