"use client";
import { useEffect, useState } from "react";
import { Plus, Package, Pencil } from "lucide-react";
import { toast } from "sonner";
import AppShell from "@/components/AppShell";
import { useUser } from "@/components/AuthGuard";
import ConfirmDelete, { TrashIcon } from "@/components/ConfirmDelete";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Surface from "@/components/ui/Surface";
import Drawer from "@/components/ui/Drawer";
import { SkeletonTable } from "@/components/ui/Loading";
import { api } from "@/lib/api";
import { getCategoryIcon } from "@/lib/category-icons";
import {
  getExpiryInfo,
  getProgressColor,
  getProgressTrack,
} from "@/lib/relative-date";
import type { Batch, Product } from "@/lib/types";

const COORD_ROLES = ["junta", "coordinador_reus", "coordinador_tarragona"];

export default function InventoryPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Batch | null>(null);

  const { user } = useUser();
  const canEdit =
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

  const getProduct = (id: string) =>
    products.find((p) => p.id === id) ?? null;

  const deleteBatch = async (id: string) => {
    await api(`/api/inventory/batches/${id}`, { method: "DELETE" });
    toast.success("Lote borrado");
    load();
  };

  const sortedBatches = [...batches].sort(
    (a, b) =>
      new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  );

  return (
    <AppShell>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
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
        <SkeletonTable rows={8} cols={canEdit ? 6 : 5} />
      ) : batches.length === 0 ? (
        <EmptyState />
      ) : (
        <Surface hover={false} className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200/60 bg-slate-50/50 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800/60 dark:bg-slate-800/40 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Origen</th>
                <th className="px-4 py-3">Cantidad</th>
                <th className="px-4 py-3">Caducidad</th>
                <th className="px-4 py-3">Estado</th>
                {canEdit && <th className="px-4 py-3"></th>}
              </tr>
            </thead>
            <tbody className="dark:text-slate-200">
              {sortedBatches.map((b) => {
                const product = getProduct(b.product_id);
                const expiry = getExpiryInfo(b.expiry_date);
                const icon = getCategoryIcon(product?.category);

                return (
                  <tr
                    key={b.id}
                    className="border-t border-slate-100/60 transition-colors hover:bg-slate-50/80 dark:border-slate-800/60 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg" aria-hidden>
                          {icon}
                        </span>
                        <span className="font-medium">
                          {product?.name ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {b.origin.replace(/_/g, " ")}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-900 dark:text-slate-100">
                      {b.quantity}
                    </td>
                    <td className="px-4 py-3">
                      <div className="min-w-[140px] space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {b.expiry_date}
                          </span>
                          <Badge
                            variant={
                              expiry.level === "expired" ||
                              expiry.level === "critical"
                                ? "danger"
                                : expiry.level === "warning"
                                ? "warning"
                                : "success"
                            }
                          >
                            {expiry.label}
                          </Badge>
                        </div>
                        <div
                          className={`h-1 w-full overflow-hidden rounded-full ${getProgressTrack(
                            expiry.level
                          )}`}
                          aria-hidden
                        >
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${getProgressColor(
                              expiry.level
                            )}`}
                            style={{ width: `${expiry.progress}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={
                          b.status === "disponible"
                            ? "success"
                            : b.status === "agotado"
                            ? "neutral"
                            : "warning"
                        }
                      >
                        {b.status}
                      </Badge>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditing(b)}
                            aria-label="Editar"
                            className="rounded-md p-1.5 text-slate-400 transition hover:bg-xama-50 hover:text-xama-600 dark:hover:bg-xama-950 dark:hover:text-xama-400"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <ConfirmDelete
                            title="¿Borrar este lote?"
                            message={`${product?.name ?? "Producto"} · ${b.quantity} · caduca el ${b.expiry_date}. Esta acción no se puede deshacer.`}
                            onConfirm={() => deleteBatch(b.id)}
                            trigger={TrashIcon}
                          />
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Surface>
      )}

      <EditBatchDrawer
        batch={editing}
        product={editing ? getProduct(editing.product_id) : null}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          toast.success("Lote actualizado");
          load();
        }}
      />
    </AppShell>
  );
}

function EmptyState() {
  return (
    <Surface hover={false} className="p-16 text-center">
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
    </Surface>
  );
}

/* ─── Drawer de edición de lote ─── */
function EditBatchDrawer({
  batch,
  product,
  onClose,
  onSaved,
}: {
  batch: Batch | null;
  product: Product | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState({
    origin: "comercio_local",
    quantity: 0,
    expiry_date: "",
    status: "disponible",
    notes: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (batch) {
      setData({
        origin: batch.origin,
        quantity: Number(batch.quantity),
        expiry_date: batch.expiry_date,
        status: batch.status,
        notes: batch.notes ?? "",
      });
      setErr(null);
    }
  }, [batch]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batch) return;
    setErr(null);
    setSaving(true);
    try {
      await api(`/api/inventory/batches/${batch.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          origin: data.origin,
          quantity: data.quantity,
          expiry_date: data.expiry_date,
          status: data.status,
          notes: data.notes || null,
        }),
      });
      onSaved();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const inputCls =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm transition focus:border-xama-500 focus:outline-none focus:ring-2 focus:ring-xama-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-white";

  return (
    <Drawer
      open={batch !== null}
      onClose={onClose}
      title={product ? `Editar lote de ${product.name}` : "Editar lote"}
      subtitle="Modifica los datos y guarda los cambios"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            loading={saving}
            onClick={submit}
            disabled={!batch}
          >
            {saving ? "Guardando…" : "Guardar cambios"}
          </Button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Origen
          </span>
          <select
            value={data.origin}
            onChange={(e) => setData({ ...data, origin: e.target.value })}
            className={inputCls}
          >
            <option value="comercio_local">Comercio local</option>
            <option value="donacion_corporativa">Donación corporativa</option>
            <option value="excedente_agricola">Excedente agrícola</option>
            <option value="comida_cocinada">Comida cocinada</option>
            <option value="campana_solidaria">Campaña solidaria</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Cantidad
          </span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={data.quantity}
            onChange={(e) =>
              setData({ ...data, quantity: Number(e.target.value) })
            }
            className={inputCls}
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Fecha de caducidad
          </span>
          <input
            type="date"
            value={data.expiry_date}
            onChange={(e) =>
              setData({ ...data, expiry_date: e.target.value })
            }
            className={inputCls}
            required
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Estado
          </span>
          <select
            value={data.status}
            onChange={(e) => setData({ ...data, status: e.target.value })}
            className={inputCls}
          >
            <option value="disponible">Disponible</option>
            <option value="reservado">Reservado</option>
            <option value="agotado">Agotado</option>
            <option value="caducado">Caducado</option>
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block font-medium text-slate-700 dark:text-slate-300">
            Notas internas
          </span>
          <textarea
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
            className={`${inputCls} min-h-[80px] resize-y`}
            placeholder="Ej: Producto prioritario para cestas"
          />
        </label>

        {err && (
          <div className="rounded-md bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
            {err}
          </div>
        )}
      </form>
    </Drawer>
  );
}

/* ─── Formulario nuevo lote ─── */
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
    <Surface hover={false} className="mb-6 animate-slide-up space-y-4 p-5">
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
    </Surface>
  );
}
