"""
Client LLM pour l'évaluation contextuelle des correspondances
Supporte Anthropic Claude et OpenAI GPT
"""
import json
from typing import Dict, Tuple
from loguru import logger

from .config import settings

# Import conditionnel selon le provider
if settings.LLM_PROVIDER == "anthropic":
    from anthropic import Anthropic
elif settings.LLM_PROVIDER == "openai":
    from openai import OpenAI

class LLMClient:
    """Client pour interagir avec les LLMs (Claude/GPT)"""

    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.model = settings.LLM_MODEL
        self.max_tokens = settings.LLM_MAX_TOKENS
        self.temperature = settings.LLM_TEMPERATURE

        # Initialiser le client selon le provider
        if self.provider == "anthropic":
            self.client = Anthropic(api_key=settings.LLM_API_KEY)
        elif self.provider == "openai":
            self.client = OpenAI(api_key=settings.LLM_API_KEY)
        else:
            raise ValueError(f"Provider non supporté: {self.provider}")

        logger.info(f"✅ Client LLM initialisé ({self.provider} - {self.model})")

    async def evaluate_match(self, decl_a: Dict, decl_b: Dict) -> Dict:
        """
        Évalue la correspondance entre deux déclarations avec raisonnement

        Args:
            decl_a: Déclaration A (perte)
            decl_b: Déclaration B (découverte)

        Returns:
            Dict avec score (0-1) et raisonnement
        """

        prompt = self._build_prompt(decl_a, decl_b)

        try:
            if self.provider == "anthropic":
                response = await self._call_claude(prompt)
            else:  # openai
                response = await self._call_gpt(prompt)

            # Parser la réponse
            score, raisonnement = self._parse_response(response)

            return {
                "score": score,
                "raisonnement": raisonnement
            }

        except Exception as e:
            logger.error(f"Erreur LLM: {str(e)}")
            raise

    def _build_prompt(self, decl_a: Dict, decl_b: Dict) -> str:
        """Construit le prompt pour le LLM"""

        return f'''Tu es un agent intelligent qui évalue si deux déclarations concernent le même document officiel perdu au Cameroun.

**DÉCLARATION A (PERTE):**
- Type: {decl_a.get("type")}
- Document: {decl_a.get("typeDocument")}
- Description: {decl_a.get("description")}
- Nom partiel: {decl_a.get("nomPartiel", "Non spécifié")}
- Numéro partiel: {decl_a.get("numeroPartiel", "Non spécifié")}
- Date: {decl_a.get("dateEvenement")}
- Lieu: {decl_a.get("localisation", {}).get("ville")}, {decl_a.get("localisation", {}).get("quartier", "")}

**DÉCLARATION B (DÉCOUVERTE):**
- Type: {decl_b.get("type")}
- Document: {decl_b.get("typeDocument")}
- Description: {decl_b.get("description")}
- Nom partiel: {decl_b.get("nomPartiel", "Non spécifié")}
- Numéro partiel: {decl_b.get("numeroPartiel", "Non spécifié")}
- Date: {decl_b.get("dateEvenement")}
- Lieu: {decl_b.get("localisation", {}).get("ville")}, {decl_b.get("localisation", {}).get("quartier", "")}

**CONSIGNES:**
1. Analyse si ces deux déclarations concernent probablement le même document
2. Tiens compte de :
   - Correspondance des noms (variations orthographiques, abréviations)
   - Correspondance des numéros (même partiels)
   - Proximité géographique et temporelle
   - Cohérence des descriptions
   - Contexte culturel camerounais (noms locaux, lieux)

3. Sois prudent : en cas de doute significatif, baisse le score

**RÉPONSE ATTENDUE (format JSON strict):**
```json
{{
  "score": 0.85,
  "raisonnement": "Les noms correspondent (NGOA dans les deux cas), le numéro partiel 123456 est identique, même ville et dates proches. Forte probabilité de correspondance."
}}
```

Le score doit être entre 0.0 (aucune correspondance) et 1.0 (correspondance certaine).
Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.'''

    async def _call_claude(self, prompt: str) -> str:
        """Appel à l'API Anthropic Claude"""

        try:
            message = self.client.messages.create(
                model=self.model,
                max_tokens=self.max_tokens,
                temperature=self.temperature,
                messages=[
                    {"role": "user", "content": prompt}
                ]
            )

            return message.content[0].text

        except Exception as e:
            logger.error(f"Erreur appel Claude: {str(e)}")
            raise

    async def _call_gpt(self, prompt: str) -> str:
        """Appel à l'API OpenAI GPT"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "Tu es un expert en matching de documents perdus. Réponds toujours en JSON."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=self.temperature
            )

            return response.choices[0].message.content

        except Exception as e:
            logger.error(f"Erreur appel GPT: {str(e)}")
            raise

    def _parse_response(self, response: str) -> Tuple[float, str]:
        """Parse la réponse du LLM"""

        try:
            # Extraire le JSON de la réponse
            response = response.strip()

            # Parfois le LLM ajoute des ```json ... ```
            if response.startswith("```json"):
                response = response[7:]
            if response.startswith("```"):
                response = response[3:]
            if response.endswith("```"):
                response = response[:-3]

            response = response.strip()

            data = json.loads(response)

            score = float(data.get("score", 0.0))
            raisonnement = data.get("raisonnement", "")

            # Validation
            score = max(0.0, min(1.0, score))

            return score, raisonnement

        except json.JSONDecodeError:
            logger.warning(f"Réponse LLM non-JSON: {response[:100]}")
            # Fallback : extraire le score numériquement
            import re
            match = re.search(r'(\d+\.?\d*)', response)
            if match:
                score = float(match.group(1))
                if score > 1.0:  # Probablement sur 100
                    score = score / 100.0
                return score, response[:200]

            # Sinon, score par défaut
            return 0.5, "Erreur de parsing de la réponse LLM"

        except Exception as e:
            logger.error(f"Erreur parsing réponse LLM: {str(e)}")
            return 0.5, f"Erreur: {str(e)}"
