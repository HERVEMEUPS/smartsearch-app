# 🚀 Guide de Déploiement sur Render.com

## ✨ SmartSearch - Plateforme de Gestion de Documents Perdus

Ce guide vous permettra de déployer l'application **SmartSearch** sur Render.com en **moins de 10 minutes** ! 🎉

---

## 📋 Prérequis

1. ✅ Un compte GitHub (gratuit)
2. ✅ Un compte Render.com (gratuit)
3. ✅ Les fichiers du projet (déjà prêts)

---

## 🎯 Étape 1 : Préparer le Code sur GitHub

### 1.1 Créer un dépôt GitHub

1. Allez sur [github.com](https://github.com)
2. Cliquez sur le **+** en haut à droite → **New repository**
3. Nommez-le : `smartsearch-app`
4. Laissez-le **Public** (obligatoire pour la version gratuite de Render)
5. Cliquez sur **Create repository**

### 1.2 Pousser votre code sur GitHub

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
# Initialiser Git (si pas déjà fait)
git init

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - SmartSearch App"

# Lier au dépôt GitHub (remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub)
git remote add origin https://github.com/VOTRE_USERNAME/smartsearch-app.git

# Pousser le code
git branch -M main
git push -u origin main
```

✅ **Votre code est maintenant sur GitHub !**

---

## 🌐 Étape 2 : Déployer sur Render.com

### 2.1 Créer un compte Render

1. Allez sur [render.com](https://render.com)
2. Cliquez sur **Get Started**
3. Inscrivez-vous avec votre compte GitHub (recommandé)

### 2.2 Déployer le Backend

1. Sur le dashboard Render, cliquez sur **New +** → **Web Service**
2. Connectez votre dépôt GitHub `smartsearch-app`
3. Configurez le service :

   **Paramètres :**
   ```
   Name: smartsearch-backend
   Region: Frankfurt (EU Central) ou Singapore
   Branch: main
   Root Directory: backend
   Runtime: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Variables d'environnement** :
   - Cliquez sur **Advanced** → **Add Environment Variable**
   - Ajoutez :
     ```
     NODE_ENV = production
     JWT_SECRET = votre-secret-ultra-securise-changez-moi-123456789
     ADMIN_CODE = ADMIN2026
     PORT = 10000
     ```

5. **Plan** : Sélectionnez **Free** (gratuit)

6. Cliquez sur **Create Web Service**

⏳ **Attendez 2-5 minutes** que le déploiement se termine.

✅ **Note** : Une fois déployé, vous verrez l'URL de votre backend (ex: `https://smartsearch-backend.onrender.com`)

---

### 2.3 Déployer le Frontend

1. Sur le dashboard Render, cliquez sur **New +** → **Static Site**
2. Connectez le même dépôt GitHub `smartsearch-app`
3. Configurez le service :

   **Paramètres :**
   ```
   Name: smartsearch-frontend
   Branch: main
   Root Directory: (laissez vide)
   Build Command: (laissez vide ou mettez "echo Done")
   Publish Directory: frontend
   ```

4. Cliquez sur **Create Static Site**

⏳ **Attendez 1-2 minutes** que le déploiement se termine.

✅ **Note** : Vous verrez l'URL de votre frontend (ex: `https://smartsearch-frontend.onrender.com`)

---

## 🔧 Étape 3 : Connecter Frontend et Backend

### 3.1 Mettre à jour l'URL de l'API

1. Éditez le fichier `frontend/script.js` :
   - Ligne 97, remplacez :
     ```javascript
     const API_URL = "http://localhost:3000";
     ```
   - Par (remplacez par VOTRE URL backend) :
     ```javascript
     const API_URL = "https://smartsearch-backend.onrender.com";
     ```

2. Committez et poussez la modification :
   ```bash
   git add frontend/script.js
   git commit -m "Update API URL for production"
   git push
   ```

3. Render va automatiquement redéployer le frontend ! 🎉

---

## ✅ Étape 4 : Configuration CORS Backend

Vérifiez que votre backend accepte les requêtes du frontend :

1. Dans `backend/server.js`, la configuration CORS devrait être :
   ```javascript
   app.use(cors({
     origin: [
       'http://localhost:5500',
       'https://smartsearch-frontend.onrender.com'  // Ajoutez votre URL frontend
     ],
     credentials: true
   }));
   ```

2. Si vous devez modifier, committez et poussez :
   ```bash
   git add backend/server.js
   git commit -m "Update CORS configuration"
   git push
   ```

---

## 🎉 C'est Terminé !

Votre application **SmartSearch** est maintenant **en ligne** ! 🚀

### 🔗 Vos URLs :

- **Frontend** : `https://smartsearch-frontend.onrender.com`
- **Backend API** : `https://smartsearch-backend.onrender.com`

### 👥 Comptes de Test :

Créez votre premier compte admin :
1. Allez sur `https://smartsearch-frontend.onrender.com/register.html`
2. Créez un compte avec le code admin : `ADMIN2026`

---

## 🛠️ Fonctionnalités Disponibles

✅ Inscription/Connexion  
✅ Déclaration de documents perdus/trouvés  
✅ Recherche intelligente de documents  
✅ Dashboard administrateur  
✅ Gestion des utilisateurs  
✅ Gestion des documents  
✅ Statistiques en temps réel  
✅ Correspondances automatiques  

---

## 📝 Notes Importantes

### ⚠️ Limitations du Plan Gratuit de Render :

1. **Backend s'endort après 15 min d'inactivité**
   - La première requête après inactivité peut prendre 30-60 secondes
   - Les requêtes suivantes sont instantanées

2. **750 heures gratuites par mois**
   - Largement suffisant pour un projet étudiant

3. **Pas de base de données persistante** (actuellement JSON)
   - Les données sont stockées en mémoire
   - ⚠️ **Les données seront perdues lors d'un redémarrage du serveur**

### 🔄 Pour Éviter la Perte de Données :

**Option A - Ajouter MongoDB (Recommandé)** :
1. Créez un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit (512 MB)
3. Ajoutez l'URL de connexion dans les variables d'environnement Render
4. Modifiez le backend pour utiliser MongoDB au lieu de JSON

**Option B - Utiliser Render Disks** (Payant) :
- 1 GB = $0.25/mois
- Les données persistent entre redémarrages

---

## 🐛 Dépannage

### Problème : Le frontend ne se connecte pas au backend

**Solution** :
1. Vérifiez que l'URL API dans `frontend/script.js` est correcte
2. Vérifiez les logs du backend sur Render
3. Vérifiez que le CORS est bien configuré

### Problème : "Application Error" sur le backend

**Solution** :
1. Allez sur Render Dashboard → smartsearch-backend → Logs
2. Regardez les erreurs
3. Vérifiez que toutes les variables d'environnement sont définies

### Problème : Les données sont perdues

**Solution** :
1. C'est normal avec le stockage JSON sur Render Free
2. Passez à MongoDB Atlas (gratuit) pour la persistance

---

## 🔒 Sécurité en Production

Avant d'utiliser en production réelle :

1. ✅ Changez `JWT_SECRET` par une valeur ultra-sécurisée
2. ✅ Changez `ADMIN_CODE` par un code unique
3. ✅ Utilisez HTTPS (déjà activé par Render)
4. ✅ Activez rate limiting (déjà présent dans le code)
5. ✅ Utilisez MongoDB Atlas au lieu de JSON

---

## 📧 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs sur Render Dashboard
2. Consultez la documentation : [docs.render.com](https://docs.render.com)
3. Contactez le support Render (très réactif)

---

## 🎓 Projet Réalisé Par

**HERVEMEUPS**  
M2 SIGL - Projet Documents Perdus  
Juin 2026

---

## 📚 Ressources Utiles

- [Documentation Render](https://docs.render.com)
- [Render Status](https://status.render.com)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [GitHub Docs](https://docs.github.com)

---

**🎉 Félicitations ! Votre application est maintenant accessible dans le monde entier ! 🌍**
