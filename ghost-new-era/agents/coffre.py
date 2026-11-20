"""Comptes connectés : identifiants gardés dans un coffre-fort HÉBERGÉ par H, jamais par Ghost.

Les valeurs (mot de passe, secret du code à deux facteurs) ne sont jamais relues : seul le nom, l'adresse du site et les champs
renseignés le sont. Le navigateur de chaque agent est lié au coffre-fort (vault_id) : l'agent se connecte seul aux sites enregistrés.
"""
import os

from hai_agents.vaults.types import VaultCreateRequestProviderConfig_Internal

NOM_COFFRE = "ghost-comptes"
_cache = {}


def coffre_existant(client):
    """Identifiant du coffre-fort de Ghost, ou None s'il n'existe pas encore (variable H_VAULT_ID prioritaire)."""
    if os.environ.get("H_VAULT_ID"):
        return os.environ["H_VAULT_ID"]
    if "id" in _cache:
        return _cache["id"]
    for v in client.vaults.list_vaults().vaults:
        if v.name == NOM_COFFRE:
            _cache["id"] = v.id
            return v.id
    return None


def coffre(client):
    vid = coffre_existant(client)
    if vid:
        return vid
    v = client.vaults.create_vault(name=NOM_COFFRE, provider_config=VaultCreateRequestProviderConfig_Internal())
    _cache["id"] = v.id
    return v.id


def lister(client, etiquette=None):
    vid = coffre_existant(client)
    if not vid:
        return []
    d = client.vaults.list_vault_items(vid).model_dump()
    sortie = []
    for i in d["items"]:
        if etiquette and not i["name"].endswith(f" [{etiquette}]"):
            continue  # chaque personne ne voit que ses propres comptes
        sortie.append({"id": i["id"], "nom": i["name"].rsplit(" [", 1)[0], "urls": i["urls"], "champs": list(i.get("fields") or [])})
    return sortie


def ajouter(client, plateforme, url, identifiant, mot_de_passe, totp=None, etiquette=None):
    valeurs = {"username": identifiant, "password": mot_de_passe}
    if totp:
        valeurs["totp"] = totp
    i = client.vaults.create_vault_item(coffre(client), name=f"{plateforme} · {identifiant}" + (f" [{etiquette}]" if etiquette else ""), urls=[url], values=valeurs)
    return {"id": i.id, "nom": i.name}


def supprimer(client, item_id, etiquette=None):
    vid = coffre_existant(client)
    if vid and (not etiquette or any(x["id"] == item_id for x in lister(client, etiquette))):
        client.vaults.delete_vault_item(vid, item_id)
