import "./globals.css";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import Link from "next/link";
import Nav from "./nav";
import Logo from "./logo";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Ghost : audit et compte rendu",
  description: "Tableau de bord et rapport Ghost (Team 14)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${display.variable} ${inter.variable}`}>
      <body>
        <div className="shell">
          <aside className="side">
            <Link href="/" className="logo" aria-label="Ghost, accueil"><Logo /></Link>
            <p className="side-tag">See the work. Ghost the task.</p>
            <Nav />
            <div className="side-foot">
              <span className="badge">Mode démo</span>
              <p>Données fictives de l'Agence Belvédère. Aucune donnée par personne.</p>
            </div>
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
