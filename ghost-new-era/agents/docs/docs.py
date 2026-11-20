"""Agent Docs : prépare la page « Bienvenue » et la checklist d'une personne dans le wiki d'Atelier Nova.

Les 5 pages recommandées viennent d'un classement Hugging Face (repli sur le rôle cible, signalé).
Vérifié dans la base (vue v_onboarding : page_wiki, checklist sur jour 1, semaine 1 et mois 1).
"""
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.dirname(__file__))
import commun as c  # noqa: E402
from classement import meilleures_pages  # noqa: E402
from commun import evenement  # noqa: E402
import connecteurs  # noqa: E402


AGENT_H = os.environ.get("AGENT_DOCS", "ghost-docs")


def executer(client, personne_id, proposition_id=None, manager=None):
    p = c.personne(personne_id)
    debut = time.monotonic()
    run = c.creer_run("docs", p, proposition_id)
    evenement(run, f"Agent Docs : page d'accueil de {p['prenom']} {p['nom']}", "en_cours", outil="Wiki")
    try:
        cl = meilleures_pages(p["poste"], p["equipe"])
        evenement(run, "Pages recommandées choisies", "ok", f"{cl['source']} : " + " · ".join(cl["titres"]), outil="Wiki")
        liste = "\n".join(f"- {t}" for t in cl["titres"])
        consigne = f"""Tu es l'assistant documentation d'Atelier Nova. Tu es dans le wiki. Prépare l'accueil de {p['prenom']} {p['nom']} ({p['poste']}, équipe {p['equipe']}).
1. Clique « Créer une page ». Titre : « Bienvenue {p['prenom']} ». Espace : « Accueil ». Rôle cible : « {p['poste']} ». Mots-clés : « accueil, onboarding ». Laisse « créé par » tel quel. Contenu (recopie exactement) :
Bienvenue {p['prenom']} ! À lire en premier :
{liste}
Puis clique « Créer la page ».
2. Retourne au wiki, ouvre « Checklists d'arrivée ». Choisis la personne « {p['prenom']} {p['nom']} » et clique « Afficher sa checklist ». Avec « Ajouter une ligne » (choisis la période, écris le libellé, clique « Ajouter la ligne »), ajoute ces 6 lignes une par une :
 - Jour 1 : « Récupérer son badge et son ordinateur »
 - Jour 1 : « Lire les pages recommandées »
 - Semaine 1 : « Café d'accueil avec l'équipe »
 - Semaine 1 : « Rencontrer son parrain »
 - Mois 1 : « Point d'étape avec son manager »
 - Mois 1 : « Première mise en pratique en autonomie »
Ne modifie aucune autre page ni aucune ligne existante. Réponds statut=termine avec un résumé court, ou statut=echec si tu es bloqué."""
        c.passage(client, run, p, consigne, "/intranet/wiki", {"page_wiki": f"Page « Bienvenue {p['prenom']} » créée", "checklist": "Checklist jour 1, semaine 1, mois 1 créée"}, 90, 420, AGENT_H)
    except Exception as e:  # noqa: BLE001
        evenement(run, "Erreur de l'agent", "echec", f"{type(e).__name__}: {str(e)[:200]}", outil="Wiki")
    ok, detail = connecteurs.notion_page(p, cl["titres"] if "cl" in dir() else None)
    if ok is not None:
        evenement(run, "Page d'onboarding créée dans Notion", "ok" if ok else "echec", detail, outil="Notion")
    pr = c.preuve(p["id"])
    verifiees = sum(1 for k in ("page_wiki", "checklist") if pr.get(k))
    return c.cloturer(run, verifiees == 2, verifiees, 2, debut, "Docs")
