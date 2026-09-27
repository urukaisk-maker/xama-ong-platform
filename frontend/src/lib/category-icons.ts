/**
 * Mapeo de categorías de producto → emoji/icono
 * Editable fácilmente para adaptar a cada ONG
 */
export const CATEGORY_ICONS: Record<string, string> = {
  fruta: "🍎",
  verdura: "🥬",
  panaderia: "🥖",
  bolleria: "🥐",
  lacteos: "🥛",
  granos: "🌾",
  legumbres: "🫘",
  conservas: "🥫",
  aceites: "🫒",
  carne: "🥩",
  pescado: "🐟",
  bebidas: "🥤",
  huevos: "🥚",
  congelados: "❄️",
  otros: "📦",
};

export function getCategoryIcon(category: string | null | undefined): string {
  if (!category) return "📦";
  return CATEGORY_ICONS[category.toLowerCase()] ?? "📦";
}
