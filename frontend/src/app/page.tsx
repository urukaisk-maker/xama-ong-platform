"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import Card from "@/components/Card";
import { api } from "@/lib/api";
import type {
  FamilySummary,
  HoursSummary,
  InventorySummary,
} from "@/lib/types";

export default function DashboardPage() {
  const [inv, setInv] = useState<InventorySummary | null>(null);
  const [fam, setFam] = useState<FamilySummary | null>(null);
  const [vol, setVol] = useState<HoursSummary | null>(null);

  useEffect(() => {
    api<InventorySummary>("/api/inventory/summary").then(setInv).catch(() => {});
    api<FamilySummary>("/api/families-summary").then(setFam).catch(() => {});
    api<HoursSummary>("/api/volunteers/hours/summary")
      .then(setVol)
      .catch(() => {});
  }, []);

  return (
    <AppShell>
      <h1 className="mb-6 text-2xl font-bold">Dashboard</h1>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">
          Inventario
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card title="Productos" value={inv?.total_products ?? "—"} />
          <Card title="Lotes" value={inv?.total_batches ?? "—"} />
          <Card
            title="Stock (kg)"
            value={inv?.total_quantity_kg?.toFixed(1) ?? "—"}
            accent="emerald"
          />
          <Card
            title="Caducan pronto"
            value={inv?.expiring_soon_count ?? "—"}
            hint={`${inv?.expiring_soon_kg?.toFixed(1) ?? 0} kg en riesgo`}
            accent="rose"
          />
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">
          Familias
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card title="Total" value={fam?.total_families ?? "—"} />
          <Card title="Activas" value={fam?.active_families ?? "—"} accent="emerald" />
          <Card title="Reus" value={fam?.reus_families ?? "—"} />
          <Card title="Tarragona" value={fam?.tarragona_families ?? "—"} />
          <Card title="Personas" value={fam?.total_people ?? "—"} />
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase text-slate-500">
          Voluntariado
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card title="Voluntarios" value={vol?.total_volunteers ?? "—"} />
          <Card
            title="Horas totales"
            value={vol?.total_hours ?? "—"}
            accent="emerald"
          />
          <Card title="Turnos asignados" value={vol?.total_shifts_assigned ?? "—"} />
        </div>
      </section>
    </AppShell>
  );
}
