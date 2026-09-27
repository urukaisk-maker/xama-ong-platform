/**
 * Convierte una fecha ISO a un texto relativo ("Vence en 3 días")
 * junto con el nivel de urgencia.
 */

export type ExpiryLevel = "expired" | "critical" | "warning" | "ok";

export type ExpiryInfo = {
  days: number;
  label: string;
  level: ExpiryLevel;
  /** % de "vida" restante asumiendo 30 días como vida útil típica */
  progress: number;
};

export function getExpiryInfo(expiryDateStr: string): ExpiryInfo {
  const expiry = new Date(expiryDateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let label: string;
  let level: ExpiryLevel;

  if (days < 0) {
    label = days === -1 ? "Caducó ayer" : `Caducado hace ${Math.abs(days)} días`;
    level = "expired";
  } else if (days === 0) {
    label = "Caduca hoy";
    level = "critical";
  } else if (days === 1) {
    label = "Caduca mañana";
    level = "critical";
  } else if (days <= 3) {
    label = `Vence en ${days} días`;
    level = "critical";
  } else if (days <= 7) {
    label = `Vence en ${days} días`;
    level = "warning";
  } else if (days <= 30) {
    label = `Vence en ${days} días`;
    level = "ok";
  } else if (days <= 60) {
    const weeks = Math.floor(days / 7);
    label = `Vence en ${weeks} semanas`;
    level = "ok";
  } else {
    const months = Math.floor(days / 30);
    label = `Vence en ${months} meses`;
    level = "ok";
  }

  // Barra de progreso: 100% = recién caducado, 0% = queda mucho
  // Mapeamos días restantes de 0 a 30 días
  const progress = Math.max(0, Math.min(100, (days / 30) * 100));

  return { days, label, level, progress };
}

export function getProgressColor(level: ExpiryLevel): string {
  switch (level) {
    case "expired":
      return "bg-rose-500";
    case "critical":
      return "bg-rose-500";
    case "warning":
      return "bg-amber-500";
    case "ok":
      return "bg-emerald-500";
  }
}

export function getProgressTrack(level: ExpiryLevel): string {
  switch (level) {
    case "expired":
      return "bg-rose-500/10";
    case "critical":
      return "bg-rose-500/10";
    case "warning":
      return "bg-amber-500/10";
    case "ok":
      return "bg-emerald-500/10";
  }
}
