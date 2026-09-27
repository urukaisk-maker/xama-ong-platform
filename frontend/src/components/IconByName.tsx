"use client";
import {
  Apple,
  HandHeart,
  Leaf,
  BarChart3,
  Heart,
  Users,
  Truck,
  Warehouse,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Quote,
  type LucideIcon,
} from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  Apple,
  HandHeart,
  Leaf,
  BarChart3,
  Heart,
  Users,
  Truck,
  Warehouse,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Quote,
};

export default function IconByName({
  name,
  className = "h-5 w-5",
}: {
  name: string;
  className?: string;
}) {
  const Icon = ICONS[name] ?? Sparkles;
  return <Icon className={className} />;
}
