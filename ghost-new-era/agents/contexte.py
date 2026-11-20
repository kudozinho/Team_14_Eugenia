"""Ce que la personne a autorisé et connecté pour la session en cours.
- autorises : outils cochés dans le portail. Un agent n'utilise un outil que s'il est coché (sans contexte : tout est permis, pour les essais en ligne de commande).
- apps : accès de CETTE personne (Notion, Slack, Gmail) lus dans le coffre-fort H, jamais ceux d'une autre."""
import threading

CONTEXTE = threading.local()


def definir(autorises, apps=None):
    CONTEXTE.autorises = autorises
    CONTEXTE.apps = apps


def autorise(nom):
    a = getattr(CONTEXTE, "autorises", None)
    return True if a is None else nom in a
