"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";
import type { UserMe } from "@/lib/types";

const links = [
  { href: "/", label: "Dashboard" },
  { href: "/inventory", label: "Inventario" },
  { href: "/families", label: "Familias" },
  { href: "/deliveries", label: "Entregas" },
  { href: "/nevera", label: "Nevera Solidària" },
  { href: "/shifts", label: "Cuadrantes" },
  { href: "/volunteers", label: "Voluntarios" },
];

export default function Sidebar({ user }: { user: UserMe | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <h1 className="text-lg font-bold">XAMA-ONG</h1>
        <p className="text-xs text-slate-500">Plataforma Integral</p>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <p className="truncate text-sm font-medium">{user?.full_name}</p>
        <p className="mb-2 truncate text-xs text-slate-500">
          {user?.role_name ?? "-"}
        </p>
        <button
          onClick={logout}
          className="w-full rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
        >
          Salir
        </button>
      </div>
    </aside>
  );
}
