import Entete from "../_commun/Entete";

// Intranet d'Atelier Nova : public, sans connexion. Même en-tête que la messagerie et le wiki.
// Libellés clairs et stables, aucune animation ni fenêtre surgissante : un agent H lit l'écran.
export default function RHLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Entete actif="rh" />
      <main className="wrap" style={{ padding: "24px 32px 64px" }}>{children}</main>
    </>
  );
}
