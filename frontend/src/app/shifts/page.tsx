"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import { api } from "@/lib/api";
import type { Shift } from "@/lib/types";

const COORD_ROLES = ["junta", "coordinador_reus", "coordinador_tarragona"];

export default function ShiftsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [site, setSite] = useState("reus");
  const [date, setDate] = useState(today);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { user } = useUser();
  const isCoord =
    user?.role_name != null && COORD_ROLES.includes(user.role_name);

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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Cuadrantes</h1>
        {isCoord && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
          >
            {showForm ? "Cancelar" : "+ Nuevo turno"}
          </button>
        )}
      </div>

      {showForm && isCoord && (
        <NewShiftForm
          defaultSite={site}
          defaultDate={date}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

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
                  <p className="text-sm font-semibold capitalize">{s.role}</p>
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

function NewShiftForm({
  defaultSite,
  defaultDate,
  onCreated,
}: {
  defaultSite: string;
  defaultDate: string;
  onCreated: () => void;
}) {
  const [data, setData] = useState({
    shift_date: defaultDate,
    site: defaultSite,
    role: "puerta",
    start_time: "10:00",
    end_time: "13:00",
    capacity: 1,
    notes: "",
  });
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/api/shifts", {
        method: "POST",
        body: JSON.stringify({
          shift_date: data.shift_date,
          site: data.site,
          role: data.role,
          start_time: `${data.start_time}:00`,
          end_time: `${data.end_time}:00`,
          capacity: data.capacity,
          notes: data.notes || null,
        }),
      });
      onCreated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={submit}
      className="mb-6 space-y-3 rounded-xl border border-slate-200 bg-white p-5"
    >
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input
          type="date"
          value={data.shift_date}
          onChange={(e) => setData({ ...data, shift_date: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <select
          value={data.site}
          onChange={(e) => setData({ ...data, site: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
        <select
          value={data.role}
          onChange={(e) => setData({ ...data, role: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="vehiculo">Vehículo</option>
          <option value="clasificacion">Clasificación</option>
          <option value="cestas">Cestas</option>
          <option value="puerta">Puerta</option>
        </select>
        <input
          type="number"
          min="1"
          max="50"
          value={data.capacity}
          onChange={(e) =>
            setData({ ...data, capacity: Number(e.target.value) })
          }
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Capacidad"
        />
        <input
          type="time"
          value={data.start_time}
          onChange={(e) => setData({ ...data, start_time: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          type="time"
          value={data.end_time}
          onChange={(e) => setData({ ...data, end_time: e.target.value })}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
        <input
          placeholder="Notas"
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          className="col-span-2 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Creando…" : "Crear turno"}
      </button>
    </form>
  );
}
