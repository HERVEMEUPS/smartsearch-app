"""Schémas Pydantic pour la validation des données"""
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class LocalisationDict(BaseModel):
    """Schéma de localisation"""
    ville: str
    quartier: Optional[str] = None
    pointRepere: Optional[str] = None
    geo: Optional[Dict[str, Any]] = None

class DeclarationDict(BaseModel):
    """Schéma d'une déclaration"""
    id: Optional[str] = None
    type: str = Field(..., pattern="^(PERTE|DECOUVERTE)$")
    typeDocument: str
    description: str = Field(..., min_length=10, max_length=2000)
    nomPartiel: Optional[str] = None
    numeroPartiel: Optional[str] = None
    dateEvenement: datetime
    localisation: LocalisationDict

class MatchRequest(BaseModel):
    """Requête de calcul de correspondance"""
    declarationA: DeclarationDict = Field(..., description="Déclaration de perte")
    declarationB: DeclarationDict = Field(..., description="Déclaration de découverte")

    model_config = {
        "json_schema_extra": {
            "example": {
                "declarationA": {
                    "type": "PERTE",
                    "typeDocument": "CNI",
                    "description": "Perdu ma carte d'identité au nom de NGOA Jean Pierre, numéro commençant par 123456",
                    "nomPartiel": "NGOA Jean Pierre",
                    "numeroPartiel": "123456",
                    "dateEvenement": "2026-05-15T10:30:00Z",
                    "localisation": {
                        "ville": "Yaoundé",
                        "quartier": "Bastos"
                    }
                },
                "declarationB": {
                    "type": "DECOUVERTE",
                    "typeDocument": "CNI",
                    "description": "Trouvé une CNI au nom de NGOA J.P. près du supermarché Casino",
                    "nomPartiel": "NGOA",
                    "dateEvenement": "2026-05-15T14:00:00Z",
                    "localisation": {
                        "ville": "Yaoundé",
                        "quartier": "Bastos"
                    }
                }
            }
        }
    }

class MatchResponse(BaseModel):
    """Réponse de calcul de correspondance"""
    score_global: float = Field(..., ge=0, le=1)
    score_nlp: float = Field(..., ge=0, le=1)
    score_llm: float = Field(..., ge=0, le=1)
    score_geo: float = Field(..., ge=0, le=1)
    au_dessus_du_seuil: bool
    confiance: str = Field(..., pattern="^(TRES_HAUTE|HAUTE|MOYENNE|FAIBLE)$")
    raisonnement: Optional[str] = None
    metadata: Dict[str, Any]
    processing_time_ms: Optional[float] = None

class HealthResponse(BaseModel):
    """Réponse de santé du service"""
    service: str
    version: str
    status: str
    model_loaded: Optional[bool] = None
    llm_provider: Optional[str] = None
    llm_model: Optional[str] = None
    endpoints: Optional[Dict[str, str]] = None
