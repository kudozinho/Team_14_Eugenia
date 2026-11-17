"""Fournisseur Claude facultatif pour les vrais essais (aucune clé dans le dépôt).

Modèle passé explicitement à l'exécution : ne suppose aucun ID de modèle actuel.
Mode JSON strict demandé par prompt ; valider_sortie() vérifie la réponse.
"""
from __future__ import annotations
import json
import os
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from typing import Any


class AnthropicProvider:
    def __init__(self, model: str, api_key: str | None = None, *,
                 max_tokens: int = 4000, timeout_s: int = 90,
                 prix_entree_usd_million: float | None = None,
                 prix_sortie_usd_million: float | None = None) -> None:
        self.model = model
        self.api_key = api_key or os.getenv('ANTHROPIC_API_KEY')
        if not self.api_key:
            raise RuntimeError('ANTHROPIC_API_KEY doit être défini hors du code')
        self.max_tokens = max_tokens
        self.timeout_s = timeout_s
        self.prix_entree_usd_million = prix_entree_usd_million
        self.prix_sortie_usd_million = prix_sortie_usd_million
        self.usage: list[dict[str,int]] = []

    def __call__(self, messages: list[dict[str,str]]) -> str:
        system = '\n\n'.join(m['content'] for m in messages if m['role']=='system')
        chat = [{'role':m['role'],'content':m['content']} for m in messages if m['role'] != 'system']
        data = json.dumps({'model':self.model,'system':system,'messages':chat,
                           'max_tokens':self.max_tokens,'temperature':0}).encode('utf-8')
        req = Request('https://api.anthropic.com/v1/messages', data=data,
            headers={'x-api-key':self.api_key,'anthropic-version':'2023-06-01',
                     'content-type':'application/json'}, method='POST')
        try:
            with urlopen(req, timeout=self.timeout_s) as resp:
                result = json.loads(resp.read())
        except (HTTPError,URLError) as exc:
            raise RuntimeError(f'Échec API Anthropic ({type(exc).__name__})') from exc
        usage = result.get('usage') or {}
        self.usage.append({'input_tokens':int(usage.get('input_tokens') or 0),
                           'output_tokens':int(usage.get('output_tokens') or 0)})
        return ''.join(part.get('text','') for part in result.get('content',[]) if part.get('type')=='text')

    def metriques_tokens(self) -> dict[str, Any]:
        ins = sum(u['input_tokens'] for u in self.usage)
        outs = sum(u['output_tokens'] for u in self.usage)
        cost = None
        if self.prix_entree_usd_million is not None and self.prix_sortie_usd_million is not None:
            cost = round((ins*self.prix_entree_usd_million + outs*self.prix_sortie_usd_million)/1e6,6)
        return {'input_tokens':ins,'output_tokens':outs,'cout_usd':cost,
                'cout_methode':'tarifs fournis par utilisateur' if cost is not None else 'non communiqué'}
