"""Ce que la personne a autorisé pour la session en cours (liste d'outils cochés dans le portail).
Un agent n'utilise un connecteur, le coffre-fort ou Notion que si l'outil est coché. Sans contexte (essais en ligne de commande), tout est permis."""
import threading

CONTEXTE = threading.local()


def definir(autorises):
    CONTEXTE.autorises = autorises


def autorise(nom):
    a = getattr(CONTEXTE, "autorises", None)
    return True if a is None else nom in a
