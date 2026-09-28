"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Calendar, Plus, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Surface from "@/components/ui/Surface";
import { Avatar, AvatarGroup, EmptySlot } from "@/components/ui/Avatar";
import { LoadingState } from "@/components/ui/Loading";
import { api } from "@/lib/api";
import type { Shift } from "@/lib/types";

const COORD_ROLES = ["junta", "coordinador_reus", "coordinador_tarragona"];

const ROLE_LABELS: Record<string, string> = {
  vehiculo: "Vehículo",
  clasificacion: "Clasificación",
  cestas: "Cestas",
  puerta: "Puerta",
};

const ROLE_VARIANTS: Record<
  string,
  "info" | "success" | "warning" | "danger"
> = {
  vehiculo: "info",
  clasificacion: "success",
  cestas: "warning",
  puerta: "danger",
};

export default function ShiftsPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [site, setSite] = useState("reus");
  const [date, setDate] = useState(today);
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [joiningId, setJoiningId] = useState<string | null>(null);

  const { user } = useUser();
  const isCoord =
    user?.role_name != null && COORD_ROLES.includes(user.role_name);

  const load = async () => {
    setLoading(true);
    try {
      const s = await api<Shift[]>(
        `/api/shifts?site=${site}&target_date=${date}`
      );
      setShifts(s);
    } catch {
      toast.error("Error al cargar los turnos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [site, date]);

  const join = async (id: string) => {
    setJoiningId(id);
    try {
      await api(`/api/shifts/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      toast.success("Te has apuntado al turno");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setJoiningId(null);
    }
  };

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Cuadrantes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {shifts.length} turno{shifts.length === 1 ? "" : "s"} en {site} ·{" "}
            {new Date(date).toLocaleDateString("es-ES", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/shifts/calendar">
            <Button
              variant="outline"
              icon={<Calendar className="h-4 w-4" />}
            >
              Ver calendario
            </Button>
          </Link>
          {isCoord && (
            <Button
              variant="primary"
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancelar" : "Nuevo turno"}
            </Button>
          )}
        </div>
      </div>

      {showForm && isCoord && (
        <NewShiftForm
          defaultSite={site}
          defaultDate={date}
          onCreated={() => {
            setShowForm(false);
            toast.success("Turno creado");
            load();
          }}
        />
      )}

      <div className="mb-6 flex gap-3">
        <select
          value={site}
          onChange={(e) => setSite(e.target.value)}
          className={inputCls}
        >
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputCls}
        />
      </div>

      {loading ? (
        <LoadingState label="Cargando turnos…" />
      ) : shifts.length === 0 ? (
        <Surface hover={false} className="p-16 text-center">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Calendar className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            Sin turnos para este día
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Cambia la fecha o crea un turno nuevo.
          </p>
        </Surface>
      ) : (
        <div className="space-y-3">
          {shifts.map((s) => {
            const names = s.assignments
              .map((a) => a.user_name ?? a.user_id.slice(0, 8))
              .filter((n) => n);
            const free = s.capacity - s.assignments.length;

            return (
              <Surface key={s.id} className="p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <Badge variant={ROLE_VARIANTS[s.role] ?? "neutral"}>
                        {ROLE_LABELS[s.role] ?? s.role}
                      </Badge>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {s.start_time.slice(0, 5)} – {s.end_time.slice(0, 5)}
                      </span>
                    </div>
                    {s.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {s.notes}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    <span className="font-medium">
                      {s.assignments.length}/{s.capacity}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {names.length > 0 && (
                    <AvatarGroup names={names} max={5} size="md" />
                  )}

                  {/* Puestos libres con borde punteado */}
                  {free > 0 &&
                    Array.from({ length: Math.min(free, 3) }).map((_, i) => (
                      <EmptySlot key={i} size="md" label="Puesto disponible" />
                    ))}

                  {free > 0 && (
                    <Button
                      size="sm"
                      variant="outline"
                      loading={joiningId === s.id}
                      icon={<UserPlus className="h-3.5 w-3.5" />}
                      onClick={() => join(s.id)}
                    >
                      {joiningId === s.id ? "Apuntando…" : "Apuntarme"}
                    </Button>
                  )}
                  {free === 0 && (
                    <Badge variant="success">
                      Completo
                    </Badge>
                  )}
                </div>
              </Surface>
            );
          })}
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

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <Surface hover={false} className="mb-6 animate-slide-up space-y-4 p-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <input
          type="date"
          value={data.shift_date}
          onChange={(e) => setData({ ...data, shift_date: e.target.value })}
          className={inputCls}
          required
        />
        <select
          value={data.site}
          onChange={(e) => setData({ ...data, site: e.target.value })}
          className={inputCls}
        >
          <option value="reus">Reus</option>
          <option value="tarragona">Tarragona</option>
        </select>
        <select
          value={data.role}
          onChange={(e) => setData({ ...data, role: e.target.value })}
          className={inputCls}
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
          className={inputCls}
          placeholder="Capacidad"
        />
        <input
          type="time"
          value={data.start_time}
          onChange={(e) => setData({ ...data, start_time: e.target.value })}
          className={inputCls}
          required
        />
        <input
          type="time"
          value={data.end_time}
          onChange={(e) => setData({ ...data, end_time: e.target.value })}
          className={inputCls}
          required
        />
        <input
          placeholder="Notas"
          value={data.notes}
          onChange={(e) => setData({ ...data, notes: e.target.value })}
          className={`col-span-2 ${inputCls}`}
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        icon={<Plus className="h-4 w-4" />}
      >
        {loading ? "Creando…" : "Crear turno"}
      </Button>
    </Surface>
  );
}
