# 🤖 Service IA - Matching Intelligent

Service FastAPI pour le matching sémantique intelligent de documents perdus.

## 🎯 Fonctionnalités

- **Matching sémantique** : Utilise sentence-transformers pour calculer la similarité entre descriptions
- **Évaluation LLM** : Intègre Claude ou GPT pour une compréhension contextuelle avancée
- **Score composite** : Combine NLP (40%), LLM (50%) et géolocalisation (10%)
- **API RESTful** : Endpoints simples et bien documentés
- **Traitement batch** : Calcul de correspondances multiples en parallèle

## 🚀 Démarrage rapide

### 1. Installation

```bash
cd apps/ai-service

# Créer un environnement virtuel
python -m venv venv

# Activer (Windows)
venv\Scripts\activate

# Activer (Linux/Mac)
source venv/bin/activate

# Installer les dépendances
pip install -r requirements.txt

# Télécharger le modèle spaCy français
python -m spacy download fr_core_news_sm
```

### 2. Configuration

```bash
# Copier le template
cp .env.example .env

# Éditer .env et configurer :
# - LLM_API_KEY (Claude ou OpenAI)
# - Ajuster les poids et seuils si nécessaire
```

### 3. Lancement

```bash
# Mode développement avec rechargement automatique
uvicorn app.main:app --reload --port 8000

# Mode production
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

Le service sera disponible sur `http://localhost:8000`

## 📡 API Endpoints

### Health Check
```bash
GET /health
```

Réponse :
```json
{
  "service": "OUFAREZ AI Service",
  "version": "1.0.0",
  "status": "healthy",
  "model_loaded": true,
  "llm_provider": "anthropic",
  "llm_model": "claude-3-5-sonnet-20241022"
}
```

### Compute Match
```bash
POST /api/ai/compute-match
Content-Type: application/json
```

Body :
```json
{
  "declarationA": {
    "type": "PERTE",
    "typeDocument": "CNI",
    "description": "Perdu ma carte d'identité au nom de NGOA Jean Pierre",
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
    "description": "Trouvé une CNI au nom de NGOA J.P.",
    "nomPartiel": "NGOA",
    "dateEvenement": "2026-05-15T14:00:00Z",
    "localisation": {
      "ville": "Yaoundé",
      "quartier": "Bastos"
    }
  }
}
```

Réponse :
```json
{
  "score_global": 0.872,
  "score_nlp": 0.853,
  "score_llm": 0.900,
  "score_geo": 1.0,
  "au_dessus_du_seuil": true,
  "confiance": "TRES_HAUTE",
  "raisonnement": "Les noms correspondent (NGOA), même ville et quartier, dates très proches. Forte probabilité.",
  "metadata": {
    "model_used": "paraphrase-multilingual-MiniLM-L12-v2",
    "llm_model": "claude-3-5-sonnet-20241022",
    "threshold": 0.72,
    "weights": {
      "nlp": 0.4,
      "llm": 0.5,
      "geo": 0.1
    },
    "processing_time_ms": 1850.5
  },
  "processing_time_ms": 1850.5
}
```

### Batch Match
```bash
POST /api/ai/batch-match
```

Calcule les correspondances pour plusieurs paires.

### Statistics
```bash
GET /api/ai/stats
```

Retourne les statistiques du service.

## 🧪 Tests

```bash
# Installer pytest
pip install pytest pytest-asyncio httpx

# Lancer les tests
pytest tests/ -v

# Avec coverage
pytest tests/ --cov=app --cov-report=html
```

## 🔧 Configuration avancée

### Poids des composantes

Par défaut :
- **NLP** : 40% (similarité sémantique)
- **LLM** : 50% (compréhension contextuelle)
- **GEO** : 10% (proximité géographique)

Modifiable via `.env` :
```env
WEIGHT_NLP=0.4
WEIGHT_LLM=0.5
WEIGHT_GEO=0.1
```

### Seuil de matching

Score minimum pour considérer une correspondance :
```env
MATCH_THRESHOLD=0.72
```

### Choix du LLM

**Anthropic Claude (recommandé)** :
```env
LLM_PROVIDER=anthropic
LLM_API_KEY=sk-ant-xxxxx
LLM_MODEL=claude-3-5-sonnet-20241022
```

**OpenAI GPT** :
```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-xxxxx
LLM_MODEL=gpt-4-turbo-preview
```

## 🏗️ Architecture

```
app/
├── main.py              # Application FastAPI
├── config.py            # Configuration
├── schemas.py           # Schémas Pydantic
├── matching.py          # Moteur de matching
├── llm_client.py        # Client LLM (Claude/GPT)
└── nlp_processor.py     # Traitement NLP (spaCy)
```

### Flux de traitement

```
Requête → Validation (Pydantic)
  ↓
Matching Engine
  ├─→ Score NLP (sentence-transformers)
  ├─→ Score LLM (Claude/GPT)
  └─→ Score GEO (distance)
  ↓
Score Global = 0.4×NLP + 0.5×LLM + 0.1×GEO
  ↓
Décision (seuil 0.72) → Réponse
```

## 📊 Performance

- **Latence moyenne** : 1.5-2s par matching (avec LLM)
- **Throughput** : ~30 matchings/min en séquentiel
- **Précision** : > 85% sur jeux de test

## 🔒 Sécurité

- Validation stricte des entrées (Pydantic)
- CORS configuré
- Pas de stockage de données sensibles
- Timeout sur les appels LLM

## 🐳 Docker

```bash
# Build
docker build -t oufarez-ai-service .

# Run
docker run -p 8000:8000 --env-file .env oufarez-ai-service
```

## 📚 Documentation interactive

Une fois le service lancé :
- **Swagger UI** : http://localhost:8000/docs
- **ReDoc** : http://localhost:8000/redoc

## 🆘 Troubleshooting

### Erreur "Model not found"
```bash
python -m spacy download fr_core_news_sm
```

### Erreur LLM timeout
Augmenter le timeout :
```env
LLM_TIMEOUT=60
```

### Mémoire insuffisante
Réduire la taille du modèle d'embeddings :
```env
EMBEDDING_MODEL=paraphrase-multilingual-mini-LM-L6-v2
```

## 📝 Logs

Les logs sont gérés par `loguru` :
```python
from loguru import logger

logger.info("Message")
logger.error("Erreur")
```

Niveau de log configurable :
```env
LOG_LEVEL=DEBUG
```

## 🤝 Contribution

1. Ajouter des tests pour toute nouvelle fonctionnalité
2. Respecter le format de code (Black, isort)
3. Mettre à jour la documentation

---

**Auteur** : HERVEMEUPS - OUFAREZ  
**Version** : 1.0.0  
**License** : MIT
