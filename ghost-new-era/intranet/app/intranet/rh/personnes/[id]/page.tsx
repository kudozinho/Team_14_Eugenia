import Link from "next/link";
import { getAdmin } from "@/lib/supabase-admin";
import { creerFiche, demanderAcces, demanderBadge, demanderMateriel, validerMateriel } from "../../actions";

export const dynamic = "force-dynamic";

const ZONES = ["Entrée principale", "Open space", "Salle de réunion", "Salle serveurs", "Parking"];
const champ = { display: "grid", gap: 6, marginBottom: 14 } as const;
const input = { font: "inherit", padding: "10px 12px", border: "1px solid var(--line-2)", borderRadius: 12, background: "#fff" } as const;

export default async function FichePersonne({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ ok?: string }> }) {
  const { id } = await params;
  const { ok } = await searchParams;
  const admin = getAdmin();
  if (!admin) return <p role="alert">La connexion à la base n'est pas configurée sur ce serveur (clé de service absente).</p>;

  const { data: p } = await admin.from("personnes").select("*").eq("id", id).maybeSingle();
  if (!p) return <><h1>Personne introuvable</h1><p><Link href="/intranet/rh">Retour à l'accueil RH</Link></p></>;

  const [{ data: fiche }, { data: catalogue }, { data: acces }, { data: badge }, { data: materiel }, { data: autres }] = await Promise.all([
    admin.from("rh_fiches").select("*").eq("personne_id", id).maybeSingle(),
    admin.from("catalogue_acces").select("*").eq("poste", p.poste).order("outil"),
    admin.from("rh_acces").select("*").eq("personne_id", id),
    admin.from("rh_badges").select("*").eq("personne_id", id).maybeSingle(),
    admin.from("rh_materiel").select("*").eq("personne_id", id),
    admin.from("personnes").select("id,prenom,nom").neq("id", id).eq("statut", "en_poste").order("nom"),
  ]);
  const accesPar = new Map((acces ?? []).map((a) => [a.outil, a]));

  return (
    <>
      <p><Link href="/intranet/rh">← Retour à l'accueil RH</Link></p>
      <h1 style={{ margin: "12px 0 4px" }}>{p.prenom} {p.nom}</h1>
      <p>Poste : {p.poste}. Équipe : {p.equipe}. Date d'arrivée : {p.date_arrivee ?? "non renseignée"}.</p>
      {ok && <p role="status" style={{ margin: "16px 0", padding: "10px 14px", background: "var(--g-50)", color: "var(--g-900)", borderRadius: 12, fontWeight: 600 }}>{ok}</p>}

      <section className="card" style={{ margin: "24px 0" }}>
        <h2>Fiche RH</h2>
        <p style={{ margin: "6px 0 14px" }}>Statut de la fiche : <b>{fiche?.statut_fiche === "creee" ? "Créée" : "Vide"}</b></p>
        <form action={creerFiche}>
          <input type="hidden" name="personne_id" value={id} />
          <div style={champ}><label htmlFor="poste">Poste</label><input style={input} id="poste" name="poste" defaultValue={fiche?.poste ?? p.poste} required /></div>
          <div style={champ}><label htmlFor="equipe">Équipe</label><input style={input} id="equipe" name="equipe" defaultValue={fiche?.equipe ?? p.equipe} required /></div>
          <div style={champ}>
            <label htmlFor="manager_id">Manager</label>
            <select style={input} id="manager_id" name="manager_id" defaultValue={fiche?.manager_id ?? p.manager_id ?? ""}>
              <option value="">Non renseigné</option>
              {(autres ?? []).map((m) => <option key={m.id} value={m.id}>{m.prenom} {m.nom}</option>)}
            </select>
          </div>
          <div style={champ}><label htmlFor="date_arrivee">Date d'arrivée</label><input style={input} id="date_arrivee" name="date_arrivee" type="date" defaultValue={fiche?.date_arrivee ?? p.date_arrivee ?? ""} /></div>
          <button className="btn btn-secondary" type="submit">Créer la fiche</button>
        </form>
      </section>

      <section className="card" style={{ margin: "24px 0" }}>
        <h2>Accès</h2>
        <p style={{ margin: "6px 0 14px" }}>Accès prévus pour le poste « {p.poste} ».</p>
        {(catalogue ?? []).length === 0 && <p>Aucun accès défini pour ce poste.</p>}
        <div style={{ display: "grid", gap: 10 }}>
          {(catalogue ?? []).map((c) => {
            const a = accesPar.get(c.outil);
            return (
              <form key={c.outil} action={demanderAcces} style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <input type="hidden" name="personne_id" value={id} />
                <input type="hidden" name="outil" value={c.outil} />
                <input type="hidden" name="niveau" value={c.niveau} />
                <span style={{ minWidth: 220 }}><b>{c.outil}</b> (niveau {c.niveau})</span>
                <span style={{ minWidth: 130 }}>Statut : {a ? (a.statut === "accorde" ? "Accordé" : "Demandé") : "Non demandé"}</span>
                <button className="btn btn-secondary" type="submit">Demander l'accès à {c.outil}</button>
              </form>
            );
          })}
        </div>
      </section>

      <section className="card" style={{ margin: "24px 0" }}>
        <h2>Badge</h2>
        <p style={{ margin: "6px 0 14px" }}>Statut du badge : <b>{badge ? ({ a_demander: "À demander", demande: "Demandé", pret: "Prêt" } as Record<string, string>)[badge.statut] : "À demander"}</b>{badge?.zones?.length ? ` · Zones : ${badge.zones.join(", ")}` : ""}</p>
        <form action={demanderBadge}>
          <input type="hidden" name="personne_id" value={id} />
          <fieldset style={{ border: 0, padding: 0, margin: "0 0 14px" }}>
            <legend style={{ fontWeight: 600, marginBottom: 6 }}>Zones d'accès</legend>
            {ZONES.map((z) => <label key={z} style={{ display: "block" }}><input type="checkbox" name="zones" value={z} defaultChecked={badge?.zones?.includes(z)} /> {z}</label>)}
          </fieldset>
          <button className="btn btn-secondary" type="submit">Demander le badge</button>
        </form>
      </section>

      <section className="card" style={{ margin: "24px 0" }}>
        <h2>Matériel</h2>
        <p style={{ margin: "6px 0 14px" }}>Une commande de matériel est définitive : elle doit être validée par une personne.</p>
        <ul style={{ paddingLeft: 20, margin: "0 0 14px", display: "grid", gap: 10 }}>
          {(materiel ?? []).length === 0 && <li style={{ listStyle: "none", marginLeft: -20 }}>Aucun matériel demandé.</li>}
          {(materiel ?? []).map((m) => (
            <li key={m.id}>
              {m.article} : {m.statut === "valide" ? "Commande validée" : "En attente de validation"}
              {m.statut === "a_valider" && (
                <form action={validerMateriel} style={{ display: "inline", marginLeft: 12 }}>
                  <input type="hidden" name="personne_id" value={id} />
                  <input type="hidden" name="materiel_id" value={m.id} />
                  <button className="btn btn-secondary" type="submit">Valider la commande (personne seulement)</button>
                </form>
              )}
            </li>
          ))}
        </ul>
        <form action={demanderMateriel} style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap" }}>
          <input type="hidden" name="personne_id" value={id} />
          <div style={{ display: "grid", gap: 6 }}><label htmlFor="article">Article</label><input style={input} id="article" name="article" defaultValue="Ordinateur portable" required /></div>
          <button className="btn btn-secondary" type="submit">Demander le matériel</button>
        </form>
      </section>
    </>
  );
}
