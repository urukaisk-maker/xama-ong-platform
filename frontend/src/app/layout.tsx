import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "XAMA-ONG · Recuperamos alimentos, alimentamos esperanza",
    template: "%s · XAMA-ONG",
  },
  description:
    "Asociación sin ánimo de lucro dedicada a la recuperación de alimentos y su distribución a familias en situación de vulnerabilidad en Reus y Tarragona.",
  keywords: [
    "XAMA",
    "ONG",
    "Reus",
    "Tarragona",
    "banco de alimentos",
    "voluntariado",
    "donaciones",
    "nevera solidaria",
    "recuperación alimentos",
    "sostenibilidad",
  ],
  authors: [{ name: "XAMA-ONG" }],
  creator: "XAMA-ONG",
  publisher: "XAMA-ONG",
  applicationName: "XAMA-ONG Platform",
  category: "nonprofit",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: SITE_URL,
    siteName: "XAMA-ONG",
    title: "XAMA-ONG · Recuperamos alimentos, alimentamos esperanza",
    description:
      "Recuperamos excedentes alimentarios y los distribuimos a familias vulnerables en Reus y Tarragona. Cero desperdicio, máxima dignidad.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "XAMA-ONG · Recuperamos alimentos, alimentamos esperanza",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "XAMA-ONG · Recuperamos alimentos, alimentamos esperanza",
    description:
      "Recuperamos excedentes alimentarios y los distribuimos a familias vulnerables en Reus y Tarragona.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
