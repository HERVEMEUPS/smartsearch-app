# 🔍 Système Intelligent de Gestion de Documents Perdus - V3

![Status](https://img.shields.io/badge/status-intelligent-brightgreen)
![Security](https://img.shields.io/badge/security-JWT%20%2B%20bcrypt-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green)
![Python](https://img.shields.io/badge/python-%3E%3D3.11-blue)
![MongoDB](https://img.shields.io/badge/mongodb-%3E%3D7.0-green)
![AI](https://img.shields.io/badge/AI-Claude%20%2F%20GPT-purple)

Plateforme full-stack **intelligente** avec matching sémantique par IA pour la déclaration, la recherche et la récupération automatique de documents perdus ou trouvés au Cameroun.

## ✨ Fonctionnalités Principales

### 🤖 Intelligence Artificielle
- **Matching sémantique automatique** : Rapprochement intelligent PERTE ↔ DÉCOUVERTE
- **Score composite** : Combine NLP (40%), LLM (50%) et géolocalisation (10%)
- **Évaluation contextuelle** : Intégration de Claude (Anthropic) ou GPT (OpenAI)
- **Précision ≥ 85%** : Détection fiable des correspondances

### 🔐 Sécurité et Authentification
- **JWT avec refresh tokens** (access 15min, refresh 7 jours)
- **Bcrypt** pour le hachage des mots de passe (10 rounds)
- **Rate limiting** intelligent par endpoint
- **Conformité RGPD** : Anonymisation et droit à l'oubli

### 📝 Gestion des Déclarations
- **Formulaires structurés** avec validation complète
- **Types de documents** : CNI, Passeport, Permis, Carte scolaire, Diplôme, etc.
- **Géolocalisation** : Ville, quartier, coordonnées GPS
- **Statuts** : EN_ATTENTE, EN_MATCH, CLOTUREE, ARCHIVEE

### 🔔 Notifications Multicanal
- **Email** (SendGrid)
- **SMS** (Twilio)
- **Notifications push** (web)
- **Notifications in-app**

### 👥 Gestion des Utilisateurs
- **Rôles** : Admin, Déclarant
- **Profils** : Préférences de notifications, historique
- **Audit logs** : Traçabilité complète des actions

### 📊 Tableau de Bord Admin
- **Statistiques en temps réel**
- **Gestion des correspondances**
- **Modération des déclarations**
- **Indicateurs de performance (KPIs)**

## 🚀 Démarrage Rapide

### Méthode 1 : Docker (Recommandé)

```bash
# 1. Cloner le projet
cd "Documents_perdus - V3"

# 2. Configurer les variables d'environnement
cp .env.example .env
# Éditer .env : LLM_API_KEY, JWT_SECRET obligatoires

# 3. Démarrer tous les services
docker-compose up -d

# 4. Migration des données
docker-compose exec api npm run migrate

# 5. Accéder à la plateforme
# Frontend: http://localhost:5173
# API: http://localhost:3000
# Service IA: http://localhost:8000
```

### Méthode 2 : Installation manuelle

**Prérequis :**
- Node.js ≥ 16.0.0
- Python ≥ 3.11
- MongoDB ≥ 7.0

```bash
# 1. Backend API
cd backend
npm install
cp .env.example .env
# Configurer .env
npm run dev

# 2. Service IA (nouveau terminal)
cd apps/ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download fr_core_news_sm
uvicorn app.main:app --reload --port 8000

# 3. Frontend (nouveau terminal, si disponible)
cd apps/web
npm install
npm run dev
```

📚 **Documentation complète** : [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

## 📁 Architecture du Projet

```
Documents_perdus - V3/
├── apps/
│   ├── web/                      # Frontend React + Vite + Tailwind CSS
│   │   ├── src/                  # Code source React
│   │   └── package.json
│   │
│   └── ai-service/               # 🤖 Service IA Python/FastAPI
│       ├── app/
│       │   ├── main.py           # Application FastAPI
│       │   ├── matching.py       # Moteur de matching intelligent
│       │   ├── llm_client.py     # Client LLM (Claude/GPT)
│       │   ├── nlp_processor.py  # Traitement NLP (spaCy)
│       │   └── config.py         # Configuration
│       ├── requirements.txt      # Dépendances Python
│       └── Dockerfile
│
├── backend/                      # API Node.js + Express
│   ├── src/
│   │   ├── models/               # 🗄️ Modèles Mongoose (MongoDB)
│   │   │   ├── User.js
│   │   │   ├── Declaration.js
│   │   │   ├── Correspondance.js
│   │   │   ├── Notification.js
│   │   │   └── AuditLog.js
│   │   ├── services/             # 💼 Logique métier
│   │   │   ├── userService.js
│   │   │   ├── declarationService.js
│   │   │   ├── matchingService.js
│   │   │   └── notificationService.js
│   │   ├── routes/               # 🛣️ Routes API REST
│   │   ├── middlewares/          # 🔒 Auth, validation, erreurs
│   │   ├── controllers/          # 🎮 Contrôleurs
│   │   ├── config/               # ⚙️ Configuration
│   │   └── server.js             # Point d'entrée
│   ├── package.json
│   └── Dockerfile
│
├── scripts/
│   └── migrate-json-to-mongo.js  # Migration JSON → MongoDB
│
├── UML/                          # Diagrammes UML (PlantUML)
│   ├── use-case.puml
│   ├── class-diagram.puml
│   ├── sequence-diagram.puml
│   └── activity-diagram.puml
│
├── docs/
│   ├── ARCHITECTURE.md           # 🏗️ Architecture détaillée
│   ├── DEPLOYMENT_GUIDE.md       # 🚀 Guide de déploiement
│   └── QUICKSTART_IMPLEMENTATION.md
│
├── docker-compose.yml            # 🐳 Orchestration Docker
├── .env.example                  # Template configuration
└── README.md                     # Ce fichier
```

## 🔌 API Endpoints

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/register` | Inscription | ❌ |
| POST | `/login` | Connexion | ❌ |

### Documents

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/declaration` | Déclarer un document | ✅ |
| GET | `/recherche` | Rechercher des documents | ✅ |
| GET | `/documents` | Tous les documents (admin) | ✅ 👑 |

Voir [backend/README.md](backend/README.md) pour la documentation complète de l'API.

## 🔐 Sécurité

- ✅ Mots de passe hachés avec **bcrypt** (10 rounds)
- ✅ Authentification **JWT** (expiration 24h)
- ✅ Variables d'environnement pour les secrets
- ✅ Validation des entrées utilisateur
- ✅ Contrôle d'accès par rôle
- ✅ Gestion des erreurs sécurisée

## 🧪 Comptes de test

| Username | Password | Rôle |
|----------|----------|------|
| admin | admin123 | Admin |
| declarant1 | 1234 | Déclarant |

⚠️ **À supprimer en production**

## 📖 Documentation complète

- **API Backend:** [backend/README.md](backend/README.md)
- **Rapport détaillé:** [RAPPORT_PROJET.md](RAPPORT_PROJET.md)

## 🛠️ Technologies

**Backend:**
- Node.js + Express
- JWT (jsonwebtoken)
- bcrypt
- CORS
- dotenv

**Frontend:**
- HTML5 + CSS3
- JavaScript Vanilla
- Fetch API
- LocalStorage

## 📝 Variables d'environnement

Créer un fichier `.env` dans le dossier `backend/` :

```env
JWT_SECRET=votre-secret-jwt-changez-moi
ADMIN_CODE=votre-code-admin
PORT=3000
```

## 🐛 Problèmes connus

- Stockage JSON (pas adapté pour production à grande échelle)
- Pas de pagination sur la recherche
- Pas de rate limiting sur les tentatives de connexion

## 🚧 Améliorations futures

- [ ] Migration vers PostgreSQL/MongoDB
- [ ] Upload de photos de documents
- [ ] Notifications email
- [ ] Tests automatisés
- [ ] CI/CD
- [ ] Docker
- [ ] HTTPS

## 📄 Licence

Projet académique - M2 SIGL

## 👨‍💻 Auteur

**HERVEMEUPS** - 2026

---

Pour plus de détails, consultez [RAPPORT_PROJET.md](RAPPORT_PROJET.md)
