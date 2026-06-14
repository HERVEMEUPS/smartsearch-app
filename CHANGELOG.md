# 📝 Changelog - Documents Perdus V3

## Version 3.0.0 - 6 juin 2026

### 🎉 Migration complète Python → Node.js

---

## ✨ Nouvelles fonctionnalités

### Sécurité
- ✅ **Authentification JWT** avec expiration 24h
- ✅ **Hachage des mots de passe** avec bcrypt (10 rounds)
- ✅ **Variables d'environnement** (.env) pour les secrets
- ✅ **Middleware d'authentification** sur toutes les routes sensibles
- ✅ **Validation des entrées** côté serveur
- ✅ **Gestion des rôles** (Admin / Déclarant)
- ✅ **Code administrateur** pour créer des comptes admin
- ✅ **Protection CORS** configurée

### Backend
- ✅ **Nouveau serveur Express.js** (remplacement Flask)
- ✅ **API RESTful** complète avec 5 endpoints
- ✅ **Gestion d'erreurs** robuste avec try-catch partout
- ✅ **Initialisation automatique** des fichiers JSON
- ✅ **Logging des erreurs** dans la console
- ✅ **Génération d'ID sécurisée** pour les utilisateurs
- ✅ **Métadonnées enrichies** (declarantId, declarantUsername, dateDeclaration)

### Frontend
- ✅ **Nouvelle page de connexion** (login.html)
- ✅ **Nouvelle page d'inscription** (register.html) avec choix de rôle
- ✅ **Affichage de l'utilisateur connecté** en haut des pages
- ✅ **Bouton de déconnexion** fonctionnel
- ✅ **Gestion du token JWT** dans localStorage
- ✅ **Détection d'expiration** du token avec redirection
- ✅ **Vérification d'authentification** avant chaque requête
- ✅ **Messages d'erreur améliorés**
- ✅ **Styles CSS modernisés** pour les résultats

### Recherche
- ✅ **Seuil de score abaissé** de 4 à 3 (plus de résultats pertinents)
- ✅ **Validation des dates** améliorée
- ✅ **Filtrage intelligent** : seuil de score appliqué seulement si critères fournis
- ✅ **Affichage du score** dans les résultats

---

## 🔧 Améliorations

### Code
- ✅ Code modulaire et commenté
- ✅ Séparation des responsabilités (routes, validation, auth)
- ✅ Gestion des erreurs cohérente
- ✅ Messages d'erreur clairs et informatifs

### Documentation
- ✅ **README.md** principal à la racine
- ✅ **backend/README.md** avec documentation API complète
- ✅ **RAPPORT_PROJET.md** avec analyse détaillée
- ✅ **TEST_GUIDE.md** avec 20 scénarios de test
- ✅ **CHANGELOG.md** (ce fichier)
- ✅ Commentaires inline dans le code

### Configuration
- ✅ **.env.example** pour faciliter la configuration
- ✅ **.gitignore** pour protéger les secrets
- ✅ **package.json** avec scripts npm
- ✅ Scripts de démarrage simplifiés

---

## 🐛 Bugs corrigés

### Sécurité (CRITIQUE)
- 🔴 **RÉSOLU** : Mots de passe stockés en clair → Hachage bcrypt
- 🔴 **RÉSOLU** : Pas d'authentification sur les routes → JWT ajouté
- 🔴 **RÉSOLU** : Code admin en dur dans le code → Variables d'environnement
- 🔴 **RÉSOLU** : Pas de validation des entrées → Validation complète
- 🔴 **RÉSOLU** : Pas de gestion d'erreurs → Try-catch partout

### Fonctionnalités
- 🟡 **RÉSOLU** : Seuil de score trop élevé (4) → Abaissé à 3
- 🟡 **RÉSOLU** : ID utilisateur basé sur length → Math.max(id) + 1
- 🟡 **RÉSOLU** : Crash si fichiers JSON manquants → Initialisation auto
- 🟡 **RÉSOLU** : Pas de métadonnées sur les déclarations → Ajout declarantId, etc.
- 🟡 **RÉSOLU** : Recherche insensible à la casse partielle → toLowerCase() sur tous les champs texte

### UX
- 🟢 **RÉSOLU** : Pas d'indication de l'utilisateur connecté → Affichage en haut
- 🟢 **RÉSOLU** : Pas de bouton de déconnexion → Ajouté
- 🟢 **RÉSOLU** : Messages d'erreur peu clairs → Messages spécifiques
- 🟢 **RÉSOLU** : Affichage des résultats basique → Cards stylées avec score

---

## 🗑️ Fichiers supprimés

### Ancien backend Python/Flask
- ❌ `backend/app.py`
- ❌ `backend/database.db`
- ❌ `backend/requirements.txt`

### Ancien frontend
- ❌ `frontend/declarer.html` → Remplacé par `declaration.html`
- ❌ `frontend/rechercher.html` → Remplacé par `recherche.html`

---

## 📦 Nouveaux fichiers

### Backend
- ✅ `backend/server.js` - Nouveau serveur Express
- ✅ `backend/package.json` - Dépendances npm
- ✅ `backend/.env` - Variables d'environnement
- ✅ `backend/.env.example` - Template de configuration
- ✅ `backend/.gitignore` - Protection des secrets
- ✅ `backend/README.md` - Documentation API

### Frontend
- ✅ `frontend/login.html` - Page de connexion
- ✅ `frontend/register.html` - Page d'inscription
- ✅ `frontend/declaration.html` - Nouvelle page déclaration
- ✅ `frontend/recherche.html` - Nouvelle page recherche

### Documentation
- ✅ `README.md` - Documentation principale
- ✅ `RAPPORT_PROJET.md` - Rapport complet
- ✅ `TEST_GUIDE.md` - Guide de test
- ✅ `CHANGELOG.md` - Ce fichier
- ✅ `.gitignore` - À la racine

---

## 🔄 Changements techniques

### Stack technologique

**Avant (V2) :**
```
Backend : Python 3 + Flask
Database : SQLite (database.db)
Auth : Aucune
Storage : Base de données relationnelle
```

**Après (V3) :**
```
Backend : Node.js + Express.js
Database : JSON files (users.json, documents.json)
Auth : JWT + bcrypt
Storage : Fichiers JSON (extensible vers DB)
```

### Dépendances

**Ajoutées :**
- express@5.2.1
- bcrypt@5.1.1
- jsonwebtoken@9.0.2
- cors@2.8.6
- dotenv@16.4.5

**Supprimées :**
- Flask
- SQLAlchemy
- Toutes les dépendances Python

---

## 🎯 Routes API

### Nouvelles routes
- `POST /register` - Inscription avec rôle
- `POST /login` - Connexion JWT
- `GET /documents` - Liste complète (admin uniquement)

### Routes modifiées
- `POST /declaration` - Maintenant protégée par JWT + validation
- `GET /recherche` - Maintenant protégée par JWT + scoring amélioré

---

## 📊 Statistiques

### Code
- **Lignes de code backend :** 278 (server.js)
- **Lignes de code frontend :** 323 (script.js)
- **Fichiers HTML :** 5 pages
- **Routes API :** 5 endpoints
- **Dépendances npm :** 5 packages

### Sécurité
- **Vulnérabilités critiques résolues :** 5
- **Vulnérabilités moyennes résolues :** 4
- **Validations ajoutées :** 10+
- **Try-catch ajoutés :** 7 routes

---

## ⚠️ Breaking Changes

### Migration de V2 vers V3

1. **Base de données**
   - SQLite → JSON files
   - Schéma différent (nouveaux champs)
   - Migration manuelle requise

2. **API**
   - Toutes les routes nécessitent maintenant un token JWT
   - Headers `Authorization: Bearer <token>` requis
   - Nouveaux codes d'erreur (401, 403)

3. **Frontend**
   - Nécessite connexion obligatoire
   - LocalStorage utilisé pour le token
   - Nouvelles pages (login, register)

4. **Configuration**
   - Fichier `.env` requis
   - Variables d'environnement obligatoires
   - Port par défaut : 3000

---

## 🚀 Prochaines versions

### V3.1 (Prévu)
- [ ] Tests unitaires (Jest)
- [ ] Tests d'intégration
- [ ] CI/CD avec GitHub Actions
- [ ] Dockerfile

### V3.2 (Prévu)
- [ ] Migration PostgreSQL
- [ ] Upload de photos
- [ ] Notifications email
- [ ] API versioning

### V4.0 (Futur)
- [ ] Interface admin complète
- [ ] Dashboard avec statistiques
- [ ] Messagerie interne
- [ ] Géolocalisation
- [ ] Application mobile

---

## 🙏 Remerciements

- Migration réussie de Python vers Node.js
- Sécurité renforcée avec JWT et bcrypt
- Architecture moderne et maintenable

---

## 📞 Support

Pour toute question ou problème :
- Consulter `README.md`
- Consulter `backend/README.md` pour l'API
- Consulter `TEST_GUIDE.md` pour les tests
- Consulter `RAPPORT_PROJET.md` pour l'analyse complète

---

**Version actuelle :** 3.0.0  
**Date de release :** 6 juin 2026  
**Status :** ✅ Production-ready (avec recommandations)  
**Auteur :** HERVEMEUPS
