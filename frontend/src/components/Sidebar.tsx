"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearToken } from "@/lib/api";
import type { UserMe } from "@/lib/types";
import ThemeToggle from "./ThemeToggle";

type LinkItem = {
  href: string;
  label: string;
  roles: string[];
};

const LINKS: LinkItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["junta", "coordinador_reus", "coordinador_tarragona"],
  },
  {
    href: "/inventory",
    label: "Inventario",
    roles: ["junta", "coordinador_reus", "coordinador_tarragona"],
  },
  {
    href: "/families",
    label: "Familias",
    roles: ["junta", "coordinador_reus", "coordinador_tarragona"],
  },
  {
    href: "/deliveries",
    label: "Entregas",
    roles: ["junta", "coordinador_reus", "coordinador_tarragona", "voluntario"],
  },
  {
    href: "/nevera",
    label: "Nevera Solidària",
    roles: [
      "junta",
      "coordinador_reus",
      "coordinador_tarragona",
      "servicios_sociales",
      "voluntario",
    ],
  },
  {
    href: "/shifts",
    label: "Turnos",
    roles: ["junta", "coordinador_reus", "coordinador_tarragona", "voluntario"],
  },
  {
    href: "/shifts/calendar",
    label: "Calendario",
    roles: ["junta", "coordinador_reus", "coordinador_tarragona", "voluntario"],
  },
  {
    href: "/volunteers",
    label: "Voluntarios",
    roles: ["junta", "coordinador_reus", "coordinador_tarragona"],
  },
  {
    href: "/admin/users",
    label: "Usuarios",
    roles: ["junta"],
  },
  {
    href: "/admin/analytics",
    label: "Analítica",
    roles: ["junta"],
  },
  {
    href: "/admin/trash",
    label: "Papelera",
    roles: ["junta"],
  },
  {
    href: "/admin/maintenance",
    label: "Mantenimiento",
    roles: ["junta"],
  },
  {
    href: "/admin/audit",
    label: "Auditoría",
    roles: ["junta"],
  },
];

export default function Sidebar({ user }: { user: UserMe | null }) {
  const pathname = usePathname();
  const router = useRouter();

  const role = user?.role_name ?? "";
  const visible = LINKS.filter((l) => l.roles.includes(role));

  const logout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <aside className="flex h-screen w-64 flex-col border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="border-b border-slate-200 p-5 dark:border-slate-800">
        <Link href="/public" className="block">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            XAMA-ONG
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Plataforma Integral
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {visible.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`block rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-xama-600 text-white shadow-sm dark:bg-xama-600"
                  : "text-slate-700 hover:bg-slate-100 hover:translate-x-0.5 dark:text-slate-300 dark:hover:bg-slate-800"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-200 p-4 dark:border-slate-800">
        <ThemeToggle />
        <div>
          <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
            {user?.full_name}
          </p>
          <p className="mb-2 truncate text-xs text-slate-500 dark:text-slate-400">
            {user?.role_name ?? "-"}
            {user?.site && ` · ${user.site}`}
          </p>
          <button
            onClick={logout}
            className="w-full rounded-md bg-slate-100 px-3 py-1.5 text-sm text-slate-700 transition-all duration-200 hover:bg-slate-200 active:scale-[0.98] dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Salir
          </button>
        </div>
      </div>
    </aside>
  );
}
