import { getAvatarColors, getInitials, shortName } from "@/lib/avatar";

type Size = "sm" | "md" | "lg";

const sizes: Record<Size, string> = {
  sm: "h-6 w-6 text-[10px]",
  md: "h-8 w-8 text-xs",
  lg: "h-10 w-10 text-sm",
};

export function Avatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: Size;
  className?: string;
}) {
  const colors = getAvatarColors(name);
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${colors.bg} ${colors.text} ${sizes[size]} ${className}`}
      title={name}
      aria-label={name}
    >
      {getInitials(name)}
    </div>
  );
}

export function AvatarGroup({
  names,
  max = 4,
  size = "sm",
}: {
  names: string[];
  max?: number;
  size?: Size;
}) {
  const visible = names.slice(0, max);
  const extra = names.length - visible.length;

  return (
    <div className="flex -space-x-2">
      {visible.map((n, i) => (
        <div key={i} className="ring-2 ring-white dark:ring-slate-900">
          <Avatar name={n} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={`flex shrink-0 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-300 dark:ring-slate-900 ${sizes[size]}`}
          title={`${extra} más`}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}

/** Puesto libre con borde punteado */
export function EmptySlot({
  size = "md",
  label,
}: {
  size?: Size;
  label?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400 dark:border-slate-700 ${sizes[size]}`}
      title={label ?? "Puesto disponible"}
      aria-label={label ?? "Puesto disponible"}
    >
      <span className="text-xs">+</span>
    </div>
  );
}

export { shortName };
