"""Configuration du service IA"""
from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Configuration centralisée"""

    # Application
    APP_NAME: str = "OUFAREZ AI Service"
    VERSION: str = "1.0.0"
    DEBUG: bool = False

    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # LLM Configuration
    LLM_PROVIDER: str = "anthropic"  # "anthropic" ou "openai"
    LLM_API_KEY: str = ""
    LLM_MODEL: str = "claude-3-5-sonnet-20241022"
    LLM_MAX_TOKENS: int = 500
    LLM_TEMPERATURE: float = 0.3
    LLM_TIMEOUT: int = 30  # secondes

    # Sentence Transformers
    EMBEDDING_MODEL: str = "paraphrase-multilingual-MiniLM-L12-v2"
    EMBEDDING_CACHE_DIR: str = "./cache/embeddings"

    # spaCy
    SPACY_MODEL: str = "fr_core_news_sm"  # Français

    # Matching Parameters
    MATCH_THRESHOLD: float = 0.72
    WEIGHT_NLP: float = 0.4
    WEIGHT_LLM: float = 0.5
    WEIGHT_GEO: float = 0.1

    # Cache Redis (optionnel)
    REDIS_URL: str = "redis://localhost:6379/0"
    ENABLE_CACHE: bool = False

    # Logging
    LOG_LEVEL: str = "INFO"

    class Config:
        env_file = ".env"
        case_sensitive = True

# Instance globale
settings = Settings()

# Validation en production
if not settings.DEBUG and not settings.LLM_API_KEY:
    raise ValueError("LLM_API_KEY est requis en mode production")

# Créer les répertoires nécessaires
os.makedirs(settings.EMBEDDING_CACHE_DIR, exist_ok=True)
