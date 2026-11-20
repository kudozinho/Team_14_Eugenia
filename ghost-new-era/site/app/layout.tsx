import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";

const titres = Bricolage_Grotesque({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-titres",
  display: "swap",
});
const texte = Inter({
  subsets: ["latin"],
  variable: "--font-texte",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Ghost : il observe, il propose, il agit après ton accord",
  description:
    "Ghost repère les tâches que tu répètes et s'en occupe avec des agents H Company, après ton accord.",
  icons: { icon: "/logo-ghost.svg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${titres.variable} ${texte.variable}`}>
      <body>{children}</body>
    </html>
  );
}
