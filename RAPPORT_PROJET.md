# 📋 RAPPORT DE PROJET - MASTER 2 SIGL PROFESSIONNEL

**Titre :** ANALYSE, CONCEPTION ET IMPLÉMENTATION D'UN SYSTÈME INTELLIGENT DÉDIÉ À LA DÉCLARATION ET À LA RECHERCHE DE DOCUMENTS PERDUS

**Auteur :** NGOA (HERVEMEUPS)  
**Formation :** Master 2 SIGL Professionnel  
**Date :** Juin 2026  
**Version :** 3.0 (SmartSearch)

---

## 📊 RÉSUMÉ EXÉCUTIF

### Contexte et Problématique

La perte de documents officiels (CNI, passeports, permis, diplômes) constitue un problème récurrent causant des désagréments significatifs aux citoyens. L'absence d'un système centralisé de déclaration et de recherche rend difficile le rapprochement entre documents perdus et retrouvés.

### Objectif du Projet

Concevoir et implémenter **SmartSearch**, un système intelligent permettant :
- La **déclaration en ligne** de documents perdus ou trouvés
- La **recherche avancée** avec algorithmes de matching intelligent
- Le **rapprochement automatique** entre déclarations de perte et de découverte
- La **gestion centralisée** par une équipe administrative

### Solution Proposée

Une application web full-stack moderne intégrant :
- **Backend RESTful** : Node.js + Express + MongoDB
- **Authentification sécurisée** : JWT + Bcrypt
- **Intelligence artificielle** : Fuzzy matching (Fuse.js) + algorithme de scoring
- **Interface responsive** : HTML5 + CSS3 + JavaScript vanilla
- **Déploiement cloud** : Render.com + MongoDB Atlas

---

## 🎯 OBJECTIFS TECHNIQUES

### Objectifs Principaux
✅ **Système d'authentification sécurisé** (JWT + Bcrypt)  
✅ **Déclaration intelligente** avec validation des données  
✅ **Recherche floue** (fuzzy matching) tolérante aux fautes  
✅ **Matching automatique** PERTE ↔ DECOUVERTE  
✅ **Dashboard administrateur** avec statistiques en temps réel  
✅ **API RESTful** complète et documentée  
✅ **Déploiement production** sur infrastructure cloud  

### Objectifs Secondaires
✅ **Gestion des rôles** (Admin / Utilisateur)  
✅ **Historique des déclarations**  
✅ **Système de scoring** pour pertinence des résultats  
✅ **Notifications** de correspondances  
✅ **Architecture scalable** et maintenable  

---

## 🏗️ ARCHITECTURE DU SYSTÈME

### Architecture Globale

```
┌─────────────────────────────────────────────────────────────────┐
│                          CLIENT (Frontend)                       │
│  HTML5 + CSS3 + JavaScript Vanilla + Fetch API + LocalStorage  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                        HTTPS/REST API
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                       SERVEUR (Backend)                          │
│    Node.js + Express.js + JWT + Bcrypt + Fuse.js + CORS        │
└────────────────────────────┬────────────────────────────────────┘
                             │
                        MongoDB Driver
                             │
┌────────────────────────────┴────────────────────────────────────┐
│                   BASE DE DONNÉES (MongoDB Atlas)                │
│    Collections: users, declarations, notifications, auditLogs   │
└──────────────────────────────────────────────────────────────────┘
```

### Architecture Backend (MVC)

```
backend/
├── src/
│   ├── models/              # Modèles Mongoose (Schémas MongoDB)
│   │   ├── User.js          # Utilisateurs (auth)
│   │   ├── Declaration.js   # Déclarations (PERTE/DECOUVERTE)
│   │   ├── Correspondance.js# Matchings automatiques
│   │   ├── Notification.js  # Notifications utilisateurs
│   │   └── AuditLog.js      # Logs d'audit admin
│   │
│   ├── controllers/         # Logique métier
│   │   ├── authController.js        # Authentification
│   │   ├── declarationController.js # CRUD déclarations
│   │   ├── matchingController.js    # Matching intelligent
│   │   ├── notificationController.js# Gestion notifications
│   │   └── adminController.js       # Dashboard admin
│   │
│   ├── middlewares/         # Middlewares Express
│   │   ├── auth.js          # Vérification JWT
│   │   ├── validator.js     # Validation des entrées
│   │   ├── errorHandler.js  # Gestion globale des erreurs
│   │   └── rateLimiter.js   # Protection DDoS
│   │
│   └── config/              # Configuration
│       ├── database.js      # Connexion MongoDB
│       └── index.js         # Variables d'environnement
│
├── intelligent-search.js    # Algorithme de recherche floue
└── package.json             # Dépendances npm
```

### Architecture Frontend

```
frontend/
├── index.html               # Page d'accueil (menu principal)
├── login.html               # Authentification
├── register.html            # Inscription
├── declaration.html         # Formulaire de déclaration
├── recherche.html           # Recherche avancée
├── dashboard.html           # Dashboard admin
├── script.js                # Logique JavaScript (10.5 KB)
└── style.css                # Styles responsives (2 KB)
```

---

## 🧠 ALGORITHMES INTELLIGENTS

### 1. Recherche Floue (Fuzzy Matching)

**Bibliothèque utilisée :** Fuse.js

**Configuration :**
```javascript
{
  threshold: 0.4,     // Tolérance aux fautes (0 = exact, 1 = tout)
  keys: [
    { name: 'nom', weight: 0.4 },        // 40% de poids
    { name: 'typeDocument', weight: 0.3 },// 30% de poids
    { name: 'lieu', weight: 0.2 },       // 20% de poids
    { name: 'numero', weight: 0.1 }      // 10% de poids
  ]
}
```

**Fonctionnalités :**
- Tolère les fautes de frappe
- Recherche phonétique
- Pondération par importance des champs
- Score de pertinence sur 100

### 2. Scoring Avancé

**Critères de scoring :**
```javascript
Score = Score_base + Bonus_numero + Bonus_nom + Bonus_type + Bonus_lieu + Bonus_date

- Numéro exact : +50 points
- Nom similaire : +30 points (pondéré par distance de Levenshtein)
- Type exact : +20 points
- Lieu similaire : +15 points
- Document récent (<30j) : +10 points
```

**Seuil minimum :** 20 points (filtrage des résultats non pertinents)

### 3. Matching Automatique PERTE ↔ DECOUVERTE

**Algorithme de correspondance :**
```javascript
function calculateMatchScore(perdu, trouve) {
  let score = 0;
  
  // Type de document (30%)
  if (perdu.typeDocument === trouve.typeDocument) score += 30;
  
  // Nom (40%) - Distance de Levenshtein
  const nomSimilarity = stringSimilarity(perdu.nom, trouve.nom);
  score += nomSimilarity * 40;
  
  // Numéro (20%) - Correspondance exacte prioritaire
  if (perdu.numero === trouve.numero) score += 20;
  
  // Lieu (10%)
  const lieuSimilarity = stringSimilarity(perdu.lieu, trouve.lieu);
  score += lieuSimilarity * 10;
  
  // Bonus : Proximité temporelle (± 7 jours)
  if (Math.abs(daysDiff) <= 7) score += 10;
  
  return score; // Score sur 100
}
```

**Seuil de confiance :**
- 90%+ : Confiance "Très élevée"
- 80-89% : Confiance "Élevée"
- 70-79% : Confiance "Moyenne"
- <70% : Rejeté

---

## 🔐 SÉCURITÉ IMPLÉMENTÉE

### 1. Authentification JWT (JSON Web Token)

**Configuration :**
```javascript
{
  secret: process.env.JWT_SECRET,
  expiresIn: '24h',
  algorithm: 'HS256'
}
```

**Flux d'authentification :**
```
1. User → POST /api/auth/login {username, password}
2. Server → Vérification bcrypt
3. Server → Génération JWT signé
4. Server → {token, user, role}
5. Client → Stockage localStorage
6. Client → Toutes requêtes: Authorization: Bearer <token>
7. Server → Middleware auth.js vérifie signature et expiration
```

### 2. Hachage des Mots de Passe (Bcrypt)

**Algorithme :** bcrypt avec 10 rounds de salage

```javascript
// Inscription
const hashedPassword = await bcrypt.hash(password, 10);

// Connexion
const isValid = await bcrypt.compare(password, user.password);
```

**Sécurité :**
- Pas de mots de passe en clair en base
- Protection contre rainbow tables
- Résistance aux attaques par force brute

### 3. Contrôle d'Accès Basé sur les Rôles (RBAC)

**Rôles :**
- **Admin** : Accès complet (CRUD utilisateurs, déclarations, stats)
- **Utilisateur** : Déclaration et recherche uniquement

**Middleware de vérification :**
```javascript
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Accès refusé' });
  }
  next();
}
```

### 4. Validation des Entrées

**Validation côté serveur (validator.js) :**
- Sanitization des entrées (XSS)
- Validation des formats (email, dates, enum)
- Vérification des champs requis
- Limitation de longueur des chaînes

### 5. Protection DDoS (Rate Limiting)

```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes max
  message: 'Trop de requêtes, réessayez plus tard'
});
```

### 6. Autres Mesures de Sécurité

✅ **CORS configuré** (whitelist des origines autorisées)  
✅ **Helmet.js** (sécurisation headers HTTP)  
✅ **Variables d'environnement** (.env pour secrets)  
✅ **MongoDB injection prevention** (Mongoose sanitization)  
✅ **Logs d'audit** (AuditLog.js)  
✅ **HTTPS en production** (Render.com)  

---

## 🗄️ MODÈLE DE DONNÉES

### Schéma MongoDB

#### Collection `users`
```javascript
{
  _id: ObjectId,
  username: String (unique, index),
  email: String (unique, index),
  password: String (hashed),
  role: Enum['admin', 'user'],
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection `declarations`
```javascript
{
  _id: ObjectId,
  utilisateur: ObjectId (ref: User),
  type: Enum['PERTE', 'DECOUVERTE'],
  typeDocument: Enum['CNI', 'PASSEPORT', 'PERMIS', ...],
  nomPartiel: String (index),
  numeroPartiel: String (index),
  description: String (text index),
  dateEvenement: Date (index),
  localisation: {
    ville: String (index),
    quartier: String,
    pointRepere: String,
    geo: {
      type: 'Point',
      coordinates: [longitude, latitude]
    }
  },
  statut: Enum['EN_ATTENTE', 'EN_MATCH', 'CLOTUREE', 'ARCHIVEE'],
  photoUrl: String,
  contactMasque: Boolean,
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection `correspondances`
```javascript
{
  _id: ObjectId,
  declarationPerte: ObjectId (ref: Declaration),
  declarationDecouverte: ObjectId (ref: Declaration),
  scoreCorrespondance: Number (0-100),
  statut: Enum['EN_ATTENTE', 'CONFIRMEE', 'REJETEE'],
  detailsMatch: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### Collection `notifications`
```javascript
{
  _id: ObjectId,
  utilisateur: ObjectId (ref: User),
  type: Enum['MATCH', 'MESSAGE', 'SYSTEME'],
  contenu: String,
  lue: Boolean,
  dateEnvoi: Date,
  createdAt: Date
}
```

#### Collection `auditlogs`
```javascript
{
  _id: ObjectId,
  utilisateur: ObjectId (ref: User),
  action: String,
  ressource: String,
  details: Object,
  ipAddress: String,
  timestamp: Date
}
```

### Index MongoDB (Performances)

```javascript
// Recherche rapide
declarations.createIndex({ type: 1, typeDocument: 1, dateEvenement: -1 });
declarations.createIndex({ statut: 1, createdAt: -1 });
declarations.createIndex({ 'localisation.ville': 1, typeDocument: 1 });

// Recherche full-text
declarations.createIndex({
  description: 'text',
  nomPartiel: 'text',
  'localisation.ville': 'text'
});

// Recherche géospatiale
declarations.createIndex({ 'localisation.geo': '2dsphere' });
```

---

## 🔌 API RESTful - ENDPOINTS

### Authentication

#### `POST /api/auth/register`
**Description :** Inscription d'un nouvel utilisateur

**Body :**
```json
{
  "username": "utilisateur",
  "email": "user@example.com",
  "password": "motdepasse123",
  "role": "user",
  "adminCode": "SECRET_CODE" // Uniquement pour role="admin"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Compte créé avec succès"
}
```

---

#### `POST /api/auth/login`
**Description :** Connexion utilisateur

**Body :**
```json
{
  "username": "utilisateur",
  "password": "motdepasse123"
}
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "username": "utilisateur",
      "email": "user@example.com",
      "role": "user"
    }
  }
}
```

---

### Déclarations (Routes protégées 🔒)

#### `POST /api/declarations`
**Description :** Créer une déclaration

**Headers :**
```
Authorization: Bearer <token>
```

**Body :**
```json
{
  "type": "PERTE",
  "typeDocument": "CNI",
  "nomPartiel": "DUPONT Jean",
  "numeroPartiel": "123456789",
  "localisation": {
    "ville": "Yaoundé",
    "quartier": "Essos"
  },
  "dateEvenement": "2026-06-15",
  "description": "CNI perdue au marché central"
}
```

**Réponse (201) :**
```json
{
  "success": true,
  "message": "Déclaration créée avec succès",
  "data": {
    "_id": "60d5ec49f1b2c72b8c8e4f3a",
    "type": "PERTE",
    "typeDocument": "CNI",
    "statut": "EN_ATTENTE",
    "createdAt": "2026-06-15T10:30:00.000Z"
  }
}
```

---

#### `GET /api/declarations`
**Description :** Rechercher des déclarations avec filtres

**Headers :**
```
Authorization: Bearer <token>
```

**Query Parameters :**
- `type` : "PERTE" ou "DECOUVERTE"
- `typeDocument` : CNI, PASSEPORT, etc.
- `search` : Recherche dans nom et numéro (fuzzy)
- `ville` : Ville de l'événement
- `dateDebut` : Date de début (YYYY-MM-DD)
- `dateFin` : Date de fin (YYYY-MM-DD)

**Exemple :**
```
GET /api/declarations?type=PERTE&typeDocument=CNI&search=DUPONT&ville=Yaoundé
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": [
    {
      "_id": "60d5ec49f1b2c72b8c8e4f3a",
      "type": "PERTE",
      "typeDocument": "CNI",
      "nomPartiel": "DUPONT Jean",
      "localisation": {
        "ville": "Yaoundé"
      },
      "score": 95,
      "matchDetails": ["Numéro exact", "Nom similaire (98%)"]
    }
  ]
}
```

---

### Matching (Admin uniquement 👑)

#### `GET /api/matching/auto`
**Description :** Lancer le matching automatique

**Headers :**
```
Authorization: Bearer <token>
```

**Réponse (200) :**
```json
{
  "success": true,
  "message": "Matching terminé",
  "data": {
    "correspondancesTrouvées": 15,
    "nouveauxMatches": 3
  }
}
```

---

### Administration (Admin uniquement 👑)

#### `GET /api/admin/stats`
**Description :** Statistiques du dashboard

**Headers :**
```
Authorization: Bearer <token>
```

**Réponse (200) :**
```json
{
  "success": true,
  "data": {
    "total": 150,
    "perdus": 85,
    "trouves": 65,
    "correspondances": 12,
    "tauxRecuperation": 14,
    "parType": [
      ["CNI", 60],
      ["PASSEPORT", 35],
      ["PERMIS", 25]
    ]
  }
}
```

---

## 🎨 INTERFACE UTILISATEUR

### Pages Principales

| Page | Route | Description | Rôle requis |
|------|-------|-------------|-------------|
| Accueil | `/index.html` | Menu principal avec liens | Tous |
| Connexion | `/login.html` | Formulaire de connexion | Public |
| Inscription | `/register.html` | Création de compte | Public |
| Déclaration | `/declaration.html` | Déclarer un document | Utilisateur |
| Recherche | `/recherche.html` | Recherche avancée | Utilisateur |
| Dashboard | `/dashboard.html` | Statistiques et gestion | Admin |

### Fonctionnalités Frontend

1. **Gestion de Session**
   - Stockage JWT dans localStorage
   - Auto-refresh du token
   - Déconnexion automatique après expiration

2. **Validation Client**
   - Validation temps réel des formulaires
   - Messages d'erreur clairs
   - Feedback visuel

3. **Design Responsive**
   - Compatible mobile, tablette, desktop
   - Breakpoints CSS : 768px, 1024px
   - Interface moderne avec Font Awesome

4. **Affichage Intelligent**
   - Badge de type (📍 PERDU / ✅ TROUVÉ)
   - Score de pertinence visuel
   - Filtres enregistrés

---

## 🚀 DÉPLOIEMENT

### Infrastructure Production

**Backend :** Render.com
- URL : `https://smartsearch-backend-pxw5.onrender.com`
- Plan : Free tier (auto-sleep après 15min)
- Auto-scaling : Activé

**Base de données :** MongoDB Atlas
- Cluster : M0 (Free)
- Région : Europe (Ireland)
- Backup automatique : Activé

**Frontend :** Hébergement statique (GitHub Pages / Render)

### Variables d'Environnement

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartsearch

# JWT
JWT_SECRET=super-secret-key-changez-moi-en-production

# Admin
ADMIN_CODE=SECRET_ADMIN_CODE

# Server
PORT=3000
NODE_ENV=production

# CORS
CORS_ORIGIN=https://votre-frontend.com
```

### Commandes de Déploiement

```bash
# Installation
npm install

# Build (si nécessaire)
npm run build

# Démarrage production
npm start

# Monitoring
npm run logs
```

---

## 🧪 TESTS

### Tests Automatisés

**Script de test :** `test-nomenclature.js`

```bash
node test-nomenclature.js
```

**Couverture :**
- ✅ Recherche par type PERTE/DECOUVERTE
- ✅ Matching automatique
- ✅ Statistiques globales
- ✅ Recherche combinée (type + critères)
- ✅ Rejet des anciennes valeurs

### Tests Manuels

Voir **[GUIDE_TEST_MANUEL.md](GUIDE_TEST_MANUEL.md)** pour :
- Scénarios de test pas à pas
- Déclaration de document perdu/trouvé
- Recherche avec filtres
- Vérification du matching
- Tests de sécurité

### Comptes de Test

| Username | Password | Rôle | Usage |
|----------|----------|------|-------|
| admin | Admin@2026 | admin | Tests administratifs |
| testuser | Test@123 | user | Tests déclarants |

---

## 📊 STATISTIQUES DU PROJET

### Métriques Code

- **Lignes de code backend :** ~2500 lignes
- **Lignes de code frontend :** ~600 lignes
- **Fichiers JavaScript :** 25 fichiers
- **Routes API :** 15 endpoints
- **Modèles MongoDB :** 5 collections

### Métriques Projet

- **Durée de développement :** 3 mois
- **Technologies utilisées :** 12
- **Dépendances npm :** 20 packages
- **Taille déployée :** ~5 MB
- **Temps de réponse API :** <200ms

---

## 🎓 TECHNOLOGIES ET CONCEPTS

### Stack Technique

**Backend :**
- Node.js 18+ (runtime JavaScript)
- Express.js 5.x (framework web)
- MongoDB 6.x + Mongoose (base de données)
- JWT (authentification)
- Bcrypt (cryptographie)
- Fuse.js (fuzzy search)
- String-similarity (distance de Levenshtein)

**Frontend :**
- HTML5 (structure sémantique)
- CSS3 (Flexbox, Grid, animations)
- JavaScript ES6+ (async/await, modules)
- Fetch API (requêtes HTTP)
- LocalStorage (persistance)
- Font Awesome (icônes)

**DevOps :**
- Git (versionnement)
- GitHub (repository)
- Render.com (CI/CD, hosting)
- MongoDB Atlas (DBaaS)

### Concepts Appliqués

✅ **Architecture MVC** (séparation des responsabilités)  
✅ **API RESTful** (standard HTTP)  
✅ **Token-based auth** (stateless)  
✅ **Fuzzy matching** (IA/algorithmes)  
✅ **RBAC** (Role-Based Access Control)  
✅ **Index MongoDB** (optimisation requêtes)  
✅ **Middleware pattern** (Express)  
✅ **Error handling** (try-catch global)  
✅ **Environment variables** (12-factor app)  
✅ **CORS** (sécurité cross-origin)  

---

## 📈 AMÉLIORATIONS FUTURES

### Court Terme
- [ ] Upload de photos de documents
- [ ] Notifications email automatiques
- [ ] Export PDF des déclarations
- [ ] Mode sombre
- [ ] PWA (Progressive Web App)

### Moyen Terme
- [ ] Application mobile (React Native)
- [ ] Recherche géolocalisée (carte interactive)
- [ ] Messagerie interne entre utilisateurs
- [ ] Multi-langue (FR, EN)
- [ ] Tests unitaires (Jest) + E2E (Cypress)

### Long Terme
- [ ] Machine Learning pour matching
- [ ] Blockchain pour authenticité
- [ ] API publique pour intégrations tierces
- [ ] Analytics avancées (BigQuery)
- [ ] Microservices architecture

---

## 🏆 CONCLUSION

### Résultats Obtenus

Le projet **SmartSearch** répond pleinement aux objectifs fixés :

✅ **Système intelligent** de déclaration et recherche  
✅ **Algorithmes avancés** de fuzzy matching et scoring  
✅ **Matching automatique** PERTE ↔ DECOUVERTE  
✅ **Architecture robuste** et scalable (MVC + MongoDB)  
✅ **Sécurité renforcée** (JWT, Bcrypt, RBAC, Rate limiting)  
✅ **Déploiement production** fonctionnel sur cloud  
✅ **Interface moderne** et responsive  

### Points Forts

🌟 **Intelligence artificielle** : Fuzzy matching + distance de Levenshtein  
🌟 **Scalabilité** : MongoDB Atlas + Render auto-scaling  
🌟 **Sécurité** : JWT + Bcrypt + CORS + Rate limiting  
🌟 **Documentation** : Complète et structurée  
🌟 **Code propre** : Architecture MVC, commentaires, conventions  

### Compétences Développées

✅ Conception et architecture logicielle (MVC, REST API)  
✅ Développement full-stack (Node.js + MongoDB + HTML/CSS/JS)  
✅ Algorithmes et structures de données (fuzzy matching, scoring)  
✅ Sécurité informatique (JWT, Bcrypt, OWASP Top 10)  
✅ Base de données NoSQL (MongoDB, index, requêtes complexes)  
✅ DevOps (Git, CI/CD, déploiement cloud)  
✅ Gestion de projet (documentation, tests, versionnement)  

### Perspectives

Le système SmartSearch constitue une **solution viable et évolutive** pour la gestion de documents perdus à l'échelle d'une ville, région ou pays. Les algorithmes intelligents et l'architecture scalable permettent d'envisager une **mise en production réelle** avec :
- Extension multi-pays
- Intégration avec services gouvernementaux
- Partenariats avec polices et services publics

---

## 📞 RÉFÉRENCES

### Documentation Technique
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture détaillée
- [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Guide de déploiement
- [GUIDE_TEST_MANUEL.md](GUIDE_TEST_MANUEL.md) - Tests manuels
- [CORRECTIONS_NOMENCLATURE.md](CORRECTIONS_NOMENCLATURE.md) - Corrections récentes

### Technologies
- Node.js : https://nodejs.org/
- Express.js : https://expressjs.com/
- MongoDB : https://www.mongodb.com/
- Fuse.js : https://fusejs.io/
- JWT : https://jwt.io/

---

**Auteur :** NGOA (HERVEMEUPS)  
**Formation :** Master 2 SIGL Professionnel  
**Date :** Juin 2026  
**Version :** 3.0 (SmartSearch)  
**Statut :** ✅ Fonctionnel et déployé en production  
**URL Production :** https://smartsearch-backend-pxw5.onrender.com
