"""
Moteur de matching intelligent
Combine Fuzzy Matching, NLP, LLM et scoring géographique
"""
from sentence_transformers import SentenceTransformer, util
from rapidfuzz import fuzz, process
from typing import Dict, List, Tuple
import numpy as np
from loguru import logger
from datetime import datetime

from .config import settings
from .llm_client import LLMClient
from .nlp_processor import NLPProcessor

class MatchingEngine:
    """Moteur principal de matching intelligent"""

    def __init__(self):
        self.model = None
        self.llm_client = None
        self.nlp_processor = None
        self.is_ready = False

        # Poids des composantes
        self.alpha = settings.WEIGHT_NLP
        self.beta = settings.WEIGHT_LLM
        self.gamma = settings.WEIGHT_GEO

        # Seuil de matching
        self.threshold = settings.MATCH_THRESHOLD

        # Statistiques
        self.stats = {
            "total_matches_computed": 0,
            "total_matches_above_threshold": 0,
            "avg_score": 0.0,
            "avg_processing_time_ms": 0.0
        }

    async def initialize(self):
        """Initialise tous les composants du moteur"""
        try:
            logger.info("Initialisation du moteur de matching...")

            # 1. Charger le modèle d'embeddings
            logger.info(f"Chargement du modèle: {settings.EMBEDDING_MODEL}")
            self.model = SentenceTransformer(
                settings.EMBEDDING_MODEL,
                cache_folder=settings.EMBEDDING_CACHE_DIR
            )
            logger.info("✅ Modèle d'embeddings chargé")

            # 2. Initialiser le client LLM
            logger.info(f"Initialisation du client LLM ({settings.LLM_PROVIDER})...")
            self.llm_client = LLMClient()
            logger.info("✅ Client LLM initialisé")

            # 3. Initialiser le processeur NLP
            logger.info("Initialisation du processeur NLP...")
            self.nlp_processor = NLPProcessor()
            await self.nlp_processor.initialize()
            logger.info("✅ Processeur NLP initialisé")

            self.is_ready = True
            logger.info("✅ Moteur de matching prêt!")

        except Exception as e:
            logger.error(f"❌ Erreur lors de l'initialisation: {str(e)}")
            raise

    async def compute_match(self, decl_a: Dict, decl_b: Dict) -> Dict:
        """
        Calcule le score de correspondance entre deux déclarations

        Args:
            decl_a: Déclaration A (généralement PERTE)
            decl_b: Déclaration B (généralement DECOUVERTE)

        Returns:
            Dictionnaire contenant tous les scores et métadonnées
        """
        if not self.is_ready:
            raise RuntimeError("Moteur non initialisé")

        start_time = datetime.now()

        # 1. Score NLP (similarité sémantique + extraction d'entités)
        score_nlp = await self._compute_nlp_score(decl_a, decl_b)

        # 2. Score LLM (compréhension contextuelle)
        score_llm, raisonnement = await self._compute_llm_score(decl_a, decl_b)

        # 3. Score géographique
        score_geo = self._compute_geo_score(decl_a, decl_b)

        # 4. Score global pondéré
        score_global = (
            self.alpha * score_nlp +
            self.beta * score_llm +
            self.gamma * score_geo
        )

        # 5. Déterminer le niveau de confiance
        confiance = self._get_confidence_level(score_global)

        # 6. Décision
        au_dessus_du_seuil = score_global >= self.threshold

        # Calcul du temps de traitement
        processing_time = (datetime.now() - start_time).total_seconds() * 1000

        # Mise à jour des statistiques
        self._update_statistics(score_global, processing_time, au_dessus_du_seuil)

        return {
            "score_global": round(score_global, 3),
            "score_nlp": round(score_nlp, 3),
            "score_llm": round(score_llm, 3),
            "score_geo": round(score_geo, 3),
            "au_dessus_du_seuil": au_dessus_du_seuil,
            "confiance": confiance,
            "raisonnement": raisonnement,
            "metadata": {
                "model_used": settings.EMBEDDING_MODEL,
                "llm_model": settings.LLM_MODEL,
                "threshold": self.threshold,
                "weights": {
                    "nlp": self.alpha,
                    "llm": self.beta,
                    "geo": self.gamma
                },
                "processing_time_ms": round(processing_time, 2)
            }
        }

    async def _compute_nlp_score(self, decl_a: Dict, decl_b: Dict) -> float:
        """Calcule le score NLP (embeddings + fuzzy matching + entités)"""

        # 1. Similarité sémantique via embeddings
        desc_a = decl_a.get("description", "")
        desc_b = decl_b.get("description", "")

        if not desc_a or not desc_b:
            return 0.0

        emb_a = self.model.encode(desc_a, convert_to_tensor=True)
        emb_b = self.model.encode(desc_b, convert_to_tensor=True)

        similarity = float(util.cos_sim(emb_a, emb_b)[0][0])

        # 2. Fuzzy matching pour les noms et numéros partiels
        bonus = 0.0

        nom_a = decl_a.get("nomPartiel", "").lower().strip()
        nom_b = decl_b.get("nomPartiel", "").lower().strip()

        if nom_a and nom_b:
            # Utiliser plusieurs algorithmes de fuzzy matching
            ratio = fuzz.ratio(nom_a, nom_b) / 100.0
            partial = fuzz.partial_ratio(nom_a, nom_b) / 100.0
            token_sort = fuzz.token_sort_ratio(nom_a, nom_b) / 100.0

            # Prendre le meilleur score
            fuzzy_score = max(ratio, partial, token_sort)

            # Bonus progressif basé sur la similarité fuzzy
            if fuzzy_score >= 0.9:
                bonus += 0.25
            elif fuzzy_score >= 0.8:
                bonus += 0.20
            elif fuzzy_score >= 0.7:
                bonus += 0.15
            elif fuzzy_score >= 0.6:
                bonus += 0.10

        num_a = decl_a.get("numeroPartiel", "").strip()
        num_b = decl_b.get("numeroPartiel", "").strip()

        if num_a and num_b:
            # Pour les numéros, utiliser partial_ratio (capture les sous-chaînes)
            num_fuzzy = fuzz.partial_ratio(num_a, num_b) / 100.0

            if num_fuzzy >= 0.9:
                bonus += 0.25
            elif num_fuzzy >= 0.8:
                bonus += 0.20
            elif num_fuzzy >= 0.7:
                bonus += 0.15
            elif num_fuzzy >= 0.6:
                bonus += 0.10

        # Score final NLP (limité à 1.0)
        score = min(1.0, similarity + bonus)

        return score

    async def _compute_llm_score(self, decl_a: Dict, decl_b: Dict) -> Tuple[float, str]:
        """Calcule le score LLM avec raisonnement"""

        try:
            result = await self.llm_client.evaluate_match(decl_a, decl_b)
            return result["score"], result["raisonnement"]
        except Exception as e:
            logger.warning(f"Erreur LLM, fallback sur NLP : {str(e)}")
            # Fallback : utiliser le score NLP
            score_nlp = await self._compute_nlp_score(decl_a, decl_b)
            return score_nlp, "Évaluation automatique (LLM indisponible)"

    def _compute_geo_score(self, decl_a: Dict, decl_b: Dict) -> float:
        """Calcule le score géographique avec fuzzy matching"""

        loc_a = decl_a.get("localisation", {})
        loc_b = decl_b.get("localisation", {})

        ville_a = loc_a.get("ville", "").lower().strip()
        ville_b = loc_b.get("ville", "").lower().strip()

        if not ville_a or not ville_b:
            return 0.5  # Pas assez d'informations

        # Fuzzy matching sur les villes
        ville_fuzzy = fuzz.ratio(ville_a, ville_b) / 100.0

        if ville_fuzzy >= 0.85:
            # Même ville (ou très proche) : vérifier le quartier
            quartier_a = loc_a.get("quartier", "").lower().strip()
            quartier_b = loc_b.get("quartier", "").lower().strip()

            if quartier_a and quartier_b:
                quartier_fuzzy = fuzz.ratio(quartier_a, quartier_b) / 100.0

                if quartier_fuzzy >= 0.85:
                    return 1.0  # Même quartier : score maximal
                elif quartier_fuzzy >= 0.7:
                    return 0.9  # Quartiers similaires

            return 0.8  # Même ville seulement

        elif ville_fuzzy >= 0.7:
            # Villes similaires (fautes de frappe, abréviations)
            return 0.6

        # Villes différentes
        return 0.3

    def _get_confidence_level(self, score: float) -> str:
        """Détermine le niveau de confiance"""
        if score >= 0.9:
            return "TRES_HAUTE"
        elif score >= 0.75:
            return "HAUTE"
        elif score >= 0.6:
            return "MOYENNE"
        else:
            return "FAIBLE"

    def _update_statistics(self, score: float, processing_time: float,
                           above_threshold: bool):
        """Met à jour les statistiques internes"""
        self.stats["total_matches_computed"] += 1

        if above_threshold:
            self.stats["total_matches_above_threshold"] += 1

        # Moyenne mobile du score
        n = self.stats["total_matches_computed"]
        current_avg = self.stats["avg_score"]
        self.stats["avg_score"] = (current_avg * (n - 1) + score) / n

        # Moyenne mobile du temps de traitement
        current_avg_time = self.stats["avg_processing_time_ms"]
        self.stats["avg_processing_time_ms"] = (
            current_avg_time * (n - 1) + processing_time
        ) / n

    async def batch_match(self, pertes: List[Dict],
                          decouvertes: List[Dict]) -> List[Dict]:
        """
        Calcule les correspondances pour plusieurs paires

        Args:
            pertes: Liste de déclarations de perte
            decouvertes: Liste de déclarations de découverte

        Returns:
            Liste des correspondances au-dessus du seuil
        """
        results = []

        for perte in pertes:
            for decouverte in decouvertes:
                match = await self.compute_match(perte, decouverte)

                if match["au_dessus_du_seuil"]:
                    results.append({
                        "perte_id": perte.get("id"),
                        "decouverte_id": decouverte.get("id"),
                        **match
                    })

        # Trier par score décroissant
        results.sort(key=lambda x: x["score_global"], reverse=True)

        return results

    def get_statistics(self) -> Dict:
        """Retourne les statistiques du moteur"""
        return {
            **self.stats,
            "success_rate": (
                self.stats["total_matches_above_threshold"] /
                max(1, self.stats["total_matches_computed"])
            ) * 100
        }
