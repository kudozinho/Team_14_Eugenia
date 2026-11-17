"""Nettoyage local AVANT stockage et avant tout appel réseau.

IMPORTANT : masquage déterministe / heuristique, pas anonymisation garantie.
Pour un déploiement réel, préférer ne jamais capter les applications sensibles.
"""
from __future__ import annotations

import re
from functools import lru_cache
from typing import Any, Mapping
from urllib.parse import urlsplit, urlunsplit

# Les motifs issus du profil métier sont appliqués en premier.
# Les protections supplémentaires sont volontairement conservatrices.
EMAIL = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
PHONE = re.compile(r"(?<!\w)(?:(?:\+33|0033)\s?(?:\(0\)\s?)?|0)[1-9](?:[\s.\-]?\d{2}){4}(?!\d)")
IBAN = re.compile(r"\bFR\d{2}(?:[\s-]?[A-Z0-9]{4}){5}[\s-]?[A-Z0-9]{3}\b", re.I)
# IBAN FR : 27 caractères alphanumériques au total ; certains profils ont un motif de référence trop strict.
IBAN_COMPACT = re.compile(r"\bFR\d{2}(?:[\s-]?[A-Z0-9]{4}){5}[\s-]?[A-Z0-9]{3}\b", re.I)
MONEY_SUFFIX = re.compile(r"(?<!\w)\d[\d\s\u00a0.,]*\s*(?:€|EUR\b|euros?\b)", re.I)
MONEY_LABEL = re.compile(r"(?i)(?P<label>\b(?:prix|loyer|budget|montant|honoraires|revenus?|salaire|solde|frais)\s*(?::|=|de|à)\s*)(?P<sum>\d{2,}(?:[\s\u00a0.,]\d{3})*(?:[.,]\d{2})?)\b")
ADDRESS_FULL = re.compile(r"(?i)\b\d{1,4}\s*(?:bis\s+|ter\s+)?(?:rue|avenue|av\.?|boulevard|bd\.?|allée|allee|impasse|chemin|route|place|quai|passage)\s+[A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ\'\- ]{1,45}\s+\d{5}\s+[A-ZÀ-Ÿa-zà-ÿ\'\- ]+", re.I)
ADDRESS = re.compile(r"(?i)\b\d{1,4}\s*(?:bis\s+|ter\s+)?(?:rue|avenue|av\.?|boulevard|bd\.?|allée|allee|impasse|chemin|route|place|quai|passage)\s+[A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ'\- ]{1,55}(?:\s+\d{5}\s+[A-ZÀ-Ÿa-zà-ÿ'\- ]+)?", re.I)
ADDRESS_LABEL = re.compile(r"(?im)(?P<label>\b(?:adresse(?:\s+exacte)?|domicile)\s*:\s*)(?P<value>[^\n|;]+)")
NAME_TITLE = re.compile(r"\b(?:M\.|Mr\.?|Mme\.?|Mlle\.?|Monsieur|Madame|Maître|Me\.)\s+[A-ZÀ-Ÿ][\wÀ-ÿ'\-]+(?:\s+[A-ZÀ-Ÿ][\wÀ-ÿ'\-]+){0,3}")
NAME_LABEL = re.compile(r"(?i)(?P<label>\b(?:propriétaire|prospect|client|locataire|contact|nom\s+du\s+client|nom)\s*:\s*)(?P<value>(?:[A-ZÀ-Ÿ][a-zà-ÿ'\-]+\s*){1,3})(?=$|[|;,\n]|\s*\[)")
# Repli local sur prénoms fréquents pour "Alice Martin", sans modèle NER.
FIRST_NAMES = set('Alice Marie Jean Pierre Paul Jacques Sophie Julie Claire Camille Lucie Louise Emma Léa Léon Olivier Karim Mohamed Omar Antoine Thomas Juliette Charlotte Chloé Sarah André François Fatima Amine Yasmine Anna Hugo Emma Nicolas Lucas Inès Léo Laura'.split())
PERSON_FALLBACK = re.compile(r"\b([A-ZÀ-Ÿ][a-zà-ÿ]+(?:-[A-ZÀ-Ÿ][a-zà-ÿ]+)?)\s+([A-ZÀ-Ÿ][a-zà-ÿ]+(?:-[A-ZÀ-Ÿ][a-zà-ÿ]+)?)(?:\s+([A-ZÀ-Ÿ][a-zà-ÿ]+))?\b")
PLACEHOLDER = re.compile(r"\[[A-Z_]+\]")


@lru_cache(maxsize=1)
def _get_fr_nlp():
    try:
        import spacy
        return spacy.load('fr_core_news_sm', disable=['parser', 'tagger', 'lemmatizer'])
    except (ImportError, OSError):
        return None


MOTS_INTERFACE = frozenset(
    'portail annonce annonces nouvelle déposer publier publiée bien agence google '
    'sheets chrome titre prix surface ville description livre eugenia immogest portable téléphone'.split()
)
MOTS = re.compile(r'[^\W\d_]+', re.UNICODE)


def _local_person_ner(text: str, mots_interface=()) -> str:
    """Utilise spaCy français si installé ; sinon règles locales limitées.

    Ne tente jamais de télécharger un modèle ; aucune donnée ne sort du poste.
    """
    nlp = _get_fr_nlp()
    if nlp:
        exclus = MOTS_INTERFACE | {mot.casefold() for mot in mots_interface}
        doc = nlp(text)
        marques = list(re.finditer(r'__GHOSTMASK_\d+__|\[[A-Z_]+\]', text))
        # Remplacement en ordre inverse pour éviter les erreurs d'index.
        for ent in reversed(doc.ents):
            if ent.label_ not in {'PER', 'PERSON'} or any(
                ent.start_char < m.end() and m.start() < ent.end_char for m in marques
            ):
                continue
            mots = MOTS.findall(ent.text)
            if any(mot.casefold() in exclus for mot in mots):
                continue
            if any(mot[0].isupper() for mot in mots):
                text = text[:ent.start_char] + '[NOM]' + text[ent.end_char:]

    def _replace(match: re.Match[str]) -> str:
        if match.group(1).split('-', 1)[0] in FIRST_NAMES:
            return '[NOM]'
        return match.group(0)
    return PERSON_FALLBACK.sub(_replace, text)


def nettoyer(texte: str | None, profil: Mapping[str, Any]) -> str | None:
    """Nettoie localement un texte suivant le contrat §1 / profil métier §6.

    La fonction ne doit PAS être utilisée comme une garantie de conformité RGPD.
    Elle n'effectue aucun appel réseau et ne conserve pas le texte brut.
    """
    if texte is None:
        return None
    if not isinstance(texte, str):
        raise TypeError('texte doit être une chaîne ou None')
    if not isinstance(profil, Mapping):
        raise TypeError('profil doit être un dictionnaire')

    # Protéger les marqueurs déjà présents, qui ne doivent pas être modifiés.
    placeholders: list[str] = []
    def protect(m: re.Match[str]) -> str:
        placeholders.append(m.group(0))
        return f'__GHOSTMASK_{len(placeholders)-1}__'
    result = PLACEHOLDER.sub(protect, texte)
    # Les IBAN et e-mails doivent être isolés AVANT les motifs du profil ; sinon un
    # motif téléphone peut capturer une sous-chaîne numérique d'un IBAN.
    def protect_as(marker: str):
        def callback(m: re.Match[str]) -> str:
            placeholders.append(marker)
            return f'__GHOSTMASK_{len(placeholders)-1}__'
        return callback
    result = IBAN.sub(protect_as('[IBAN]'), result)
    result = EMAIL.sub(protect_as('[EMAIL]'), result)
    for item in profil.get('motifs_a_flouter', []):
        try:
            pattern = re.compile(item['regex'], flags=re.I)
            replacement = str(item['remplacement'])
            # Substitution par callback : ne pas interpréter des backreferences accidentelles.
            result = pattern.sub(lambda _: replacement, result)
        except (KeyError, re.error, TypeError) as exc:
            raise ValueError(f"Motif invalide dans le profil : {item!r}") from exc

    result = IBAN.sub('[IBAN]', result)
    result = IBAN_COMPACT.sub('[IBAN]', result)
    result = EMAIL.sub('[EMAIL]', result)
    result = PHONE.sub('[TELEPHONE]', result)
    result = MONEY_SUFFIX.sub('[MONTANT]', result)
    result = MONEY_LABEL.sub(lambda m: m.group('label') + '[MONTANT]', result)
    result = ADDRESS_LABEL.sub(lambda m: m.group('label') + '[ADRESSE]', result)
    result = ADDRESS_FULL.sub('[ADRESSE]', result)
    result = ADDRESS.sub('[ADRESSE]', result)
    result = NAME_TITLE.sub('[NOM]', result)
    result = NAME_LABEL.sub(lambda m: m.group('label') + '[NOM]', result)
    if 'PER' in profil.get('entites_a_flouter', []):
        result = _local_person_ner(result, profil.get('mots_interface', ()))

    # Ne jamais exposer nos marqueurs temporaires ; restauration exacte et sûre.
    for i, value in enumerate(placeholders):
        result = result.replace(f'__GHOSTMASK_{i}__', value)
    return result


def nettoyer_evenement(
    evenement: Mapping[str, Any],
    profil: Mapping[str, Any],
    domaines_autorises: set[str] | None = None,
) -> dict[str, Any]:
    """Prépare un événement §1 pour Supabase sans transporter de texte brut.

    Une URL hors liste blanche devient hors_perimetre. Une capture brute et sa miniature
    ne sont jamais retournées. Le Recorder doit lui-même empêcher la capture hors périmètre.
    """
    if evenement.get('type') == 'hors_perimetre':
        return {**{k: evenement.get(k) for k in ('id', 'audit_id','utilisateur_id','horodatage','duree_s')},
                'appli': None, 'titre_fenetre': None, 'url': None,
                'type': 'hors_perimetre', 'texte_nettoye': None,
                'miniature_url': None, 'empreinte': None}
    url = evenement.get('url')
    safe_url = None
    if url:
        parts = urlsplit(str(url))
        hostname = (parts.hostname or '').lower()
        # Protection par défaut : un domaine non explicitement autorisé n'est pas capté.
        if not domaines_autorises or not any(hostname == d.lower() or hostname.endswith('.'+d.lower()) for d in domaines_autorises):
            return nettoyer_evenement({**evenement, 'type':'hors_perimetre'}, profil)
        # Ne jamais conserver identifiants URL / fragments / paramètres : domaine seul.
        safe_url = urlunsplit((parts.scheme, parts.netloc.split('@')[-1], '', '', ''))
    raw_text = evenement.get('texte', evenement.get('texte_nettoye'))
    return {
        'id': evenement.get('id'), 'audit_id': evenement.get('audit_id'),
        'utilisateur_id': evenement.get('utilisateur_id'),
        'horodatage': evenement.get('horodatage'),
        'appli': nettoyer(evenement.get('appli'), profil),
        'titre_fenetre': nettoyer(evenement.get('titre_fenetre'), profil),
        'url': safe_url, 'type': evenement.get('type'),
        'texte_nettoye': nettoyer(raw_text, profil),
        'miniature_url': None, 'empreinte': evenement.get('empreinte'),
        'duree_s': evenement.get('duree_s'),
    }
