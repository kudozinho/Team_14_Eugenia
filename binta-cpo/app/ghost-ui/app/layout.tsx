import "./globals.css";
import type { Metadata } from "next";
import Nav from "./nav";

export const metadata: Metadata = {
  title: "Ghost : audit et compte rendu",
  description: "Tableau de bord et rapport Ghost (Team 14)",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>
        <header className="top">
          <span className="logo">👻 Ghost</span>
          <Nav />
          <span className="badge">Données d'exemple · Agence Belvédère (fictive)</span>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
