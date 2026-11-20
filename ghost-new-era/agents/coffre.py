"""Comptes connectés : identifiants gardés dans un coffre-fort HÉBERGÉ par H, jamais par Ghost.

Les valeurs (mot de passe, secret du code à deux facteurs) ne sont jamais relues : seul le nom, l'adresse du site et les champs
renseignés le sont. Le navigateur de chaque agent est lié au coffre-fort (vault_id) : l'agent se connecte seul aux sites enregistrés.
"""
import os

from hai_agents.vaults.types import VaultCreateRequestProviderConfig_Internal

NOM_COFFRE = "ghost-comptes"
PREFIXE_APP = "App · "
URL_APP = {"notion": "https://www.notion.so", "slack": "https://slack.com", "gmail": "https://mail.google.com"}
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
        if i["name"].startswith(PREFIXE_APP):
            continue  # les accès d'applications (Notion, Slack, Gmail) ont leur propre liste
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


def _apps_brutes(client, etiquette):
    vid = coffre_existant(client)
    if not vid:
        return vid, []
    d = client.vaults.list_vault_items(vid).model_dump()
    return vid, [i for i in d["items"] if i["name"].startswith(PREFIXE_APP) and i["name"].endswith(f" [{etiquette}]")]


def apps_connectees(client, etiquette):
    return sorted(i["name"][len(PREFIXE_APP):].split(" [")[0] for i in _apps_brutes(client, etiquette)[1])


def _vers_coffre(app, v):
    """Champs de Ghost -> champs acceptés par le coffre-fort H (username, password, email, totp, api_key) et adresse de l'élément."""
    if app == "notion":
        page = str(v["page"]).strip()
        return {"api_key": v["token"]}, [page if page.startswith("https://") else f"https://www.notion.so/{page}"]
    if app == "slack":
        return {"api_key": v["webhook"]}, [URL_APP["slack"]]
    return {"email": v["adresse"], "password": v["mot_de_passe"], "username": v["destinataire"]}, [URL_APP["gmail"]]


def _depuis_coffre(app, valeurs, urls):
    if app == "notion":
        return {"token": valeurs.get("api_key"), "page": (urls or [""])[0]}
    if app == "slack":
        return {"webhook": valeurs.get("api_key")}
    return {"adresse": valeurs.get("email"), "mot_de_passe": valeurs.get("password"), "destinataire": valeurs.get("username")}


def ajouter_app(client, app, valeurs, etiquette):
    """Enregistre l'accès d'une application pour CETTE personne (remplace l'ancien)."""
    vid = coffre(client)
    retirer_app(client, app, etiquette)
    vals, urls = _vers_coffre(app, valeurs)
    client.vaults.create_vault_item(vid, name=f"{PREFIXE_APP}{app} [{etiquette}]", urls=urls, values={k: str(x) for k, x in vals.items()})


def retirer_app(client, app, etiquette):
    vid, items = _apps_brutes(client, etiquette)
    for i in items:
        if i["name"].startswith(f"{PREFIXE_APP}{app} "):
            client.vaults.delete_vault_item(vid, i["id"])


def reveler_apps(client, etiquette):
    """Accès de la personne, lus côté serveur au moment d'un onboarding : {app: {champ: valeur}}. Jamais journalisés."""
    vid, items = _apps_brutes(client, etiquette)
    out = {}
    for i in items:
        app = i["name"][len(PREFIXE_APP):].split(" [")[0]
        out[app] = _depuis_coffre(app, dict(client.vaults.reveal_vault_item(vid, i["id"]).values), i["urls"])
    return out
