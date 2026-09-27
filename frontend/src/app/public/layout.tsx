import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Inicio",
  description:
    "XAMA-ONG recupera excedentes alimentarios y los distribuye a familias vulnerables en Reus y Tarragona. Conoce nuestro impacto, hazte voluntario o dona.",
  openGraph: {
    title: "XAMA-ONG · Recuperamos alimentos, alimentamos esperanza",
    description:
      "Conoce el impacto de XAMA-ONG: alimentos recuperados, familias atendidas, CO₂ evitado. Dona o hazte voluntario.",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
