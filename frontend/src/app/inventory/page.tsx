"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import { api } from "@/lib/api";
import type { Batch, Product } from "@/lib/types";

function daysUntil(dateStr: string): number {
  const d = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function InventoryPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    setLoading(true);
    const [b, p] = await Promise.all([
      api<Batch[]>("/api/inventory/batches"),
      api<Product[]>("/api/inventory/products"),
    ]);
    setBatches(b);
    setProducts(p);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? "—";

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Inventario</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700"
        >
          {showForm ? "Cancelar" : "+ Nuevo lote"}
        </button>
      </div>

      {showForm && (
        <NewBatchForm
          products={products}
          onCreated={() => {
            setShowForm(false);
            load();
          }}
        />
      )}

      {loading ? (
        <p className="text-slate-500">Cargando…</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Caducidad</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody>
              {batches.map((b) => {
                const days = daysUntil(b.expiry_date);
                const soon = days <= 7 && days >= 0;
                const expired = days < 0;
                return (
                  <tr key={b.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-medium">
                      {productName(b.product_id)}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{b.origin}</td>
                    <td className="px-4 py-3">{b.quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          expired
                            ? "text-rose-600 font-medium"
                            : soon
                            ? "text-amber-600 font-medium"
                            : ""
                        }
                      >
                        {b.expiry_date} ({days} d)
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          b.status === "disponible"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {batches.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Sin lotes
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function NewBatchForm({
  products,
  onCreated,
}: {
  products: Product[];
  onCreated: () => void;
}) {
  const [productId, setProductId] = useState("");
  const [productName, setProductName] = useState("");
  const [origin, setOrigin] = useState("comercio_local");
  const [quantity, setQuantity] = useState(1);
  const [expiry, setExpiry] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (products.length && !productId) setProductId(products[0].id);
  }, [products, productId]);

  const createProduct = async () => {
    if (!productName.trim()) return;
    const p = await api<Product>("/api/inventory/products", {
      method: "POST",
      body: JSON.stringify({ name: productName, unit: "kg" }),
    });
    setProductId(p.id);
    setProductName("");
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await api("/api/inventory/batches", {
        method: "POST",
        body: JSON.stringify({
          product_id: productId,
          origin,
          quantity,
          expiry_date: expiry,
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
      <div className="flex gap-2">
        <input
          placeholder="Nuevo producto…"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
        <button
          type="button"
          onClick={createProduct}
          className="rounded-md bg-slate-100 px-3 py-2 text-sm hover:bg-slate-200"
        >
          Crear producto
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="comercio_local">Comercio local</option>
          <option value="donacion_corporativa">Donación corporativa</option>
          <option value="excedente_agricola">Excedente agrícola</option>
          <option value="comida_cocinada">Comida cocinada</option>
          <option value="campana_solidaria">Campaña solidaria</option>
        </select>

        <input
          type="number"
          step="0.01"
          min="0.01"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          placeholder="Cantidad"
        />

        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
          required
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <button
        type="submit"
        disabled={loading || !productId || !expiry}
        className="rounded-md bg-slate-900 px-4 py-2 text-sm text-white hover:bg-slate-700 disabled:opacity-50"
      >
        {loading ? "Guardando…" : "Crear lote"}
      </button>
    </form>
  );
}
