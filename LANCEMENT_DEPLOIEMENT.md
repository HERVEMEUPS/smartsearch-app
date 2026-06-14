# 🎯 LANCEMENT DU DÉPLOIEMENT - MODE D'EMPLOI

## 🚀 Votre Application SmartSearch est PRÊTE !

Tout est configuré et prêt pour être déployé sur Render.com (gratuit) !

---

## ⚡ MÉTHODE 1 : Script Automatique (Recommandé)

### Sur Windows :
Double-cliquez sur **`deploy.bat`** ou exécutez dans le terminal :
```bash
deploy.bat
```

### Sur Mac/Linux :
Exécutez dans le terminal :
```bash
chmod +x deploy.sh
./deploy.sh
```

Le script va :
- ✅ Initialiser Git si nécessaire
- ✅ Vous demander l'URL de votre dépôt GitHub
- ✅ Ajouter tous les fichiers
- ✅ Créer un commit
- ✅ Pousser le code sur GitHub
- ✅ Vous donner les prochaines étapes

---

## 📝 MÉTHODE 2 : Manuelle (Si vous préférez contrôler)

### Étape 1 : GitHub

```bash
# 1. Créez un nouveau dépôt sur github.com (nommez-le "smartsearch")

# 2. Dans votre terminal, exécutez :
git init
git add .
git commit -m "🚀 Ready for deployment"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/smartsearch.git
git push -u origin main
```

### Étape 2 : Render Backend

1. Allez sur [render.com](https://render.com) et créez un compte
2. Cliquez sur **New +** → **Web Service**
3. Connectez votre dépôt GitHub `smartsearch`
4. Configuration :
   - **Name** : `smartsearch-backend`
   - **Root Directory** : `backend`
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Variables d'environnement (cliquez **Advanced**) :
   ```
   NODE_ENV = production
   JWT_SECRET = generez-un-secret-unique-ici-123456789abcdef
   ADMIN_CODE = ADMIN2026
   PORT = 10000
   ```
6. Sélectionnez le plan **Free**
7. Cliquez **Create Web Service**

⏳ Attendez 2-5 minutes que le déploiement se termine.

📝 **IMPORTANT** : Notez l'URL du backend (ex: `https://smartsearch-backend-xxxx.onrender.com`)

### Étape 3 : Mettre à jour le Frontend

1. Ouvrez `frontend/script.js`
2. Ligne 97, remplacez :
   ```javascript
   const API_URL = "http://localhost:3000";
   ```
   Par (utilisez VOTRE URL backend) :
   ```javascript
   const API_URL = "https://smartsearch-backend-xxxx.onrender.com";
   ```

3. Commitez et poussez :
   ```bash
   git add frontend/script.js
   git commit -m "Update API URL for production"
   git push
   ```

### Étape 4 : Render Frontend

1. Sur Render, cliquez **New +** → **Static Site**
2. Connectez le même dépôt GitHub `smartsearch`
3. Configuration :
   - **Name** : `smartsearch-frontend`
   - **Root Directory** : (laissez vide)
   - **Build Command** : (laissez vide)
   - **Publish Directory** : `frontend`
4. Cliquez **Create Static Site**

⏳ Attendez 1-2 minutes.

---

## 🎉 TERMINÉ !

Votre application est maintenant **EN LIGNE** ! 🌍

### 🔗 Vos URLs :

- **Frontend** : `https://smartsearch-frontend-xxxx.onrender.com`
- **Backend API** : `https://smartsearch-backend-xxxx.onrender.com`

### 🔐 Premier Compte Admin :

1. Allez sur votre URL frontend
2. Cliquez sur **S'inscrire**
3. Choisissez **Administrateur**
4. Code admin : `ADMIN2026`

---

## 📚 Documentation

- **Version courte** : [DEPLOIEMENT_RAPIDE.md](DEPLOIEMENT_RAPIDE.md)
- **Version détaillée** : [GUIDE_DEPLOIEMENT_RENDER.md](GUIDE_DEPLOIEMENT_RENDER.md)
- **Informations générales** : [README_DEPLOYMENT.md](README_DEPLOYMENT.md)

---

## ⚠️ Notes Importantes

### Plan Gratuit Render :

✅ **Avantages** :
- Hébergement gratuit
- SSL/HTTPS automatique
- Déploiement automatique depuis GitHub
- Parfait pour projet étudiant/démo

⚠️ **Limitations** :
- Backend s'endort après 15 min d'inactivité
  - 1ère requête après sommeil : 30-60 secondes
  - Requêtes suivantes : instantanées
- Données JSON en mémoire (perdues au redémarrage)

### 💡 Solution pour Persistance :

**MongoDB Atlas** (gratuit, 512 MB) :
1. Créez un compte sur [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Ajoutez l'URL de connexion dans les variables Render
4. Le backend utilisera automatiquement MongoDB

Instructions détaillées dans [GUIDE_DEPLOIEMENT_RENDER.md](GUIDE_DEPLOIEMENT_RENDER.md).

---

## 🆘 Besoin d'Aide ?

### Erreur Backend ?
- Vérifiez les logs sur Render Dashboard → smartsearch-backend → Logs
- Vérifiez que les variables d'environnement sont bien définies

### Frontend ne se connecte pas ?
- Vérifiez l'URL API dans `frontend/script.js`
- Vérifiez que le backend est bien démarré (voyant vert sur Render)

### Autres problèmes ?
- Consultez la section **Dépannage** dans [GUIDE_DEPLOIEMENT_RENDER.md](GUIDE_DEPLOIEMENT_RENDER.md)
- Documentation Render : https://docs.render.com

---

## 📊 Fonctionnalités de l'Application

✅ Authentification sécurisée (JWT)  
✅ Gestion des rôles (Admin/Déclarant)  
✅ Déclaration de documents (Perdu/Trouvé)  
✅ Recherche intelligente avec scoring  
✅ Dashboard administrateur avec statistiques  
✅ Gestion des utilisateurs (créer, modifier, supprimer)  
✅ Gestion des documents  
✅ Correspondances automatiques Perdu ↔ Trouvé  
✅ Top déclarants  
✅ Statistiques en temps réel  
✅ Graphiques interactifs  

---

## 🎓 Informations Projet

**Projet** : SmartSearch - Plateforme Intelligente de Gestion de Documents Perdus  
**Auteur** : HERVEMEUPS  
**Formation** : M2 SIGL (Système d'Information et Génie Logiciel)  
**Institution** : NGOA  
**Année** : 2026  

**Technologies** :
- Frontend : HTML5, CSS3, JavaScript, Chart.js
- Backend : Node.js, Express.js
- Authentification : JWT (JSON Web Tokens)
- Base de données : JSON / MongoDB (optionnel)
- Déploiement : Render.com

---

## 🎯 Prochaines Étapes (Optionnelles)

Après le déploiement, vous pouvez :

1. **Ajouter MongoDB Atlas** pour la persistance des données
2. **Personnaliser le design** selon vos préférences
3. **Ajouter des fonctionnalités** :
   - Notifications par email
   - Upload d'images pour les documents
   - Système de messagerie entre utilisateurs
   - Export PDF des rapports
4. **Améliorer la sécurité** :
   - Authentification à deux facteurs (2FA)
   - Limitation de tentatives de connexion
   - Logs d'audit complets

---

## 📞 Support

Pour toute question ou problème :
1. Consultez les guides de déploiement
2. Vérifiez les logs sur Render
3. Documentation Render : https://docs.render.com
4. GitHub Issues (si vous avez publié le projet)

---

**🚀 Bon déploiement ! Dans quelques minutes, votre application sera accessible dans le monde entier ! 🌍**

---

*Document créé le 14 juin 2026*  
*SmartSearch v2.0 - Ready for Production*
