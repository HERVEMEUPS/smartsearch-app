# 🎯 Prochaines Étapes - Guide Pratique

Ce document vous guide pas à pas pour finaliser l'implémentation de la plateforme.

---

## 📊 État Actuel : ~40% Complété

### ✅ Ce qui fonctionne
- Architecture complète documentée
- Modèles MongoDB (5 collections)
- Middlewares backend (auth, validation, erreurs, rate limiting)
- Service utilisateur complet
- **Module IA 100% fonctionnel** (Python/FastAPI)
- Docker & Docker Compose configurés
- Scripts de migration
- Documentation exhaustive

### 🔨 Ce qu'il faut terminer
- Services backend restants (3-4)
- Contrôleurs et routes API (5)
- Nouveau serveur restructuré
- Frontend React (optionnel pour MVP)

---

## 🚀 Plan d'Action Recommandé

### Option 1 : MVP Fonctionnel (2-3 jours)

**Objectif** : Système backend complet avec matching IA opérationnel

#### Jour 1 : Services Backend

**1. Créer `declarationService.js`** (2-3h)

```javascript
// backend/src/services/declarationService.js
const { Declaration, Correspondance } = require('../models');
const matchingService = require('./matchingService');

class DeclarationService {
  async create(userId, data) {
    // 1. Valider les données
    // 2. Créer la déclaration
    const declaration = await Declaration.create({
      utilisateur: userId,
      ...data
    });

    // 3. Déclencher le matching en arrière-plan
    if (declaration.canBeMatched()) {
      setImmediate(() => {
        matchingService.findMatchesFor(declaration._id)
          .catch(err => console.error('Erreur matching:', err));
      });
    }

    return declaration;
  }

  async getAll(filters, page = 1, limit = 20) {
    // CRUD Read avec filtres et pagination
  }

  async getById(id) {
    // CRUD Read par ID
  }

  async update(id, userId, updates) {
    // CRUD Update avec vérification propriétaire
  }

  async delete(id, userId) {
    // CRUD Delete (soft delete: statut ARCHIVEE)
  }
}

module.exports = new DeclarationService();
```

**2. Créer `matchingService.js`** (3-4h)

```javascript
// backend/src/services/matchingService.js
const { Declaration, Correspondance, AuditLog } = require('../models');
const axios = require('axios');
const config = require('../config');

class MatchingService {
  async findMatchesFor(declarationId) {
    const declaration = await Declaration.findById(declarationId);

    // 1. Filtrage déterministe (candidats potentiels)
    const candidates = await Declaration
      .find()
      .matchCandidates(declaration, config.matching.windowDays);

    // 2. Pour chaque candidat, appeler le service IA
    for (const candidate of candidates) {
      try {
        const matchResult = await this.computeMatch(declaration, candidate);

        if (matchResult.au_dessus_du_seuil) {
          // 3. Créer la correspondance
          await this.createCorrespondance(declaration, candidate, matchResult);
        }
      } catch (error) {
        console.error(`Erreur matching ${candidate._id}:`, error);
      }
    }
  }

  async computeMatch(declA, declB) {
    const response = await axios.post(
      `${config.aiService.url}/api/ai/compute-match`,
      {
        declarationA: declA.toObject(),
        declarationB: declB.toObject()
      },
      { timeout: config.aiService.timeout }
    );

    return response.data;
  }

  async createCorrespondance(declPerte, declDecouverte, matchResult) {
    // Créer la correspondance dans MongoDB
    const correspondance = await Correspondance.create({
      declarationPerteId: declPerte._id,
      declarationDecouverteId: declDecouverte._id,
      scoreGlobal: matchResult.score_global,
      scoreNLP: matchResult.score_nlp,
      scoreLLM: matchResult.score_llm,
      scoreGeo: matchResult.score_geo,
      metadataIA: matchResult.metadata
    });

    // Mettre à jour les déclarations
    await Declaration.updateMany(
      { _id: { $in: [declPerte._id, declDecouverte._id] } },
      { statut: 'EN_MATCH' }
    );

    // TODO: Déclencher les notifications
    // notificationService.notifyMatch(correspondance);

    return correspondance;
  }
}

module.exports = new MatchingService();
```

**3. Créer `notificationService.js`** (1-2h - version simple)

```javascript
// backend/src/services/notificationService.js
const { Notification, User } = require('../models');

class NotificationService {
  async notifyMatch(correspondance) {
    // Récupérer les utilisateurs
    const [declPerte, declDecouverte] = await Promise.all([
      Declaration.findById(correspondance.declarationPerteId).populate('utilisateur'),
      Declaration.findById(correspondance.declarationDecouverteId).populate('utilisateur')
    ]);

    // Créer les notifications IN_APP
    await Notification.create([
      {
        destinataireId: declPerte.utilisateur._id,
        type: 'MATCH_TROUVE',
        canal: 'IN_APP',
        titre: 'Correspondance trouvée !',
        contenu: `Un document correspondant à votre déclaration a été trouvé (score: ${Math.round(correspondance.scoreGlobal * 100)}%)`,
        correspondanceId: correspondance._id
      },
      {
        destinataireId: declDecouverte.utilisateur._id,
        type: 'MATCH_TROUVE',
        canal: 'IN_APP',
        titre: 'Correspondance trouvée !',
        contenu: `Quelqu\'un recherche le document que vous avez trouvé`,
        correspondanceId: correspondance._id
      }
    ]);

    // TODO: Envoyer email/SMS si activé
  }

  async getUserNotifications(userId, unreadOnly = false) {
    const query = { destinataireId: userId };
    if (unreadOnly) {
      query.statut = { $in: ['EN_ATTENTE', 'ENVOYEE'] };
    }

    return Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(50);
  }
}

module.exports = new NotificationService();
```

#### Jour 2 : Routes et Contrôleurs

**1. Créer les contrôleurs** (fichiers dans `backend/src/controllers/`)

Exemple pour `declarationController.js` :

```javascript
const declarationService = require('../services/declarationService');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.createDeclaration = asyncHandler(async (req, res) => {
  const declaration = await declarationService.create(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: 'Déclaration créée avec succès',
    data: declaration
  });
});

exports.getDeclarations = asyncHandler(async (req, res) => {
  const result = await declarationService.getAll(req.query);

  res.json({
    success: true,
    data: result.declarations,
    pagination: result.pagination
  });
});

// ... autres méthodes
```

**2. Créer les routes** (fichiers dans `backend/src/routes/`)

```javascript
// backend/src/routes/declarationRoutes.js
const express = require('express');
const router = express.Router();
const declarationController = require('../controllers/declarationController');
const { authenticateToken } = require('../middlewares/auth');
const { declarationLimiter } = require('../middlewares/rateLimiter');

router.use(authenticateToken); // Toutes les routes protégées

router.post('/', declarationLimiter, declarationController.createDeclaration);
router.get('/', declarationController.getDeclarations);
router.get('/:id', declarationController.getById);
router.put('/:id', declarationController.update);
router.delete('/:id', declarationController.delete);

module.exports = router;
```

**3. Restructurer `server.js`**

```javascript
// backend/src/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { connectDB } = require('./config/database');
const config = require('./config');
const { errorHandler, notFound } = require('./middlewares/errorHandler');
const { generalLimiter } = require('./middlewares/rateLimiter');

// Routes
const authRoutes = require('./routes/authRoutes');
const declarationRoutes = require('./routes/declarationRoutes');
const matchingRoutes = require('./routes/matchingRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Connexion MongoDB
connectDB();

// Middlewares globaux
app.use(helmet());
app.use(cors(config.cors));
app.use(morgan(config.logging.format));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/declarations', declarationRoutes);
app.use('/api/correspondances', matchingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

// Démarrage serveur
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`🚀 Serveur lancé sur http://localhost:${PORT}`);
  console.log(`📊 Environnement: ${config.env}`);
  console.log(`🤖 Service IA: ${config.aiService.url}`);
});
```

#### Jour 3 : Tests et Déploiement

1. **Tester avec Postman/Insomnia** (2-3h)
   - Créer une collection de requêtes
   - Tester tous les endpoints
   - Vérifier le matching IA

2. **Lancer avec Docker** (1h)
   ```bash
   docker-compose up -d
   docker-compose exec api npm run migrate
   # Tester les endpoints
   ```

3. **Documentation API** (1h)
   - Documenter les endpoints dans un fichier `docs/API.md`
   - Ou ajouter Swagger/OpenAPI

---

### Option 2 : Système Complet avec Frontend (5-7 jours)

Suivre **Option 1** puis ajouter :

#### Jours 4-6 : Frontend React

**Setup Vite + Tailwind CSS**

```bash
cd apps
npm create vite@latest web -- --template react
cd web
npm install
npm install -D tailwindcss postcss autoprefixer
npm install axios react-router-dom react-query @tanstack/react-query
npx tailwindcss init -p
```

**Structure suggérée** :
```
apps/web/src/
├── components/
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx
│   ├── declarations/
│   │   ├── DeclarationForm.jsx
│   │   ├── DeclarationCard.jsx
│   │   └── DeclarationList.jsx
│   ├── matches/
│   │   ├── MatchCard.jsx
│   │   └── MatchList.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Input.jsx
│       └── Modal.jsx
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Dashboard.jsx
│   ├── NewDeclaration.jsx
│   ├── MyDeclarations.jsx
│   ├── Matches.jsx
│   └── Profile.jsx
├── hooks/
│   ├── useAuth.js
│   ├── useDeclarations.js
│   └── useMatches.js
├── services/
│   └── api.js
├── contexts/
│   └── AuthContext.jsx
├── App.jsx
└── main.jsx
```

**Exemple de hook personnalisé** :

```javascript
// hooks/useDeclarations.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function useDeclarations(filters = {}) {
  return useQuery({
    queryKey: ['declarations', filters],
    queryFn: () => api.getDeclarations(filters)
  });
}

export function useCreateDeclaration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => api.createDeclaration(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['declarations']);
    }
  });
}
```

#### Jour 7 : Polish et Tests

---

## 🔧 Commandes Utiles

### Développement

```bash
# Backend dev (avec nodemon)
cd backend
npm run dev

# Service IA dev (avec reload)
cd apps/ai-service
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Frontend dev (Vite)
cd apps/web
npm run dev

# Tout avec Docker
docker-compose up -d
docker-compose logs -f
```

### Tests

```bash
# Tester le service IA
curl http://localhost:8000/health

# Tester le backend
curl http://localhost:3000/health

# Créer un compte
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123","role":"declarant"}'
```

---

## 📚 Ressources

- **Mémoire** : [Memoire_Systeme_Intelligent_Documents.docx](Mémoire/)
- **Architecture** : [ARCHITECTURE.md](ARCHITECTURE.md)
- **Déploiement** : [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)
- **État actuel** : [IMPLEMENTATION_SUMMARY.md](IMPLEMENTATION_SUMMARY.md)
- **Quickstart** : [QUICKSTART_IMPLEMENTATION.md](QUICKSTART_IMPLEMENTATION.md)

---

## 💡 Conseils

1. **Commencer petit** : MVP backend d'abord, frontend ensuite
2. **Tester au fur et à mesure** : Ne pas tout coder puis tout tester
3. **Utiliser Postman** : Créer une collection pour tous les endpoints
4. **Logs clairs** : Ajouter des console.log pour déboguer
5. **Git commits réguliers** : Commit après chaque fonctionnalité
6. **Lire l'architecture** : Tout est documenté dans ARCHITECTURE.md

---

## 🆘 En cas de problème

1. **Vérifier les logs** :
   ```bash
   docker-compose logs -f
   docker-compose logs api
   docker-compose logs ai-service
   ```

2. **MongoDB** : Vérifier la connexion
   ```bash
   docker-compose exec mongodb mongosh
   ```

3. **Service IA** : Tester en isolation
   ```bash
   curl http://localhost:8000/health
   ```

4. **Variables d'environnement** : Vérifier `.env`

---

Bon courage ! 🚀 La partie la plus complexe (architecture + IA) est déjà faite.
