# 📂 Structure du projet - Documents Perdus V3

## 🌲 Arborescence complète

```
Documents_perdus - V3/
│
├── 📁 backend/                    # Serveur API Node.js/Express
│   ├── 📄 server.js               # Point d'entrée API (278 lignes)
│   ├── 📄 package.json            # Dépendances npm
│   ├── 📄 package-lock.json       # Lock file npm
│   ├── 📄 .env                    # Variables d'environnement (secrets)
│   ├── 📄 .env.example            # Template de configuration
│   ├── 📄 .gitignore              # Fichiers à ignorer
│   ├── 📄 README.md               # Documentation API
│   ├── 📄 users.json              # Base de données utilisateurs
│   ├── 📄 documents.json          # Base de données documents
│   └── 📁 node_modules/           # Dépendances installées (ignoré par git)
│
├── 📁 frontend/                   # Application web client
│   ├── 📄 index.html              # Page d'accueil
│   ├── 📄 login.html              # Page de connexion
│   ├── 📄 register.html           # Page d'inscription
│   ├── 📄 declaration.html        # Formulaire de déclaration
│   ├── 📄 recherche.html          # Page de recherche
│   ├── 📄 script.js               # Logique JavaScript (323 lignes)
│   └── 📄 style.css               # Feuille de styles
│
├── 📁 .vscode/                    # Configuration VS Code
│   └── 📄 settings.json           # Paramètres de l'éditeur
│
├── 📄 README.md                   # Documentation principale
├── 📄 RAPPORT_PROJET.md           # Rapport technique complet
├── 📄 QUICKSTART.md               # Guide de démarrage rapide
├── 📄 TEST_GUIDE.md               # 20 scénarios de test
├── 📄 CHANGELOG.md                # Historique des modifications
├── 📄 STRUCTURE.md                # Ce fichier
└── 📄 .gitignore                  # Fichiers à ignorer par git
```

---

## 📊 Statistiques du projet

| Catégorie | Quantité |
|-----------|----------|
| **Fichiers JavaScript** | 2 (server.js, script.js) |
| **Fichiers HTML** | 5 pages |
| **Fichiers CSS** | 1 (style.css) |
| **Fichiers JSON** | 4 (package.json, users.json, documents.json, settings.json) |
| **Fichiers Markdown** | 6 documents |
| **Routes API** | 5 endpoints |
| **Dépendances npm** | 5 packages |
| **Lignes de code backend** | ~278 lignes |
| **Lignes de code frontend** | ~323 lignes |

---

## 🗂️ Détail des fichiers

### 📁 Backend

#### `server.js` (278 lignes)
**Rôle :** Point d'entrée du serveur API Express

**Contenu :**
- Configuration Express (CORS, JSON)
- Middleware d'authentification JWT
- 5 routes API (register, login, declaration, recherche, documents)
- Validation des entrées
- Gestion des erreurs
- Initialisation des fichiers JSON

**Technologies :**
- Express.js
- JWT (jsonwebtoken)
- bcrypt
- dotenv

---

#### `package.json`
**Rôle :** Configuration npm et dépendances

**Dépendances :**
```json
{
  "express": "^5.2.1",
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "cors": "^2.8.6",
  "dotenv": "^16.4.5"
}
```

**Scripts :**
- `npm start` → Lance le serveur

---

#### `.env`
**Rôle :** Variables d'environnement (SECRETS)

**Contenu :**
```env
JWT_SECRET=votre-secret-jwt-changez-moi
ADMIN_CODE=ADMIN2026
PORT=3000
```

⚠️ **NE JAMAIS COMMITER CE FICHIER**

---

#### `users.json`
**Rôle :** Base de données utilisateurs

**Structure :**
```json
{
  "id": 1,
  "username": "utilisateur",
  "password": "$2b$10$hash...",
  "role": "declarant"
}
```

**Champs :**
- `id` : Identifiant unique
- `username` : Nom d'utilisateur
- `password` : Mot de passe haché (bcrypt)
- `role` : "admin" ou "declarant"

---

#### `documents.json`
**Rôle :** Base de données documents

**Structure :**
```json
{
  "id": 1,
  "typeDeclaration": "perdu",
  "typeDocument": "CNI",
  "nom": "DUPONT Jean",
  "numero": "123456789",
  "lieu": "Yaoundé",
  "date": "2026-06-06",
  "description": "...",
  "declarantId": 3,
  "declarantUsername": "utilisateur",
  "dateDeclaration": "2026-06-06T10:00:00.000Z"
}
```

---

#### `README.md` (backend)
**Rôle :** Documentation complète de l'API

**Contenu :**
- Routes disponibles
- Exemples de requêtes
- Authentification JWT
- Codes d'erreur
- Guide d'utilisation

---

### 📁 Frontend

#### `index.html`
**Rôle :** Page d'accueil

**Contenu :**
- Menu principal
- Liens vers recherche et déclaration
- Affichage de l'utilisateur connecté
- Bouton de connexion

---

#### `login.html`
**Rôle :** Page de connexion

**Contenu :**
- Formulaire de connexion (username, password)
- Lien vers inscription
- Affichage des erreurs

---

#### `register.html`
**Rôle :** Page d'inscription

**Contenu :**
- Formulaire d'inscription
- Choix du rôle (Déclarant / Admin)
- Champ code admin (si admin choisi)
- Lien vers connexion

---

#### `declaration.html`
**Rôle :** Formulaire de déclaration

**Contenu :**
- Type de déclaration (Perdu / Trouvé)
- Type de document
- Nom du propriétaire
- Numéro du document
- Lieu
- Date
- Description

---

#### `recherche.html`
**Rôle :** Page de recherche

**Contenu :**
- Formulaire de recherche avec filtres :
  - Type de déclaration
  - Type de document
  - Nom
  - Numéro
  - Lieu
  - Date début / Date fin
- Zone d'affichage des résultats

---

#### `script.js` (323 lignes)
**Rôle :** Logique JavaScript de l'application

**Contenu :**
- Configuration API URL
- Gestion de l'authentification (login, register, logout)
- Vérification du token JWT
- Déclaration de documents (POST avec token)
- Recherche de documents (GET avec token)
- Affichage des résultats
- Gestion des erreurs (token expiré, etc.)
- Stockage dans localStorage

**Fonctions principales :**
- `checkAuth()` : Vérification de l'authentification
- `logout()` : Déconnexion
- `afficherResultats()` : Affichage des résultats de recherche

---

#### `style.css`
**Rôle :** Feuille de styles

**Contenu :**
- Styles de base (body, titres, formulaires)
- Styles de la page de connexion (.login-container, .login-box)
- Styles des boutons
- Styles des résultats de recherche (.result-card)
- Styles de l'info utilisateur (#userInfo)
- Responsive design (media queries)

---

### 📄 Documentation

#### `README.md` (racine)
**Rôle :** Documentation principale du projet

**Contenu :**
- Vue d'ensemble
- Installation rapide
- Structure du projet
- API endpoints
- Sécurité
- Comptes de test

---

#### `RAPPORT_PROJET.md`
**Rôle :** Rapport technique complet

**Contenu (56 sections) :**
- Architecture du projet
- Technologies utilisées
- Routes API détaillées
- Sécurité implémentée
- Structure des données
- Installation et démarrage
- Tests manuels
- Améliorations futures
- Statistiques

---

#### `QUICKSTART.md`
**Rôle :** Guide de démarrage ultra-rapide

**Contenu :**
- Installation en 2 minutes
- Test rapide en 1 minute
- Comptes de test
- Dépannage

---

#### `TEST_GUIDE.md`
**Rôle :** Guide de test complet

**Contenu :**
- 20 scénarios de test détaillés
- Tests positifs et négatifs
- Tests de sécurité
- Tests API avec curl
- Checklist finale

---

#### `CHANGELOG.md`
**Rôle :** Historique des modifications

**Contenu :**
- Nouvelles fonctionnalités V3
- Bugs corrigés
- Fichiers supprimés
- Migration Python → Node.js
- Breaking changes

---

#### `STRUCTURE.md`
**Rôle :** Ce fichier

**Contenu :**
- Arborescence du projet
- Statistiques
- Détail de chaque fichier

---

## 🔐 Fichiers sensibles (.gitignore)

```
backend/.env
backend/users.json
backend/documents.json
backend/node_modules/
*.log
```

**À ne JAMAIS commiter :**
- `.env` (secrets)
- `users.json` (données personnelles)
- `documents.json` (données utilisateurs)
- `node_modules/` (dépendances)

---

## 🎯 Points d'entrée

| Type | Fichier | URL |
|------|---------|-----|
| **Backend** | `backend/server.js` | `http://localhost:3000` |
| **Frontend** | `frontend/index.html` | Ouvrir dans navigateur |
| **API Docs** | `backend/README.md` | - |
| **Quick Start** | `QUICKSTART.md` | - |

---

## 📦 Dépendances externes

### Backend (npm)
```
express@5.2.1          Framework web
bcrypt@5.1.1          Hachage des mots de passe
jsonwebtoken@9.0.2    Génération de tokens JWT
cors@2.8.6            Support CORS
dotenv@16.4.5         Variables d'environnement
```

### Frontend
**Aucune dépendance externe** (Vanilla JS)

---

## 🔄 Flux de données

```
Frontend (HTML/JS)
    ↓
    ↓ HTTP Request (Fetch API)
    ↓ Headers: Authorization: Bearer <token>
    ↓
Backend (Express/Node.js)
    ↓
    ↓ Middleware d'authentification (JWT)
    ↓
    ↓ Validation des entrées
    ↓
Données (users.json, documents.json)
    ↓
    ↓ Lecture/Écriture
    ↓
Backend (Express)
    ↓
    ↓ HTTP Response (JSON)
    ↓
Frontend (Affichage)
```

---

## 📏 Taille des fichiers

| Fichier | Taille approximative |
|---------|----------------------|
| `backend/server.js` | 9.4 KB |
| `frontend/script.js` | 10.5 KB |
| `frontend/style.css` | 3.5 KB |
| `backend/package.json` | 0.4 KB |
| `backend/users.json` | 0.5 KB |
| `backend/documents.json` | 1.2 KB |
| **Total code source** | ~25 KB |

---

## 🏗️ Architecture technique

```
┌─────────────────────────────────────────────────┐
│                   FRONTEND                       │
│  HTML5 + CSS3 + JavaScript Vanilla              │
│  - index.html (Accueil)                         │
│  - login.html (Connexion)                       │
│  - register.html (Inscription)                  │
│  - declaration.html (Déclaration)               │
│  - recherche.html (Recherche)                   │
│  - script.js (Logique)                          │
└──────────────────┬──────────────────────────────┘
                   │
                   │ HTTP/JSON
                   │ JWT Token
                   │
┌──────────────────▼──────────────────────────────┐
│                  API REST                        │
│  Node.js + Express.js                           │
│  - POST /register                                │
│  - POST /login                                   │
│  - POST /declaration 🔒                         │
│  - GET  /recherche 🔒                           │
│  - GET  /documents 🔒👑                         │
└──────────────────┬──────────────────────────────┘
                   │
                   │ Middleware
                   │ - JWT Verification
                   │ - CORS
                   │ - Validation
                   │
┌──────────────────▼──────────────────────────────┐
│              STOCKAGE DONNÉES                    │
│  JSON Files                                     │
│  - users.json (Utilisateurs)                    │
│  - documents.json (Documents)                   │
└─────────────────────────────────────────────────┘

🔒 = Authentification JWT requise
👑 = Admin uniquement
```

---

## 📝 Convention de nommage

### Fichiers
- **HTML** : `minuscules.html`
- **JavaScript** : `camelCase.js`
- **CSS** : `minuscules.css`
- **JSON** : `minuscules.json`
- **Markdown** : `MAJUSCULES.md` (docs) ou `minuscules.md` (code)

### Variables JavaScript
- **Constantes** : `SCREAMING_SNAKE_CASE`
- **Variables** : `camelCase`
- **Fonctions** : `camelCase`

### Routes API
- **Format** : `/minuscules`
- **Exemples** : `/login`, `/declaration`, `/recherche`

---

## 🎨 Design Pattern

**Architecture :** MVC-like (Model-View-Controller)

```
Model      → users.json, documents.json
View       → HTML files (index, login, register, etc.)
Controller → server.js (routes + logic) + script.js (frontend logic)
```

---

## 🔗 Relations entre fichiers

```
index.html
    → script.js → API (server.js)
    → style.css

login.html
    → script.js → POST /login
    → style.css

register.html
    → script.js → POST /register
    → style.css

declaration.html
    → script.js → POST /declaration 🔒
    → style.css

recherche.html
    → script.js → GET /recherche 🔒
    → style.css

server.js
    → users.json (lecture/écriture)
    → documents.json (lecture/écriture)
    → .env (configuration)
```

---

## ✅ Checklist des fichiers

### Fichiers backend
- [x] `server.js` - Serveur API
- [x] `package.json` - Config npm
- [x] `.env` - Variables d'environnement
- [x] `.env.example` - Template config
- [x] `.gitignore` - Protection
- [x] `README.md` - Documentation API
- [x] `users.json` - Base utilisateurs
- [x] `documents.json` - Base documents

### Fichiers frontend
- [x] `index.html` - Accueil
- [x] `login.html` - Connexion
- [x] `register.html` - Inscription
- [x] `declaration.html` - Déclaration
- [x] `recherche.html` - Recherche
- [x] `script.js` - Logique
- [x] `style.css` - Styles

### Documentation
- [x] `README.md` - Documentation principale
- [x] `RAPPORT_PROJET.md` - Rapport complet
- [x] `QUICKSTART.md` - Démarrage rapide
- [x] `TEST_GUIDE.md` - Guide de test
- [x] `CHANGELOG.md` - Historique
- [x] `STRUCTURE.md` - Ce fichier

### Configuration
- [x] `.gitignore` - Racine
- [x] `.vscode/settings.json` - VS Code

---

**Total : 24 fichiers principaux (hors node_modules)**

---

## 🎯 Navigation dans le projet

**Pour démarrer rapidement :** [QUICKSTART.md](QUICKSTART.md)  
**Pour comprendre l'architecture :** [RAPPORT_PROJET.md](RAPPORT_PROJET.md)  
**Pour tester l'application :** [TEST_GUIDE.md](TEST_GUIDE.md)  
**Pour l'API :** [backend/README.md](backend/README.md)  
**Pour les modifications :** [CHANGELOG.md](CHANGELOG.md)

---

**Auteur :** HERVEMEUPS  
**Date :** 6 juin 2026  
**Version :** 3.0.0
