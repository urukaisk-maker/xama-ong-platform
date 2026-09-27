"use client";
import { useEffect, useState } from "react";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import ConfirmDelete, { TrashIcon } from "@/components/ConfirmDelete";
import Button from "@/components/ui/Button";
import { LoadingState } from "@/components/ui/Loading";
import { api } from "@/lib/api";
import type { Batch, Product } from "@/lib/types";

const COORD_ROLES = ["junta", "coordinador_reus", "coordinador_tarragona"];

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

  const { user } = useUser();
  const canDelete =
    user?.role_name != null && COORD_ROLES.includes(user.role_name);

  const load = async () => {
    setLoading(true);
    try {
      const [b, p] = await Promise.all([
        api<Batch[]>("/api/inventory/batches"),
        api<Product[]>("/api/inventory/products"),
      ]);
      setBatches(b);
      setProducts(p);
    } catch {
      toast.error("Error al cargar el inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? "—";

  const deleteBatch = async (id: string) => {
    await api(`/api/inventory/batches/${id}`, { method: "DELETE" });
    toast.success("Lote borrado");
    load();
  };

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Inventario
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {batches.length} lote{batches.length === 1 ? "" : "s"} ·{" "}
            {products.length} producto{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? "Cancelar" : "Nuevo lote"}
        </Button>
      </div>

      {showForm && (
        <NewBatchForm
          products={products}
          onCreated={() => {
            setShowForm(false);
            toast.success("Lote creado");
            load();
          }}
        />
      )}

      {loading ? (
        <LoadingState label="Cargando inventario…" />
      ) : batches.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Caducidad</th>
                <th className="px-4 py-3">Estado</th>
                {canDelete && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="dark:text-slate-200">
              {batches.map((b) => {
                const days = daysUntil(b.expiry_date);
                const soon = days <= 7 && days >= 0;
                const expired = days < 0;
                return (
                  <tr
                    key={b.id}
                    className="border-t border-slate-100 transition hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-medium">
                      {productName(b.product_id)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {b.origin.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 font-mono">{b.quantity}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium ${
                          expired
                            ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                            : soon
                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                            : "text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {(expired || soon) && (
                          <AlertTriangle className="h-3 w-3" />
                        )}
                        {b.expiry_date}{" "}
                        <span className="opacity-70">
                          ({days >= 0 ? `+${days}` : days} d)
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          b.status === "disponible"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {b.status}
                      </span>
                    </td>
                    {canDelete && (
                      <td className="px-4 py-3 text-right">
                        <ConfirmDelete
                          title="¿Borrar este lote?"
                          message={`${productName(b.product_id)} · ${b.quantity} · caduca el ${b.expiry_date}. Esta acción no se puede deshacer.`}
                          onConfirm={() => deleteBatch(b.id)}
                          trigger={TrashIcon}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </AppShell>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-16 text-center shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
          <Package className="h-8 w-8 text-slate-400" />
        </div>
      </div>
      <h3 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">
        Sin lotes todavía
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Pulsa "Nuevo lote" para registrar tu primera entrada de alimentos.
      </p>
    </div>
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
  const [creatingProduct, setCreatingProduct] = useState(false);

  useEffect(() => {
    if (products.length && !productId) setProductId(products[0].id);
  }, [products, productId]);

  const createProduct = async () => {
    if (!productName.trim()) return;
    setCreatingProduct(true);
    try {
      const p = await api<Product>("/api/inventory/products", {
        method: "POST",
        body: JSON.stringify({ name: productName, unit: "kg" }),
      });
      setProductId(p.id);
      setProductName("");
      toast.success(`Producto "${p.name}" creado`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al crear producto");
    } finally {
      setCreatingProduct(false);
    }
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

  const inputCls =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <form
      onSubmit={submit}
      className="mb-6 animate-slide-up space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex gap-2">
        <input
          placeholder="Nuevo producto (ej. Manzanas)"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          className={`flex-1 ${inputCls}`}
        />
        <Button
          type="button"
          variant="outline"
          loading={creatingProduct}
          disabled={!productName.trim()}
          onClick={createProduct}
        >
          Crear producto
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <select
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          className={inputCls}
        >
          {products.length === 0 && <option value="">— sin productos —</option>}
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>

        <select
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          className={inputCls}
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
          className={inputCls}
          placeholder="Cantidad"
        />

        <input
          type="date"
          value={expiry}
          onChange={(e) => setExpiry(e.target.value)}
          className={inputCls}
          required
        />
      </div>

      {err && <p className="text-sm text-rose-600">{err}</p>}

      <div className="flex gap-2">
        <Button
          type="submit"
          variant="primary"
          loading={loading}
          disabled={!productId || !expiry}
          icon={<Plus className="h-4 w-4" />}
        >
          {loading ? "Guardando…" : "Crear lote"}
        </Button>
      </div>
    </form>
  );
}
