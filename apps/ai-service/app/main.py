"""
Service IA pour le matching intelligent de documents perdus
FastAPI application
"""
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
import time
from loguru import logger

from .config import settings
from .matching import MatchingEngine
from .schemas import (
    MatchRequest,
    MatchResponse,
    HealthResponse,
    DeclarationDict
)

# Initialisation du moteur de matching
matching_engine = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestion du cycle de vie de l'application"""
    global matching_engine

    logger.info("🚀 Démarrage du service IA...")

    # Initialiser le moteur de matching
    matching_engine = MatchingEngine()
    await matching_engine.initialize()

    logger.info("✅ Service IA prêt !")

    yield

    # Cleanup
    logger.info("📴 Arrêt du service IA...")

# Création de l'application FastAPI
app = FastAPI(
    title="OUFAREZ - Service IA de Matching",
    description="Moteur intelligent de correspondance pour documents perdus",
    version="1.0.0",
    lifespan=lifespan
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware de logging
@app.middleware("http")
async def log_requests(request, call_next):
    start_time = time.time()

    response = await call_next(request)

    process_time = time.time() - start_time
    logger.info(
        f"{request.method} {request.url.path} "
        f"- {response.status_code} "
        f"- {process_time:.3f}s"
    )

    return response

# Routes

@app.get("/", response_model=HealthResponse)
async def root():
    """Point d'entrée racine"""
    return {
        "service": "OUFAREZ AI Service",
        "version": "1.0.0",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "match": "/api/ai/compute-match",
            "batch": "/api/ai/batch-match"
        }
    }

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Vérification de santé du service"""
    if matching_engine is None or not matching_engine.is_ready:
        raise HTTPException(
            status_code=503,
            detail="Service non initialisé"
        )

    return {
        "service": "OUFAREZ AI Service",
        "version": "1.0.0",
        "status": "healthy",
        "model_loaded": matching_engine.is_ready,
        "llm_provider": settings.LLM_PROVIDER,
        "llm_model": settings.LLM_MODEL
    }

@app.post("/api/ai/compute-match", response_model=MatchResponse)
async def compute_match(request: MatchRequest):
    """
    Calcule le score de correspondance entre deux déclarations

    Args:
        request: Contient declarationA (perte) et declarationB (découverte)

    Returns:
        Scores détaillés et décision de matching
    """
    if matching_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Moteur de matching non initialisé"
        )

    try:
        start_time = time.time()

        # Calcul du matching
        result = await matching_engine.compute_match(
            request.declarationA.model_dump(),
            request.declarationB.model_dump()
        )

        processing_time = (time.time() - start_time) * 1000  # en ms

        logger.info(
            f"Match calculé en {processing_time:.0f}ms - "
            f"Score: {result['score_global']:.3f}"
        )

        return {
            **result,
            "processing_time_ms": processing_time
        }

    except Exception as e:
        logger.error(f"Erreur lors du calcul du match: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de calcul: {str(e)}"
        )

@app.post("/api/ai/batch-match")
async def batch_match(declarations_perte: list[DeclarationDict],
                       declarations_decouverte: list[DeclarationDict]):
    """
    Calcule les correspondances pour plusieurs paires de déclarations

    Args:
        declarations_perte: Liste des déclarations de perte
        declarations_decouverte: Liste des déclarations de découverte

    Returns:
        Liste des meilleures correspondances
    """
    if matching_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Moteur de matching non initialisé"
        )

    try:
        results = await matching_engine.batch_match(
            declarations_perte,
            declarations_decouverte
        )

        return {
            "total_pertes": len(declarations_perte),
            "total_decouvertes": len(declarations_decouverte),
            "matches_found": len(results),
            "results": results
        }

    except Exception as e:
        logger.error(f"Erreur batch matching: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Erreur de calcul: {str(e)}"
        )

@app.get("/api/ai/stats")
async def get_statistics():
    """Obtenir les statistiques du service IA"""
    if matching_engine is None:
        raise HTTPException(
            status_code=503,
            detail="Moteur de matching non initialisé"
        )

    return matching_engine.get_statistics()

# Gestion des erreurs
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "path": str(request.url)
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Erreur non gérée: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Erreur interne du serveur",
            "detail": str(exc) if settings.DEBUG else None
        }
    )

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
