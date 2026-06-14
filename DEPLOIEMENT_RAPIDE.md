# ⚡ Déploiement Ultra-Rapide sur Render.com

## 🎯 Étapes Simplifiées (5 minutes)

### 1️⃣ GitHub (2 minutes)

```bash
git init
git add .
git commit -m "Ready for deployment"
git branch -M main
git remote add origin https://github.com/VOTRE_USERNAME/smartsearch.git
git push -u origin main
```

---

### 2️⃣ Backend sur Render (2 minutes)

1. [render.com](https://render.com) → **New +** → **Web Service**
2. Connectez votre repo GitHub
3. **Configuration** :
   ```
   Name: smartsearch-backend
   Root Directory: backend
   Build Command: npm install
   Start Command: npm start
   ```
4. **Variables d'environnement** :
   ```
   NODE_ENV = production
   JWT_SECRET = super-secret-changez-moi-123456789
   ADMIN_CODE = ADMIN2026
   PORT = 10000
   ```
5. **Create Web Service**

✅ Notez l'URL backend : `https://smartsearch-backend-XXXX.onrender.com`

---

### 3️⃣ Mettre à jour le Frontend (1 minute)

Dans `frontend/script.js`, ligne 97 :
```javascript
const API_URL = "https://smartsearch-backend-XXXX.onrender.com";
```

```bash
git add frontend/script.js
git commit -m "Update API URL"
git push
```

---

### 4️⃣ Frontend sur Render (1 minute)

1. [render.com](https://render.com) → **New +** → **Static Site**
2. Même repo GitHub
3. **Configuration** :
   ```
   Name: smartsearch-frontend
   Publish Directory: frontend
   ```
4. **Create Static Site**

✅ Votre app est EN LIGNE : `https://smartsearch-frontend-XXXX.onrender.com`

---

## 🎉 C'EST TOUT !

**Accédez à votre application** :
- Frontend : URL donnée par Render
- Créez un compte admin avec le code : `ADMIN2026`

---

## ⚠️ Note Importante

**Le plan gratuit a une limite** :
- Le backend s'endort après 15 min d'inactivité
- Première requête après sommeil = 30-60 secondes
- Les données JSON sont en mémoire (perdues au redémarrage)

**Solution** : Utilisez MongoDB Atlas (gratuit) pour la persistance.

---

**Pour plus de détails** → Voir [GUIDE_DEPLOIEMENT_RENDER.md](GUIDE_DEPLOIEMENT_RENDER.md)
