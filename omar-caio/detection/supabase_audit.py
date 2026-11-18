"""Accès REST aux événements et tâches Ghost, sans dépendance extérieure."""
import json
import os
from urllib.error import HTTPError
from urllib.parse import urlencode, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

COLONNES_EVENEMENTS = (
    'id,audit_id,utilisateur_id,horodatage,appli,titre_fenetre,url,type,empreinte,duree_s'
)
COLONNES_TACHES = (
    'id', 'audit_id', 'nom', 'sequence', 'occurrences', 'duree_moyenne_s',
    'temps_perdu_semaine_min', 'automatisable', 'methode', 'gain_estime_h_semaine',
    'instructions_agent', 'workflow_n8n_modele', 'confiance', 'prompt_empreinte',
)


class SansRedirection(HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


class SupabaseAudit:
    def __init__(self, url, cle):
        adresse = urlsplit(url)
        if (adresse.scheme != 'https' or not adresse.hostname or adresse.username
                or adresse.password or adresse.path not in ('', '/') or adresse.query or adresse.fragment):
            raise ValueError('SUPABASE_URL doit désigner une origine HTTPS')
        if not cle:
            raise ValueError('SUPABASE_SERVICE_ROLE_KEY manquante')
        self.url = url.rstrip('/') + '/rest/v1/'
        self.headers = {'apikey': cle}
        if not cle.startswith('sb_'):
            self.headers['Authorization'] = f'Bearer {cle}'
        self.opener = build_opener(SansRedirection())

    @classmethod
    def depuis_configuration(cls, fichier_env):
        valeurs = {}
        if fichier_env.is_file():
            for ligne in fichier_env.read_text(encoding='utf-8').splitlines():
                nom, separateur, valeur = ligne.strip().removeprefix('export ').partition('=')
                if separateur and nom.strip() in {'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'}:
                    valeurs[nom.strip()] = valeur.strip().strip('"\'')
        valeurs.update({nom: os.environ[nom] for nom in (
            'SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'SUPABASE_SERVICE_KEY'
        ) if os.environ.get(nom)})
        return cls(valeurs.get('SUPABASE_URL', ''),
                   valeurs.get('SUPABASE_SERVICE_ROLE_KEY') or valeurs.get('SUPABASE_SERVICE_KEY'))

    def _requete(self, table, parametres, *, lignes=None):
        headers = dict(self.headers)
        corps = None
        if lignes is not None:
            corps = json.dumps(lignes, allow_nan=False).encode()
            headers.update({'Content-Type': 'application/json',
                            'Prefer': 'resolution=ignore-duplicates,return=representation'})
        requete = Request(self.url + table + '?' + urlencode(parametres), data=corps, headers=headers)
        try:
            with self.opener.open(requete, timeout=30) as reponse:
                return json.load(reponse)
        except HTTPError as exc:
            raise RuntimeError(f'Supabase {table} : HTTP {exc.code}') from None

    def evenements(self, audit, *, depuis=None, avant=None):
        evenements = []
        while True:
            filtres = {
                'audit_id': f'eq.{audit}', 'select': COLONNES_EVENEMENTS,
                'order': 'horodatage.asc,id.asc', 'limit': 500, 'offset': len(evenements),
            }
            if depuis is not None:
                filtres['horodatage'] = f'gte.{depuis}'
            if avant is not None:
                # Le filtre inférieur utilise déjà la clé horodatage.
                filtres['and'] = f'(horodatage.lt.{avant})'
            lot = self._requete('evenements', filtres)
            if not lot:
                return evenements
            evenements.extend(lot)

    def inserer_taches(self, taches):
        lignes = [{colonne: tache[colonne] for colonne in COLONNES_TACHES} for tache in taches]
        if not lignes:
            return []
        return self._requete('taches_detectees', {'on_conflict': 'id', 'select': 'id'}, lignes=lignes)
