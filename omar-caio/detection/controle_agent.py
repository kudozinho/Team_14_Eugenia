"""Contrôle des valeurs relues par l'agent avant la validation humaine."""

CHAMPS = ('titre', 'prix', 'surface_m2', 'ville', 'description')


def verifier_preparation(demande, reponse):
    """Retourne les écarts. Un résultat vide autorise la revue humaine."""
    attendues = demande['portails']
    lignes = reponse.get('controles')
    if not isinstance(lignes, list) or any(
        not isinstance(ligne, dict) or not isinstance(ligne.get('url'), str)
        for ligne in lignes
    ):
        return {'reponse': ['Contrôles par portail invalides']}

    par_url = {ligne['url']: ligne for ligne in lignes}
    if len(par_url) != len(lignes) or set(par_url) != set(attendues):
        return {'reponse': ['Portails manquants, inattendus ou dupliqués']}

    ecarts = {}
    for url in attendues:
        ligne = par_url[url]
        erreurs = []
        for champ in CHAMPS:
            valeur = demande['donnees'][champ]
            relue = ligne.get(champ)
            if type(relue) is not type(valeur) or relue != valeur:
                erreurs.append(champ)
        if ligne.get('etapes_inaccessibles') != []:
            erreurs.append('etapes_inaccessibles')
        if erreurs:
            ecarts[url] = erreurs
    return ecarts
