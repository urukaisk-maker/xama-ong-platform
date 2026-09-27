"use client";
import { useEffect, useState } from "react";
import { Plus, CheckCircle, Clock, Truck } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import ConfirmDelete, { TrashIcon } from "@/components/ConfirmDelete";
import Button from "@/components/ui/Button";
import { SkeletonCardGrid } from "@/components/ui/Loading";
import { api } from "@/lib/api";
import type { Delivery, Family } from "@/lib/types";

const COORD_ROLES = ["junta", "coordinador_reus", "coordinador_tarragona"];

export default function DeliveriesPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [site, setSite] = useState("reus");
  const [date, setDate] = useState(today);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [families, setFamilies] = useState<Family[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const { user } = useUser();
  const canDelete =
    user?.role_name != null && COORD_ROLES.includes(user.role_name);

  const load = async () => {
    setLoading(true);
    try {
      const [d, f] = await Promise.all([
        api<Delivery[]>(`/api/deliveries?site=${site}&date=${date}`),
        api<Family[]>(`/api/families?site=${site}`),
      ]);
      setDeliveries(d);
      setFamilies(f);
    } catch {
      toast.error("Error al cargar las entregas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [site, date]);

  const familyName = (id: string) =>
    families.find((f) => f.id === id)?.reference_code ?? id.slice(0, 8);

  const checkIn = async (id: string) => {
    try {
      await api(`/api/deliveries/${id}/check-in`, {
        method: "PATCH",
        body: JSON.stringify({ notes: "Entregada" }),
      });
      toast.success("Entrega registrada");
      load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    }
  };

  const deleteDelivery = async (id: string) => {
    await api(`/api/deliveries/${id}`, { method: "DELETE" });
    toast.success("Entrega borrada");
    load();
  };

  const inputCls =
    "rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  const done = deliveries.filter((d) => d.status === "entregada").length;
  const pending = deliveries.length - done;

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Entregas del día
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> {done}{" "}
              entregadas
            </span>
            {" · "}
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" /> {pending}{" "}
              pendientes
            </span>
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nueva entrega"}
        </Button>
      </div>

      {showForm && (
        <NewDeliveryForm
          families={families}
          defaultSite={site}
          defaultDate={date}
          onCreated={() => {
            setShowForm(false);
            toast.success("Entrega creada");
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
        <SkeletonCardGrid count={6} />
      ) : deliveries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="mb-3 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
              <Truck className="h-8 w-8 text-slate-400" />
            </div>
          </div>
          <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
            Sin entregas programadas
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Crea una entrega o cambia la fecha.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className={`group relative rounded-xl border bg-white p-4 shadow-sm transition-all hover:shadow-md dark:bg-slate-900 ${
                d.status === "entregada"
                  ? "border-emerald-200 dark:border-emerald-800"
                  : "border-slate-200 dark:border-slate-800"
              }`}
            >
              {canDelete && (
                <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                  <ConfirmDelete
                    title="¿Borrar esta entrega?"
                    message={`Entrega de ${familyName(d.family_id)} del ${d.delivery_date}.`}
                    onConfirm={() => deleteDelivery(d.id)}
                    trigger={TrashIcon}
                  />
                </div>
              )}

              <div className="mb-2 flex items-start justify-between pr-8">
                <div>
                  <p className="font-mono text-xs text-slate-500 dark:text-slate-400">
                    {d.id.slice(0, 8)}
                  </p>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {familyName(d.family_id)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                    d.status === "entregada"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                      : "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300"
                  }`}
                >
                  {d.status === "entregada" ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <Clock className="h-3 w-3" />
                  )}
                  {d.status}
                </span>
              </div>

              {d.checked_in_at && (
                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                  Entregada:{" "}
                  {new Date(d.checked_in_at).toLocaleString("es-ES")}
                </p>
              )}

              {d.status !== "entregada" && (
                <Button
                  variant="success"
                  size="sm"
                  className="w-full"
                  icon={<CheckCircle className="h-4 w-4" />}
                  onClick={() => checkIn(d.id)}
                >
                  Marcar como entregada
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}

function NewDeliveryForm({
  families,
  defaultSite,
  defaultDate,
  onCreated,
}: {
  families: Family[];
  defaultSite: string;
  defaultDate: string;
  onCreated: () => void;
}) {
  const [familyId, setFamilyId] = useState(families[0]?.id ?? "");
  const [deliveryDate, setDeliveryDate] = useState(defaultDate);
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (families.length && !familyId) setFamilyId(families[0].id);
  }, [families, familyId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/api/deliveries", {
        method: "POST",
        body: JSON.stringify({
          family_id: familyId,
          delivery_date: deliveryDate,
          site: defaultSite,
          notes: notes || null,
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
    <form
      onSubmit={submit}
      className="mb-6 animate-slide-up space-y-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <select
          value={familyId}
          onChange={(e) => setFamilyId(e.target.value)}
          className={inputCls}
          required
        >
          <option value="">Selecciona familia</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.reference_code} · {f.adults + f.minors} personas
            </option>
          ))}
        </select>
        <input
          type="date"
          value={deliveryDate}
          onChange={(e) => setDeliveryDate(e.target.value)}
          className={inputCls}
          required
        />
        <input
          placeholder="Notas"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className={inputCls}
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        disabled={!familyId}
        icon={<Plus className="h-4 w-4" />}
      >
        {loading ? "Creando…" : "Crear entrega"}
      </Button>
    </form>
  );
}
