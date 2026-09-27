/**
 * Genera un color determinista a partir del nombre/ID del usuario.
 * Mismo usuario → mismo color siempre.
 */

const COLORS = [
  { bg: "bg-rose-500/15", text: "text-rose-600", dot: "bg-rose-500" },
  { bg: "bg-amber-500/15", text: "text-amber-600", dot: "bg-amber-500" },
  {
    bg: "bg-emerald-500/15",
    text: "text-emerald-600",
    dot: "bg-emerald-500",
  },
  { bg: "bg-blue-500/15", text: "text-blue-600", dot: "bg-blue-500" },
  {
    bg: "bg-violet-500/15",
    text: "text-violet-600",
    dot: "bg-violet-500",
  },
  { bg: "bg-fuchsia-500/15", text: "text-fuchsia-600", dot: "bg-fuchsia-500" },
  { bg: "bg-teal-500/15", text: "text-teal-600", dot: "bg-teal-500" },
  { bg: "bg-orange-500/15", text: "text-orange-600", dot: "bg-orange-500" },
];

function hash(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function getAvatarColors(key: string) {
  return COLORS[hash(key) % COLORS.length];
}

export function getInitials(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (
    parts[0].charAt(0).toUpperCase() +
    parts[parts.length - 1].charAt(0).toUpperCase()
  );
}

export function shortName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length <= 1) return fullName;
  return `${parts[0]} ${parts[1].charAt(0)}.`;
}
