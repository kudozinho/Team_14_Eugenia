import "./globals.css";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import Link from "next/link";
import Nav from "./nav";
import Logo from "./logo";

const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-jakarta", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Ghost : audit et compte rendu",
  description: "Tableau de bord et rapport Ghost (Team 14)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${jakarta.variable} ${inter.variable}`}>
      <body>
        <header className="top">
          <div className="in">
            <Link href="/" className="logo" aria-label="Ghost, accueil"><Logo /></Link>
            <Nav />
            <span className="badge">Mode démo · données fictives (Agence Belvédère)</span>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
