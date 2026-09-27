import { ReactNode } from "react";

type Variant =
  | "neutral"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "primary";

const variants: Record<Variant, string> = {
  neutral:
    "bg-slate-500/10 text-slate-600 border border-slate-500/20 dark:text-slate-300",
  success:
    "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 dark:text-emerald-400",
  warning:
    "bg-amber-500/10 text-amber-600 border border-amber-500/20 dark:text-amber-400",
  danger:
    "bg-rose-500/10 text-rose-600 border border-rose-500/20 dark:text-rose-400",
  info: "bg-blue-500/10 text-blue-600 border border-blue-500/20 dark:text-blue-400",
  primary:
    "bg-xama-500/10 text-xama-600 border border-xama-500/20 dark:text-xama-400",
};

export default function Badge({
  children,
  variant = "neutral",
  icon,
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 rounded-full px-2 py-0.5
        text-xs font-medium
        ${variants[variant]}
        ${className}
      `.trim()}
    >
      {icon}
      {children}
    </span>
  );
}
