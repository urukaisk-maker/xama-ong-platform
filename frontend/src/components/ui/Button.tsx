"use client";
import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "success" | "outline";
type Size = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
};

const variants: Record<Variant, string> = {
  primary:
    "bg-xama-600 text-white shadow-sm hover:bg-xama-700 hover:shadow-primary active:bg-xama-800 active:shadow-none focus-visible:ring-xama-500",
  secondary:
    "bg-slate-900 text-white shadow-sm hover:bg-slate-700 active:bg-slate-800 focus-visible:ring-slate-500 dark:bg-slate-700 dark:hover:bg-slate-600",
  ghost:
    "bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200 focus-visible:ring-slate-400 dark:text-slate-200 dark:hover:bg-slate-800 dark:active:bg-slate-700",
  danger:
    "bg-rose-600 text-white shadow-sm hover:bg-rose-700 hover:shadow-lg active:bg-rose-800 focus-visible:ring-rose-500",
  success:
    "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 hover:shadow-lg active:bg-emerald-800 focus-visible:ring-emerald-500",
  outline:
    "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-400 active:bg-slate-100 focus-visible:ring-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:hover:border-slate-600",
};

const sizes: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs gap-1.5",
  md: "px-4 py-2 text-sm gap-2",
  lg: "px-6 py-3 text-sm gap-2",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    icon,
    iconPosition = "left",
    disabled,
    className = "",
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center rounded-md font-medium
        transition-all duration-200 ease-out
        focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none
        ${variants[variant]} ${sizes[size]} ${className}
      `.trim()}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{children}</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && <span>{icon}</span>}
          {children}
          {icon && iconPosition === "right" && <span>{icon}</span>}
        </>
      )}
    </button>
  );
});

export default Button;
