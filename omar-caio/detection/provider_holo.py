"""Appels texte à la Models API de H Company."""
import json
import os
from urllib.error import HTTPError
from urllib.request import Request, urlopen

BASE_URL = 'https://api.hcompany.ai/v1'


class HoloProvider:
    def __init__(self, model, *, prix_entree_usd_million=None, prix_sortie_usd_million=None):
        self.model = model
        self.api_key = os.environ.get('HAI_API_KEY')
        if not self.api_key:
            raise RuntimeError('Configurer HAI_API_KEY hors du code')
        self.prix_entree = prix_entree_usd_million
        self.prix_sortie = prix_sortie_usd_million
        self.usage = []

    def _requete(self, route, payload=None):
        data = json.dumps(payload).encode('utf-8') if payload is not None else None
        request = Request(
            BASE_URL + route, data=data,
            headers={'Authorization': f'Bearer {self.api_key}', 'Content-Type': 'application/json'},
        )
        try:
            with urlopen(request, timeout=90) as response:
                return json.load(response)
        except HTTPError as exc:
            raise RuntimeError(f'API H Company : HTTP {exc.code}') from None

    def modeles(self):
        return {model['id'] for model in self._requete('/models')['data']}

    def __call__(self, messages):
        result = self._requete('/chat/completions', {
            'model': self.model, 'messages': messages, 'max_tokens': 4000, 'temperature': 0,
        })
        usage = result.get('usage')
        if usage is not None:
            self.usage.append(usage)
        return result['choices'][0]['message']['content']

    def metriques_tokens(self):
        entree = sum(usage['prompt_tokens'] for usage in self.usage)
        sortie = sum(usage['completion_tokens'] for usage in self.usage)
        cout = None
        if self.usage and self.prix_entree is not None and self.prix_sortie is not None:
            cout = round((entree * self.prix_entree + sortie * self.prix_sortie) / 1e6, 6)
        return {'input_tokens': entree, 'output_tokens': sortie, 'cout_usd': cout}
