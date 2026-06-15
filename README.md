# 📁 SmartSearch - Système Intelligent de Gestion de Documents Perdus

> **Projet de Soutenance Master 2 SIGL Professionnel**  
> **Thème :** ANALYSE, CONCEPTION ET IMPLÉMENTATION D'UN SYSTÈME INTELLIGENT DÉDIÉ À LA DÉCLARATION ET À LA RECHERCHE DE DOCUMENTS PERDUS  
> **Auteur :** NGOA (HERVEMEUPS) | **Date :** Juin 2026

## 🎯 Description
Plateforme web intelligente permettant de **déclarer** et **rechercher** des documents perdus ou trouvés (CNI, passeports, permis, etc.) avec un système de **matching automatique** basé sur des algorithmes de fuzzy matching et scoring avancé.

## 📂 Structure du Projet

```
Documents_perdus - V3/
├── backend/                    # API Node.js + MongoDB
│   ├── src/
│   │   ├── models/            # Modèles Mongoose
│   │   ├── controllers/       # Logique métier
│   │   ├── middlewares/       # Auth, validation, etc.
│   │   └── config/            # Configuration
│   └── intelligent-search.js  # Algorithme de recherche floue
│
├── frontend/                   # Interface utilisateur
│   ├── index.html             # Accueil
│   ├── declaration.html       # Déclarer un document
│   ├── recherche.html         # Rechercher
│   ├── dashboard.html         # Admin
│   ├── script.js              # Logique frontend
│   └── style.css              # Styles
│
├── UML/                        # Diagrammes
├── scripts/                    # Scripts utilitaires
│
└── Documentation/
    ├── ARCHITECTURE.md         # Architecture technique
    ├── DEPLOYMENT_GUIDE.md     # Guide de déploiement
    ├── STRUCTURE.md            # Structure détaillée
    ├── CHANGELOG.md            # Historique des changements
    ├── COMMENCEZ_ICI.md        # Point de départ
    ├── GUIDE_CREER_ADMIN.md    # Créer un admin
    ├── GUIDE_DEPLOIEMENT_RENDER.md
    ├── GUIDE_RAPIDE_MONGODB_RENDER.md
    ├── INSTALL_MONGODB_LOCAL.md
    └── RAPPORT_PROJET.md       # Rapport académique
```

## 🚀 Démarrage Rapide

### Prérequis
- Node.js 18+
- MongoDB Atlas (ou local)
- Compte Render.com (pour déploiement)

### Installation Locale

1. **Cloner le projet**
```bash
git clone <repo-url>
cd Documents_perdus\ -\ V3
```

2. **Configuration Backend**
```bash
cd backend
npm install
```

Créer `.env` :
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartsearch
JWT_SECRET=votre_secret_jwt
PORT=3000
NODE_ENV=production
```

3. **Démarrer le serveur**
```bash
npm start
```

4. **Ouvrir le frontend**
```bash
# Ouvrir frontend/index.html dans le navigateur
# Ou utiliser un serveur local
cd ../frontend
python -m http.server 8000
```

## 📖 Documentation Principale

### Démarrage
- 📘 **[COMMENCEZ_ICI.md](COMMENCEZ_ICI.md)** - Point d'entrée principal
- 🏗️ **[ARCHITECTURE.md](ARCHITECTURE.md)** - Architecture technique
- 📂 **[STRUCTURE.md](STRUCTURE.md)** - Structure détaillée

### Déploiement
- 🚀 **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Guide complet de déploiement
- 🌐 **[GUIDE_DEPLOIEMENT_RENDER.md](GUIDE_DEPLOIEMENT_RENDER.md)** - Déploiement sur Render
- 💾 **[GUIDE_RAPIDE_MONGODB_RENDER.md](GUIDE_RAPIDE_MONGODB_RENDER.md)** - MongoDB Atlas

### Configuration
- 🔐 **[GUIDE_CREER_ADMIN.md](GUIDE_CREER_ADMIN.md)** - Créer un compte admin
- 🗄️ **[INSTALL_MONGODB_LOCAL.md](INSTALL_MONGODB_LOCAL.md)** - MongoDB en local

### Corrections Récentes
- 📝 **[CORRECTIONS_NOMENCLATURE.md](CORRECTIONS_NOMENCLATURE.md)** - Fix PERTE/DECOUVERTE
- 📊 **[RESUME_CORRECTIONS.md](RESUME_CORRECTIONS.md)** - Vue d'ensemble
- 🧪 **[GUIDE_TEST_MANUEL.md](GUIDE_TEST_MANUEL.md)** - Tests manuels

### Académique
- 📄 **[RAPPORT_PROJET.md](RAPPORT_PROJET.md)** - Rapport de projet M2 SIGL
- 📜 **[CHANGELOG.md](CHANGELOG.md)** - Historique des versions

## 🔑 Fonctionnalités Principales

### Pour les Utilisateurs
- ✅ **Déclaration** : Déclarer un document perdu ou trouvé
- 🔍 **Recherche intelligente** : Recherche floue avec fuzzy matching
- 📊 **Matching automatique** : Détection des correspondances PERTE ↔ DECOUVERTE
- 📧 **Notifications** : Alertes en cas de correspondance

### Pour les Administrateurs
- 📊 **Dashboard** : Statistiques en temps réel
- 👥 **Gestion utilisateurs** : CRUD complet
- 🔍 **Gestion déclarations** : Validation et suppression
- 📈 **Analytics** : Graphiques et tendances

## 🛠️ Technologies Utilisées

### Backend
- **Node.js** + Express.js
- **MongoDB** (Mongoose)
- **JWT** pour l'authentification
- **Fuse.js** pour la recherche floue
- **Bcrypt** pour le hashing des mots de passe

### Frontend
- **HTML5 / CSS3 / JavaScript** vanilla
- **Font Awesome** pour les icônes
- **Chart.js** pour les graphiques (dashboard)

### Déploiement
- **Render.com** pour l'hébergement
- **MongoDB Atlas** pour la base de données
- **GitHub** pour le versionnement

## 📊 Nomenclature Standard

### Types de Déclaration
| Interface | API | MongoDB |
|-----------|-----|---------|
| 📍 Perdu | `PERTE` | `type: "PERTE"` |
| ✅ Trouvé | `DECOUVERTE` | `type: "DECOUVERTE"` |

### Types de Documents
- **CNI** - Carte Nationale d'Identité
- **PASSEPORT** - Passeport
- **PERMIS** - Permis de Conduire
- **CARTE_SCOLAIRE** - Carte Scolaire
- **DIPLOME** - Diplôme
- **ACTE_NAISSANCE** - Acte de Naissance
- **AUTRE** - Autre document

## 🧪 Tests

### Test Automatique
```bash
node test-nomenclature.js
```

### Test Manuel
Suivre le **[GUIDE_TEST_MANUEL.md](GUIDE_TEST_MANUEL.md)**

### Créer un Admin
```bash
node create-admin-production.js
```

## 🌐 URLs de Production

- **Backend API** : `https://smartsearch-backend-pxw5.onrender.com`
- **Frontend** : Hébergé sur GitHub Pages ou serveur statique
- **MongoDB** : MongoDB Atlas

## 📝 Scripts Utiles

```bash
# Backend
cd backend
npm start              # Démarrer en production
npm run dev            # Démarrer en développement

# Créer un admin
node create-admin-production.js

# Tester la nomenclature
node test-nomenclature.js
```

## 🔒 Sécurité

- ✅ Authentification JWT
- ✅ Hashing des mots de passe (Bcrypt)
- ✅ Validation des entrées
- ✅ Rate limiting
- ✅ CORS configuré
- ✅ Protection CSRF

## 📞 Support & Contact

### Auteur
**NGOA** - M2 SIGL

### Issues
Pour tout bug ou suggestion : créer une issue sur GitHub

## 📅 Versions

- **v3.0** (2026-06-15) - Correction nomenclature PERTE/DECOUVERTE
- **v2.0** (2026-06-11) - Refonte complète avec MongoDB
- **v1.0** (2026-03-28) - Version initiale

## 📜 Licence

Projet académique - M2 SIGL

---

✨ **Dernière mise à jour** : 15 juin 2026
