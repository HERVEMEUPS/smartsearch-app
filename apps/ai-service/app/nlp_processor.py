"""
Processeur NLP pour l'extraction d'entités et la normalisation
Utilise spaCy pour le français
"""
from typing import List, Dict, Set
from loguru import logger

try:
    import spacy
    from spacy.language import Language
except ImportError:
    logger.warning("spaCy non installé, fonctionnalités NLP limitées")
    spacy = None

from .config import settings

class NLPProcessor:
    """Processeur pour le traitement du langage naturel"""

    def __init__(self):
        self.nlp = None
        self.is_ready = False

    async def initialize(self):
        """Charge le modèle spaCy"""

        if spacy is None:
            logger.warning("⚠️  spaCy non disponible, NLP désactivé")
            return

        try:
            logger.info(f"Chargement du modèle spaCy: {settings.SPACY_MODEL}")

            # Essayer de charger le modèle
            try:
                self.nlp = spacy.load(settings.SPACY_MODEL)
            except OSError:
                # Modèle non installé, le télécharger
                logger.info("Modèle non trouvé, téléchargement...")
                import subprocess
                subprocess.run(
                    ["python", "-m", "spacy", "download", settings.SPACY_MODEL],
                    check=True
                )
                self.nlp = spacy.load(settings.SPACY_MODEL)

            self.is_ready = True
            logger.info("✅ Modèle spaCy chargé")

        except Exception as e:
            logger.error(f"❌ Erreur chargement spaCy: {str(e)}")
            logger.warning("NLP désactivé, fonctionnalités réduites")

    def extract_entities(self, text: str) -> Dict[str, List[str]]:
        """
        Extrait les entités nommées du texte

        Args:
            text: Texte à analyser

        Returns:
            Dict avec les entités par type (PERSON, LOC, etc.)
        """

        if not self.is_ready or not self.nlp:
            return {}

        try:
            doc = self.nlp(text)

            entities = {
                "PERSON": [],
                "LOC": [],
                "ORG": [],
                "DATE": [],
                "MISC": []
            }

            for ent in doc.ents:
                label = ent.label_
                if label in entities:
                    entities[label].append(ent.text)
                else:
                    entities["MISC"].append(ent.text)

            return entities

        except Exception as e:
            logger.error(f"Erreur extraction entités: {str(e)}")
            return {}

    def normalize_text(self, text: str) -> str:
        """
        Normalise le texte (lowercase, suppression accents, etc.)

        Args:
            text: Texte à normaliser

        Returns:
            Texte normalisé
        """

        if not text:
            return ""

        # Lowercase
        text = text.lower()

        # Supprimer les accents (simple)
        import unicodedata
        text = ''.join(
            c for c in unicodedata.normalize('NFD', text)
            if unicodedata.category(c) != 'Mn'
        )

        # Nettoyer les espaces multiples
        text = ' '.join(text.split())

        return text

    def extract_keywords(self, text: str, top_n: int = 5) -> List[str]:
        """
        Extrait les mots-clés principaux

        Args:
            text: Texte à analyser
            top_n: Nombre de mots-clés à extraire

        Returns:
            Liste des mots-clés
        """

        if not self.is_ready or not self.nlp:
            # Fallback simple
            words = text.lower().split()
            # Supprimer les mots courts et les stop words basiques
            stopwords = {'le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'à', 'au', 'en'}
            keywords = [w for w in words if len(w) > 3 and w not in stopwords]
            return list(set(keywords))[:top_n]

        try:
            doc = self.nlp(text)

            # Extraire les noms et adjectifs importants
            keywords = [
                token.lemma_ for token in doc
                if token.pos_ in ['NOUN', 'PROPN', 'ADJ']
                and not token.is_stop
                and len(token.text) > 2
            ]

            # Compter les fréquences
            from collections import Counter
            freq = Counter(keywords)

            return [word for word, _ in freq.most_common(top_n)]

        except Exception as e:
            logger.error(f"Erreur extraction keywords: {str(e)}")
            return []

    def compare_entities(self, entities_a: Dict, entities_b: Dict) -> float:
        """
        Compare deux ensembles d'entités

        Args:
            entities_a: Entités de la déclaration A
            entities_b: Entités de la déclaration B

        Returns:
            Score de similarité (0-1)
        """

        if not entities_a or not entities_b:
            return 0.0

        scores = []

        for entity_type in ['PERSON', 'LOC']:
            set_a = set(entities_a.get(entity_type, []))
            set_b = set(entities_b.get(entity_type, []))

            if not set_a and not set_b:
                continue

            # Jaccard similarity
            intersection = len(set_a & set_b)
            union = len(set_a | set_b)

            if union > 0:
                scores.append(intersection / union)

        return sum(scores) / len(scores) if scores else 0.0
