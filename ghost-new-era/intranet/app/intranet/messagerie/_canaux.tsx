// Liste des canaux, affichée à gauche de chaque page de la messagerie.
import Link from "next/link";
import { supabaseServeur } from "../_commun/serveur";
import s from "../_commun/intranet.module.css";

export type Canal = { id: string; nom: string; description: string | null };

export async function chargerCanaux(): Promise<Canal[]> {
  const { data, error } = await supabaseServeur().from("msg_canaux").select("id, nom, description").order("nom");
  if (error) throw new Error(error.message);
  return data ?? [];
}

export default function ListeCanaux({ canaux, actif }: { canaux: Canal[]; actif?: string }) {
  return (
    <aside className={`${s.bloc} ${s.barre}`} aria-label="Canaux">
      <h2>Canaux</h2>
      <ul className={s.liste}>
        {canaux.map((c) => (
          <li key={c.id}>
            <Link href={`/intranet/messagerie/${c.id}`} className={`${s.canal} ${actif === c.id ? s.canalActif : ""}`}>
              {c.nom}
            </Link>
          </li>
        ))}
        <li>
          <Link href="/intranet/messagerie/demandes" className={`${s.canal} ${actif === "demandes" ? s.canalActif : ""}`}>
            Demandes (parrain, café)
          </Link>
        </li>
      </ul>
    </aside>
  );
}
