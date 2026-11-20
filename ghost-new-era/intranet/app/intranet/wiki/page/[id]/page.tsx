// Une page du wiki.
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import Entete, { Retour } from "../../../_commun/Entete";
import { supabaseServeur } from "../../../_commun/serveur";
import s from "../../../_commun/intranet.module.css";

export default async function PageWiki({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; erreur?: string }>;
}) {
  await connection();
  const { id } = await params;
  const { ok, erreur } = await searchParams;
  const { data: page, error } = await supabaseServeur()
    .from("wiki_pages")
    .select("id, titre, espace, role_cible, tags, contenu, cree_par")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!page) notFound();

  return (
    <>
      <Entete actif="wiki" />
      <main className={s.page}>
        <p><Link href="/intranet/wiki">Retour au wiki</Link></p>
        <h1 style={{ marginTop: 12 }}>{page.titre}</h1>
        <p className={s.meta}>
          Espace {page.espace} · Rôle {page.role_cible ?? "tous"} · Par {page.cree_par ?? "inconnu"}
          {page.tags?.length ? ` · Mots-clés : ${page.tags.join(", ")}` : ""}
        </p>
        <Retour ok={ok} erreur={erreur} />
        <section className={s.bloc} style={{ marginTop: 24 }}>
          <div className={s.contenu}>{page.contenu || "Page vide."}</div>
        </section>
      </main>
    </>
  );
}
