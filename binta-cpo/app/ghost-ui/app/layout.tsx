import "./globals.css";
import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import Link from "next/link";
import Nav from "./nav";
import Logo from "./logo";
import { chargerTaches } from "@/lib/data";

const display = Bricolage_Grotesque({ subsets: ["latin"], weight: ["500", "600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Ghost : audit et compte rendu",
  description: "Tableau de bord et rapport Ghost (Team 14)",
};

// Le badge suit une lecture réelle de la base (la même que le tableau de bord), pas la seule présence des variables :
// base injoignable, refus ou aucune tâche notée → « Mode démo », comme la page qui retombe alors sur l'exemple.
export const dynamic = "force-dynamic";

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { source } = await chargerTaches();
  const base = source === "base";
  return (
    <html lang="fr" className={`${display.variable} ${inter.variable}`}>
      <body>
        <div className="shell">
          <aside className="side">
            <Link href="/" className="logo" aria-label="Ghost, accueil"><Logo /></Link>
            <p className="side-tag">See the work. Ghost the task.</p>
            <Nav />
            <div className="side-foot">
              <span className="badge">{base ? "Données de la base" : "Mode démo"}</span>
              <p>{base
                ? "Tâches lues dans la base de l'audit. Agence Belvédère (fictive). Aucune donnée par personne."
                : "Données fictives de l'Agence Belvédère. Aucune donnée par personne."}</p>
            </div>
          </aside>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
