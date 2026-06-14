# 🏗️ Architecture du Système Intelligent de Documents Perdus

## Vue d'ensemble

Cette plateforme implémente une architecture moderne en 3 couches principales :

```
┌─────────────────────────────────────────────────────────────┐
│                    COUCHE PRÉSENTATION                       │
│         React 18 + Vite + Tailwind CSS + React Query        │
└─────────────────────┬───────────────────────────────────────┘
                      │ REST API (HTTPS)
┌─────────────────────┴───────────────────────────────────────┐
│                    COUCHE API (GATEWAY)                      │
│          Node.js + Express + JWT + Rate Limiting            │
└─────────────┬───────────────────┬───────────────────────────┘
              │                   │
      ┌───────┴────────┐   ┌──────┴──────────┐
      │  COUCHE MÉTIER │   │  MODULE IA      │
      │   (Services)   │   │ Python/FastAPI  │
      │  - UserService │   │ - LLM API       │
      │  - DeclService │   │ - NLP (spaCy)   │
      │  - MatchingSvc │   │ - Embeddings    │
      │  - NotifSvc    │   │ - Scoring       │
      └───────┬────────┘   └──────┬──────────┘
              │                   │
      ┌───────┴───────────────────┴──────────┐
      │        COUCHE DONNÉES                 │
      │    MongoDB + Mongoose + Indexes       │
      └───────────────────────────────────────┘
```

## 📦 Structure du projet (Monorepo)

```
Documents_perdus - V3/
├── apps/
│   ├── web/                      # Application React
│   │   ├── src/
│   │   │   ├── components/       # Composants UI
│   │   │   ├── pages/            # Pages principales
│   │   │   ├── hooks/            # Custom hooks
│   │   │   ├── services/         # Services API
│   │   │   ├── contexts/         # Contextes React
│   │   │   ├── utils/            # Utilitaires
│   │   │   └── App.jsx
│   │   ├── public/
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── api/                      # Backend Node.js
│   │   ├── src/
│   │   │   ├── models/           # Modèles Mongoose
│   │   │   ├── routes/           # Routes Express
│   │   │   ├── services/         # Logique métier
│   │   │   ├── middlewares/      # Middlewares
│   │   │   ├── controllers/      # Contrôleurs
│   │   │   ├── utils/            # Utilitaires
│   │   │   ├── config/           # Configuration
│   │   │   └── server.js         # Point d'entrée
│   │   ├── tests/
│   │   └── package.json
│   │
│   └── ai-service/               # Service IA Python
│       ├── app/
│       │   ├── main.py           # FastAPI app
│       │   ├── matching.py       # Moteur de matching
│       │   ├── llm_client.py     # Client LLM
│       │   ├── nlp_processor.py  # Traitement NLP
│       │   ├── embeddings.py     # Gestion embeddings
│       │   ├── schemas.py        # Schémas Pydantic
│       │   └── config.py         # Configuration
│       ├── tests/
│       ├── requirements.txt
│       └── Dockerfile
│
├── packages/
│   ├── shared-types/             # Types partagés (TS)
│   └── ui-components/            # Composants UI réutilisables
│
├── infra/
│   ├── docker/
│   │   ├── docker-compose.yml
│   │   ├── docker-compose.dev.yml
│   │   └── docker-compose.prod.yml
│   └── k8s/                      # Kubernetes (futur)
│
├── UML/                          # Diagrammes UML
│   ├── use-case.puml
│   ├── class-diagram.puml
│   ├── sequence-diagram.puml
│   └── activity-diagram.puml
│
├── docs/
│   ├── API.md
│   ├── DEPLOYMENT.md
│   └── DEVELOPMENT.md
│
└── scripts/
    ├── migrate-json-to-mongo.js
    ├── seed-data.js
    └── backup.sh
```

## 🗄️ Modèle de données MongoDB

### Collection: users
```javascript
{
  _id: ObjectId,
  username: String (unique, indexed),
  email: String (unique, indexed),
  telephone: String,
  password: String (hashed bcrypt),
  role: Enum['admin', 'declarant'],
  createdAt: Date,
  updatedAt: Date
}
```

### Collection: declarations
```javascript
{
  _id: ObjectId,
  utilisateur: ObjectId (ref: User),
  type: Enum['PERTE', 'DECOUVERTE'],
  typeDocument: Enum['CNI', 'PASSEPORT', 'PERMIS', 'CARTE_SCOLAIRE', 'DIPLOME', 'AUTRE'],
  description: String (max 2000),
  nomPartiel: String (indexed),
  numeroPartiel: String (indexed),
  dateEvenement: Date,
  localisation: {
    ville: String (indexed),
    quartier: String,
    geo: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  },
  statut: Enum['EN_ATTENTE', 'EN_MATCH', 'CLOTUREE'],
  photoUrl: String (optionnel),
  contactMasque: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
- { 'localisation.geo': '2dsphere' }
- { type: 1, typeDocument: 1, dateEvenement: -1 }
- { statut: 1, createdAt: -1 }
```

### Collection: correspondances
```javascript
{
  _id: ObjectId,
  declarationPerteId: ObjectId (ref: Declaration),
  declarationDecouverteId: ObjectId (ref: Declaration),
  scoreGlobal: Number (0-1),
  scoreNLP: Number (0-1),
  scoreLLM: Number (0-1),
  scoreGeo: Number (0-1),
  statut: Enum['PROPOSEE', 'ACCEPTEE', 'REJETEE', 'CONFIRMEE'],
  metadataIA: {
    modelUsed: String,
    confidence: Number,
    reasoning: String
  },
  notificationEnvoyee: Boolean,
  createdAt: Date,
  updatedAt: Date
}

// Indexes
- { declarationPerteId: 1, statut: 1 }
- { declarationDecouverteId: 1, statut: 1 }
- { scoreGlobal: -1 }
```

### Collection: notifications
```javascript
{
  _id: ObjectId,
  destinataireId: ObjectId (ref: User),
  type: Enum['MATCH_TROUVE', 'NOUVEAU_CONTACT', 'CONFIRMATION_RECUP'],
  canal: Enum['EMAIL', 'SMS', 'PUSH'],
  contenu: String,
  statut: Enum['EN_ATTENTE', 'ENVOYEE', 'ECHEC'],
  correspondanceId: ObjectId (ref: Correspondance),
  createdAt: Date,
  sentAt: Date
}
```

### Collection: audit_logs
```javascript
{
  _id: ObjectId,
  acteurId: ObjectId (ref: User),
  action: String,
  entite: String,
  entiteId: ObjectId,
  details: Object,
  timestamp: Date
}
```

## 🔄 Flux du Matching Intelligent

```
┌─────────────────────────────────────────────────────────────┐
│  1. UTILISATEUR SOUMET UNE DÉCLARATION                      │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  2. API VALIDE ET SAUVEGARDE DANS MONGODB                   │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  3. DÉCLENCHEMENT ASYNCHRONE DU MATCHING (Queue)            │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  4. FILTRAGE DÉTERMINISTE                                   │
│     - Type de document identique                            │
│     - Zone géographique proche                              │
│     - Fenêtre temporelle ±30 jours                          │
│     - Type opposé (PERTE vs DECOUVERTE)                     │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  5. APPEL AU SERVICE IA (Python/FastAPI)                    │
│     POST /api/ai/compute-match                              │
│     Body: { declarationA, declarationB }                    │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  6. CALCUL DU SCORE COMPOSITE                               │
│                                                              │
│  A) Score NLP (40%)                                          │
│     - Similarité sémantique (embeddings)                    │
│     - Extraction d'entités (noms, numéros)                  │
│     - Normalisation linguistique                            │
│                                                              │
│  B) Score LLM (50%)                                          │
│     - Évaluation contextuelle par Claude/GPT                │
│     - Compréhension du contexte local                       │
│     - Raisonnement sur les descriptions                     │
│                                                              │
│  C) Score Géographique (10%)                                │
│     - Distance entre les localisations                      │
│     - Même ville = 1.0, autre = dégressif                   │
│                                                              │
│  SCORE_GLOBAL = 0.4×NLP + 0.5×LLM + 0.1×GEO                 │
└─────────────────┬───────────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────────┐
│  7. DÉCISION : SCORE ≥ 0.72 ?                               │
└─────────┬───────────────────┬───────────────────────────────┘
          │ NON               │ OUI
          ▼                   ▼
┌──────────────────┐  ┌───────────────────────────────────────┐
│  Pas de match    │  │  8. CRÉATION CORRESPONDANCE + NOTIFS  │
│  (archiver)      │  │     - Sauvegarder dans MongoDB        │
└──────────────────┘  │     - Email aux 2 parties             │
                      │     - SMS au déclarant                 │
                      │     - Notification push                │
                      └───────────────────────────────────────┘
```

## 🔐 Sécurité

### Authentification
- JWT avec refresh tokens
- Expiration: Access token 15min, Refresh token 7 jours
- Rotation automatique des tokens

### Autorisation
- RBAC (Role-Based Access Control)
- Rôles: `admin`, `declarant`
- Middleware d'autorisation par route

### Protection des données
- Chiffrement des données sensibles au repos
- HTTPS obligatoire en production
- Rate limiting par IP
- Masquage des coordonnées personnelles
- Anonymisation des données après clôture

### Conformité RGPD
- Consentement explicite
- Droit à l'oubli (suppression)
- Export des données personnelles
- Durée de rétention: 90 jours après clôture
- Audit logs complets

## 🚀 Déploiement

### Environnements

1. **Development** (local)
   - Docker Compose
   - MongoDB local
   - LLM en mode mock

2. **Staging** (pré-production)
   - Docker Compose sur VPS
   - MongoDB Atlas (cluster gratuit)
   - LLM API avec quota réduit

3. **Production**
   - Kubernetes (ou Docker Swarm)
   - MongoDB Atlas (cluster production)
   - LLM API production
   - CDN pour les assets statiques
   - Monitoring (Grafana + Prometheus)

## 📊 KPIs et Monitoring

### KPIs Métier
- Temps moyen de déclaration: < 3 min
- Précision du matching: ≥ 85%
- Latence de notification: < 60s
- Délai de récupération: -70% vs processus actuel
- Taux de confirmation des matchs: > 60%

### KPIs Techniques
- Disponibilité: 99.5%
- Temps de réponse API: < 500ms (p95)
- Temps de réponse IA: < 5s (p95)
- Taux d'erreur: < 1%

### Monitoring
- Logs centralisés (ELK Stack ou Loki)
- Métriques (Prometheus + Grafana)
- Alerting (PagerDuty ou Slack)
- Tracing distribué (Jaeger)

## 🧪 Stratégie de tests

1. **Tests unitaires** (Jest, pytest)
   - Couverture: > 80%
   - Services métier
   - Utilitaires

2. **Tests d'intégration** (Supertest)
   - Routes API
   - Intégration MongoDB
   - Intégration service IA

3. **Tests E2E** (Playwright)
   - Parcours utilisateur critiques
   - Déclaration → Matching → Notification

4. **Tests de performance** (k6)
   - 1000 utilisateurs concurrents
   - Stress test du matching

5. **Tests de sécurité** (OWASP ZAP)
   - Injection SQL/NoSQL
   - XSS, CSRF
   - Broken authentication

## 🔄 CI/CD Pipeline

```yaml
# .github/workflows/ci-cd.yml
on: [push, pull_request]

jobs:
  test:
    - Lint (ESLint, Black)
    - Tests unitaires
    - Tests d'intégration
    - Analyse de sécurité

  build:
    - Build frontend (Vite)
    - Build backend (Docker)
    - Build AI service (Docker)

  deploy-staging:
    if: branch == 'develop'
    - Deploy to staging
    - Run smoke tests

  deploy-production:
    if: branch == 'main'
    - Deploy to production
    - Run health checks
    - Rollback si échec
```

## 📚 Prochaines étapes

1. ✅ Migration JSON → MongoDB
2. ✅ Restructuration backend en couches
3. ✅ Développement module IA
4. ✅ Frontend React moderne
5. ✅ Notifications multicanal
6. ✅ Dockerisation complète
7. 🔲 Tests automatisés
8. 🔲 CI/CD
9. 🔲 Déploiement staging
10. 🔲 Documentation API (Swagger)
