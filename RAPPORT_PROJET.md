# 📋 RAPPORT COMPLET - Système de Gestion de Documents Perdus V3

**Date:** 6 juin 2026  
**Projet:** Documents perdus - V3  
**Auteur:** HERVEMEUPS  
**Technologies:** Node.js + Express + JWT + bcrypt | HTML5 + CSS3 + JavaScript Vanilla

---

## 📊 RÉSUMÉ EXÉCUTIF

Application web full-stack sécurisée permettant de **déclarer** et **rechercher** des documents perdus ou trouvés avec authentification JWT, hachage des mots de passe et système de scoring intelligent.

### 🎯 Objectifs atteints
- ✅ Système d'authentification sécurisé (JWT + bcrypt)
- ✅ Déclaration de documents perdus/trouvés
- ✅ Recherche intelligente avec filtres avancés et scoring
- ✅ Gestion des rôles (Admin / Déclarant)
- ✅ API RESTful complète et documentée
- ✅ Interface utilisateur responsive

---

## 🏗️ ARCHITECTURE DU PROJET

```
Documents_perdus - V3/
│
├── backend/                          # Serveur API Node.js
│   ├── server.js                     # Point d'entrée API (9.4 KB)
│   ├── package.json                  # Dépendances npm
│   ├── .env                          # Variables d'environnement (secrets)
│   ├── .env.example                  # Template de configuration
│   ├── .gitignore                    # Fichiers à ignorer par git
│   ├── README.md                     # Documentation API
│   ├── users.json                    # Base de données utilisateurs
│   └── documents.json                # Base de données documents
│
├── frontend/                         # Application web client
│   ├── index.html                    # Page d'accueil
│   ├── login.html                    # Page de connexion
│   ├── register.html                 # Page d'inscription
│   ├── declaration.html              # Formulaire de déclaration
│   ├── recherche.html                # Page de recherche
│   ├── script.js                     # Logique JavaScript (10.5 KB)
│   └── style.css                     # Feuille de styles (2 KB)
│
└── RAPPORT_PROJET.md                 # Ce document
```

---

## 🔐 SÉCURITÉ IMPLÉMENTÉE

### 1. Authentification JWT
- **Token signé** avec secret JWT (configurable dans `.env`)
- **Expiration automatique** après 24 heures
- **Stockage sécurisé** dans localStorage côté client
- **Vérification** sur toutes les routes protégées

### 2. Hachage des mots de passe
- **Algorithme:** bcrypt avec 10 rounds de salage
- **Pas de mots de passe en clair** dans la base de données
- **Comparaison sécurisée** lors de l'authentification

### 3. Contrôle d'accès
- **Rôles:** Admin et Déclarant
- **Code administrateur** requis pour créer un compte admin
- **Route /documents** réservée aux admins uniquement

### 4. Validation des entrées
- **Vérification des champs requis** sur toutes les routes
- **Validation de la longueur** (username min 3 chars, password min 6 chars)
- **Validation des rôles** (seulement "admin" ou "declarant")
- **Validation des dates** pour les recherches

### 5. Gestion des erreurs
- **Try-catch** sur toutes les routes API
- **Messages d'erreur appropriés** (pas de leak d'informations sensibles)
- **Codes HTTP corrects** (401, 403, 400, 500)
- **Initialisation automatique** des fichiers JSON s'ils manquent

### 6. Protection des secrets
- **Variables d'environnement** pour JWT_SECRET et ADMIN_CODE
- **Fichier .gitignore** empêche le commit de .env et des données sensibles

---

## 🔌 API ENDPOINTS

### Authentication

#### `POST /register`
**Description:** Inscription d'un nouvel utilisateur

**Body:**
```json
{
  "username": "utilisateur",
  "password": "motdepasse123",
  "role": "declarant",
  "adminCode": "ADMIN2026"  // Uniquement si role="admin"
}
```

**Validation:**
- `username` : min 3 caractères
- `password` : min 6 caractères
- `role` : "admin" ou "declarant"
- `adminCode` : requis uniquement pour rôle admin

**Réponse (201):**
```json
{
  "message": "Compte créé avec succès"
}
```

---

#### `POST /login`
**Description:** Connexion utilisateur

**Body:**
```json
{
  "username": "utilisateur",
  "password": "motdepasse123"
}
```

**Réponse (200):**
```json
{
  "message": "Connexion réussie",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "declarant",
  "username": "utilisateur"
}
```

---

### Documents (Routes protégées 🔒)

#### `POST /declaration`
**Description:** Déclarer un document perdu ou trouvé

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "typeDeclaration": "perdu",
  "typeDocument": "CNI",
  "nom": "DUPONT Jean",
  "numero": "123456789",
  "lieu": "Yaoundé",
  "date": "2026-06-05",
  "description": "Carte d'identité nationale perdue au marché central"
}
```

**Champs requis:** typeDeclaration, typeDocument, nom, lieu, date

**Réponse (200):**
```json
{
  "message": "Déclaration enregistrée",
  "document": {
    "id": 6,
    "typeDeclaration": "perdu",
    "typeDocument": "CNI",
    "nom": "DUPONT Jean",
    "numero": "123456789",
    "lieu": "Yaoundé",
    "date": "2026-06-05",
    "description": "Carte d'identité nationale perdue au marché central",
    "declarantId": 3,
    "declarantUsername": "utilisateur",
    "dateDeclaration": "2026-06-06T10:30:00.000Z"
  }
}
```

---

#### `GET /recherche`
**Description:** Rechercher des documents avec filtres et scoring intelligent

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `typeDeclaration` : "perdu" ou "trouve"
- `typeDocument` : Type du document (ex: CNI, Passeport)
- `nom` : Nom du propriétaire (recherche partielle)
- `numero` : Numéro exact du document
- `lieu` : Lieu (recherche partielle)
- `dateDebut` : Date de début (format: YYYY-MM-DD)
- `dateFin` : Date de fin (format: YYYY-MM-DD)

**Exemple:**
```
GET /recherche?nom=DUPONT&typeDocument=CNI&lieu=Yaoundé&dateDebut=2026-01-01
```

**Système de scoring:**
- Numéro exact : +5 points
- Nom contient : +4 points
- Type exact : +3 points
- Seuil minimum : 3 points

**Réponse (200):**
```json
[
  {
    "id": 6,
    "typeDeclaration": "perdu",
    "typeDocument": "CNI",
    "nom": "DUPONT Jean",
    "numero": "123456789",
    "lieu": "Yaoundé",
    "date": "2026-06-05",
    "description": "...",
    "score": 12
  }
]
```

---

#### `GET /documents` (Admin uniquement 👑)
**Description:** Récupérer tous les documents (accès admin uniquement)

**Headers:**
```
Authorization: Bearer <token>
```

**Réponse (200):**
```json
[
  { "id": 1, "typeDocument": "CNI", ... },
  { "id": 2, "typeDocument": "Passeport", ... }
]
```

**Erreur si non-admin (403):**
```json
{
  "message": "Accès réservé aux administrateurs"
}
```

---

## 🎨 INTERFACE UTILISATEUR

### Pages principales

| Page | Fichier | Description |
|------|---------|-------------|
| Accueil | `index.html` | Menu principal avec liens vers recherche et déclaration |
| Connexion | `login.html` | Formulaire de connexion |
| Inscription | `register.html` | Formulaire d'inscription avec choix de rôle |
| Déclaration | `declaration.html` | Formulaire pour déclarer un document perdu/trouvé |
| Recherche | `recherche.html` | Formulaire de recherche avec filtres avancés |

### Fonctionnalités frontend

1. **Gestion de session**
   - Stockage du token JWT dans localStorage
   - Affichage du nom d'utilisateur connecté
   - Bouton de déconnexion

2. **Vérification d'authentification**
   - Redirection automatique vers login si non connecté
   - Vérification du token avant chaque requête API
   - Détection d'expiration du token (redirection vers login)

3. **Interface utilisateur**
   - Design responsive et moderne
   - Messages d'erreur clairs
   - Validation côté client (champs requis)
   - Affichage des résultats de recherche avec scoring

---

## 💾 STRUCTURE DES DONNÉES

### Utilisateur (users.json)
```json
{
  "id": 1,
  "username": "utilisateur",
  "password": "$2b$10$hashbcrypt...",
  "role": "declarant"
}
```

### Document (documents.json)
```json
{
  "id": 1,
  "typeDeclaration": "perdu",
  "typeDocument": "CNI",
  "nom": "DUPONT Jean",
  "numero": "123456789",
  "lieu": "Yaoundé",
  "date": "2026-06-05",
  "description": "Description détaillée",
  "declarantId": 3,
  "declarantUsername": "utilisateur",
  "dateDeclaration": "2026-06-06T10:30:00.000Z"
}
```

---

## 📦 DÉPENDANCES

### Backend (package.json)
```json
{
  "dependencies": {
    "express": "^5.2.1",        // Framework web
    "bcrypt": "^5.1.1",         // Hachage des mots de passe
    "jsonwebtoken": "^9.0.2",   // Génération de tokens JWT
    "cors": "^2.8.6",           // Support CORS
    "dotenv": "^16.4.5"         // Variables d'environnement
  }
}
```

### Frontend
- **Aucune dépendance externe**
- JavaScript Vanilla (pas de framework)
- Fetch API pour les appels HTTP
- LocalStorage pour la session

---

## 🚀 INSTALLATION ET DÉMARRAGE

### Prérequis
- Node.js v16+ et npm installés
- Git (optionnel)

### Installation

1. **Cloner le projet**
```bash
cd "c:\Users\COMPUTER CARE\Documents\NGOA\M2 SIGL\Projet\Documents_perdus - V3"
```

2. **Installer les dépendances backend**
```bash
cd backend
npm install
```

3. **Configuration**
   - Ouvrir `backend/.env`
   - Modifier les valeurs :
     - `JWT_SECRET` : Choisir une chaîne aléatoire complexe
     - `ADMIN_CODE` : Définir le code admin
     - `PORT` : Port du serveur (défaut: 3000)

### Démarrage

1. **Lancer le serveur backend**
```bash
cd backend
npm start
```
Serveur accessible sur `http://localhost:3000`

2. **Ouvrir le frontend**
   - Ouvrir `frontend/index.html` dans un navigateur
   - Ou utiliser un serveur local (ex: Live Server de VS Code)

---

## 🧪 TESTS MANUELS

### Test 1: Inscription et connexion

1. Ouvrir `frontend/register.html`
2. Créer un compte déclarant :
   - Username: test_user
   - Password: test123
   - Role: Déclarant
3. Se connecter sur `login.html`
4. Vérifier la redirection vers `index.html`
5. Vérifier l'affichage du nom d'utilisateur en haut à droite

### Test 2: Déclaration d'un document

1. Connecté, aller sur `declaration.html`
2. Remplir le formulaire :
   - Type: Perdu
   - Type doc: CNI
   - Nom: TEST
   - Lieu: Yaoundé
   - Date: 2026-06-06
3. Soumettre
4. Vérifier le message de succès

### Test 3: Recherche

1. Aller sur `recherche.html`
2. Entrer "TEST" dans le champ Nom
3. Rechercher
4. Vérifier que le document déclaré apparaît avec un score

### Test 4: Expiration du token

1. Connecté, ouvrir la console navigateur
2. Exécuter: `localStorage.setItem("token", "faux_token")`
3. Essayer de déclarer un document
4. Vérifier la redirection vers login avec message d'expiration

### Test 5: Admin

1. Créer un compte admin avec le code admin
2. Se connecter
3. Tester l'accès à `GET /documents` via l'API

---

## 📈 AMÉLIORATIONS FUTURES

### Sécurité
- [ ] Limitation du nombre de tentatives de connexion (rate limiting)
- [ ] Refresh tokens pour éviter les reconnexions fréquentes
- [ ] HTTPS obligatoire en production
- [ ] Validation avancée des entrées (XSS, injection)
- [ ] Logs d'audit des actions sensibles

### Fonctionnalités
- [ ] Notifications par email lors de correspondances
- [ ] Upload de photos de documents
- [ ] Système de messagerie entre déclarants
- [ ] Historique des déclarations par utilisateur
- [ ] Tableau de bord admin avec statistiques
- [ ] Export PDF des déclarations

### Technique
- [ ] Migration vers une vraie base de données (PostgreSQL/MongoDB)
- [ ] Tests unitaires et d'intégration (Jest, Mocha)
- [ ] CI/CD avec GitHub Actions
- [ ] Containerisation avec Docker
- [ ] API versioning (v1, v2)
- [ ] Documentation API avec Swagger

### UX/UI
- [ ] Design responsive mobile amélioré
- [ ] Mode sombre
- [ ] Filtres de recherche sauvegardés
- [ ] Recherche géolocalisée
- [ ] Carte interactive des lieux de perte

---

## 🐛 PROBLÈMES CONNUS

### Résolu ✅
1. ~~Mots de passe en clair~~ → Hachage bcrypt implémenté
2. ~~Pas d'authentification sur les routes~~ → JWT ajouté
3. ~~Code admin en dur~~ → Variables d'environnement
4. ~~Seuil de score trop élevé~~ → Abaissé à 3
5. ~~Génération d'ID utilisateur cassée~~ → `Math.max(id) + 1`
6. ~~Pas de gestion d'erreurs~~ → Try-catch partout

### En cours / À surveiller
- Stockage JSON (non adapté pour production à grande échelle)
- Pas de pagination sur la recherche (peut ralentir avec beaucoup de documents)
- LocalStorage pour le token (vulnérable au XSS si injection de script)

---

## 📚 FICHIERS IMPORTANTS

| Fichier | Rôle | Lignes |
|---------|------|--------|
| `backend/server.js` | API complète | 278 |
| `frontend/script.js` | Logique frontend | 323 |
| `backend/README.md` | Documentation API | - |
| `backend/.env` | Configuration secrète | 3 |
| `backend/users.json` | Base utilisateurs | 4 users |
| `backend/documents.json` | Base documents | 5 docs |

---

## 🔑 COMPTES DE TEST

### Utilisateurs existants (users.json)

| Username | Password | Rôle | ID |
|----------|----------|------|-----|
| admin | admin123 | admin | 1 |
| declarant1 | 1234 | declarant | 2 |
| hervemeups | abc12 | declarant | 3 |
| MEUPIE | Adm12 | admin | 4 |

⚠️ **IMPORTANT:** Ces comptes sont des exemples de test. En production, supprimer ces comptes et créer de nouveaux avec des mots de passe forts.

---

## 🌍 CONFIGURATION ENVIRONNEMENT

### Fichier .env (backend/)
```env
JWT_SECRET=votre-secret-jwt-super-securise-changez-moi-123456
ADMIN_CODE=ADMIN2026
PORT=3000
```

### Variables d'environnement

| Variable | Description | Valeur par défaut |
|----------|-------------|-------------------|
| `JWT_SECRET` | Secret pour signer les tokens JWT | `votre-secret-jwt-changez-moi` |
| `ADMIN_CODE` | Code pour créer un compte admin | `ADMIN2026` |
| `PORT` | Port du serveur Express | `3000` |

---

## 📊 STATISTIQUES DU PROJET

- **Lignes de code backend:** ~278 lignes (server.js)
- **Lignes de code frontend:** ~323 lignes (script.js)
- **Fichiers HTML:** 5 pages
- **Taille backend:** 9.4 KB (server.js)
- **Taille frontend:** 10.5 KB (script.js)
- **Dépendances npm:** 5 packages
- **Routes API:** 5 endpoints
- **Temps de développement:** Migration Python → Node.js
- **État Git:** 1 commit initial, fichiers en staging

---

## 🎓 TECHNOLOGIES ET CONCEPTS UTILISÉS

### Backend
- **Node.js** : Environnement d'exécution JavaScript
- **Express.js** : Framework web minimaliste
- **JWT** : Authentification stateless
- **bcrypt** : Hachage cryptographique
- **CORS** : Cross-Origin Resource Sharing
- **dotenv** : Gestion des variables d'environnement

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Styling responsive
- **JavaScript ES6+** : Programmation moderne
- **Fetch API** : Requêtes HTTP asynchrones
- **LocalStorage** : Persistance côté client

### Architecture
- **RESTful API** : Endpoints HTTP standard
- **MVC (Model-View-Controller)** : Séparation des responsabilités
- **JSON** : Format de données
- **Token-based authentication** : Sécurité stateless

### Bonnes pratiques
- **Separation of concerns** : Backend/Frontend séparés
- **Environment variables** : Configuration externalisée
- **Error handling** : Gestion cohérente des erreurs
- **Input validation** : Sécurité des données
- **Code comments** : Documentation inline

---

## 📞 SUPPORT ET DOCUMENTATION

### Documentation API
Voir `backend/README.md` pour :
- Liste complète des routes
- Exemples de requêtes
- Codes d'erreur
- Guide d'utilisation des tokens

### Structure de réponse d'erreur
```json
{
  "message": "Description de l'erreur"
}
```

### Codes HTTP utilisés
- `200` : Succès
- `201` : Ressource créée
- `400` : Requête invalide
- `401` : Non authentifié
- `403` : Accès interdit
- `500` : Erreur serveur

---

## ✅ CHECKLIST DE SÉCURITÉ

- [x] Mots de passe hachés (bcrypt)
- [x] Tokens JWT signés et expirables
- [x] Variables d'environnement pour les secrets
- [x] Validation des entrées utilisateur
- [x] Gestion des erreurs sans leak d'informations
- [x] CORS configuré
- [x] Contrôle d'accès par rôle
- [x] .gitignore pour fichiers sensibles
- [ ] HTTPS (à configurer en production)
- [ ] Rate limiting (à ajouter)
- [ ] Refresh tokens (à ajouter)

---

## 📝 NOTES DE MIGRATION

### Ancien système (V2)
- **Backend:** Python + Flask
- **BDD:** SQLite (database.db)
- **Fichiers:** app.py, requirements.txt

### Nouveau système (V3)
- **Backend:** Node.js + Express
- **BDD:** JSON files (users.json, documents.json)
- **Fichiers:** server.js, package.json
- **Améliorations:** JWT, bcrypt, meilleure architecture

### Fichiers supprimés
- `backend/app.py`
- `backend/database.db`
- `backend/requirements.txt`
- `frontend/declarer.html` → `declaration.html`
- `frontend/rechercher.html` → `recherche.html`

---

## 🏆 CONCLUSION

Le projet **Documents Perdus V3** est une application web moderne et sécurisée qui répond aux besoins de gestion de documents perdus/trouvés. 

### Points forts
✅ Architecture propre et maintenable  
✅ Sécurité robuste (JWT + bcrypt)  
✅ API RESTful bien documentée  
✅ Interface utilisateur intuitive  
✅ Code lisible et commenté  

### Prêt pour
✅ Démonstration / Présentation  
✅ Tests en environnement local  
✅ Prototype fonctionnel  

### Nécessite avant production
⚠️ Migration vers base de données réelle  
⚠️ HTTPS et certificats SSL  
⚠️ Tests automatisés  
⚠️ Monitoring et logs  
⚠️ Scalabilité (load balancing, caching)  

---

**Auteur:** HERVEMEUPS  
**Date:** 6 juin 2026  
**Version:** 3.0  
**Statut:** ✅ Fonctionnel et sécurisé
