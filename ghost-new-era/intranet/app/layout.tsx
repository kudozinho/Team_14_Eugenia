import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const texte = Inter({ subsets: ["latin"], variable: "--font-texte", display: "swap" });

export const metadata: Metadata = {
  title: "Atelier Nova : intranet (environnement de test fictif)",
  description: "Intranet fictif d'Atelier Nova, utilisé pour la démonstration de Ghost. Aucune donnée réelle.",
  icons: { icon: "/logo-atelier-nova.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={texte.variable}>
      <body>{children}</body>
    </html>
  );
}
