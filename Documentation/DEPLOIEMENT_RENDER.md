# 🚀 Déploiement sur Render - Guide Complet

**Date**: 2026-06-16  
**Version**: 3.2 (avec Matching Amélioré)

---

## 📦 Ce qui a été corrigé

✅ Algorithme de matching amélioré (v3.2)
✅ Filtrage souple sur les villes (case-insensitive)
✅ Normalisation des numéros
✅ Algorithme de Levenshtein
✅ Bonus pour correspondances parfaites (+10%)
✅ Score DJANGA Kymia : 100%

**TOUS LES COMMITS SONT DÉJÀ PUSHÉS SUR GITHUB !** ✅

---

## 🔄 Déploiement Automatique

Render est configuré pour déployer automatiquement depuis GitHub.

### Vérifier le Déploiement Auto

1. Aller sur : https://dashboard.render.com
2. Se connecter
3. Cliquer sur votre service backend
4. Onglet **"Events"** ou **"Deploys"**
5. Vérifier qu'un nouveau déploiement a démarré

**Si un déploiement est en cours :**
- ⏳ Attendre 5-10 minutes
- ✅ Status passera à "Live"
- 🎉 Les corrections seront actives !

**Si aucun déploiement n'a démarré :**
- Voir section "Déploiement Manuel" ci-dessous

---

## 🖱️ Déploiement Manuel

Si le déploiement automatique ne fonctionne pas :

### Étapes :

#### 1. **Accéder au Dashboard**
```
https://dashboard.render.com
```

#### 2. **Sélectionner le Service Backend**
Cliquer sur le service qui héberge votre backend Node.js

#### 3. **Déclencher le Déploiement**
- Bouton **"Manual Deploy"** (coin supérieur droit)
- Sélectionner **"Deploy latest commit"**
- OU sélectionner un commit spécifique :
  - `011485a` - Tools de débogage
  - `18e20a9` - Test matching
  - `a568c08` - Fix matching v3.2 ⭐

#### 4. **Surveiller les Logs**
- Onglet **"Logs"**
- Vérifier que :
  ```
  ✅ npm install - succès
  ✅ Building...
  ✅ Starting server...
  ✅ Server running on port XXX
  ```

#### 5. **Vérifier le Statut**
- Status doit passer à **"Live"** (vert)
- Si **"Failed"** (rouge) : voir section Dépannage

---

## 🧪 Tester le Déploiement

### 1. **Vérifier l'API Backend**

Ouvrir dans le navigateur :
```
https://votre-backend.onrender.com/health
```

**Réponse attendue :**
```json
{
  "service": "OUFAREZ Backend",
  "status": "healthy",
  "version": "3.2"
}
```

### 2. **Tester l'Endpoint Correspondances**

Vous aurez besoin d'un token admin. Utiliser Postman ou cURL :

```bash
# 1. Se connecter
curl -X POST https://votre-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'

# Copier le token de la réponse

# 2. Récupérer les correspondances
curl https://votre-backend.onrender.com/api/correspondances \
  -H "Authorization: Bearer VOTRE_TOKEN"
```

**Réponse attendue :**
```json
{
  "success": true,
  "data": [
    {
      "scoreGlobal": 1.0,
      "declarationPerteId": {...},
      "declarationDecouverteId": {...}
    },
    ...
  ]
}
```

### 3. **Tester depuis le Frontend**

1. Aller sur : https://smartsearch-frontend.onrender.com
2. Se connecter : `admin` / `admin`
3. Ouvrir le dashboard
4. Scroller jusqu'à "🔗 Correspondances Automatiques"
5. Devrait afficher 2 correspondances !

---

## 🔧 Recréer les Correspondances sur Render

Si les correspondances n'apparaissent toujours pas après le déploiement,
il faut lancer le matching sur la base de données Render :

### Option 1 : Via Render Shell

1. Dashboard Render > Votre Service > **"Shell"**
2. Exécuter :
```bash
node backend/trigger-matching.js
```

### Option 2 : Via Script de Déploiement

Ajouter dans `package.json` :
```json
{
  "scripts": {
    "postdeploy": "node backend/trigger-matching.js"
  }
}
```

Render exécutera automatiquement le matching après chaque déploiement.

### Option 3 : Endpoint API Dédié

Créer un endpoint admin pour déclencher le matching :

**backend/src/routes/adminRoutes.js** (à créer) :
```javascript
router.post('/trigger-matching', authenticateToken, requireAdmin, async (req, res) => {
  // Déclencher le matching
  const declarations = await Declaration.find({ statut: 'EN_ATTENTE' });
  // ... logique de matching
  res.json({ success: true, message: 'Matching déclenché' });
});
```

Puis appeler depuis Postman :
```
POST https://votre-backend.onrender.com/api/admin/trigger-matching
Authorization: Bearer TOKEN_ADMIN
```

---

## 🐛 Dépannage

### Problème : Build Failed

**Causes possibles :**
- Dépendances manquantes
- Erreur de syntaxe dans le code
- Version Node.js incompatible

**Solutions :**
1. Vérifier les logs Render
2. Vérifier `package.json` :
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```
3. Vérifier que toutes les dépendances sont dans `package.json`

### Problème : Health Check Failed

**Causes possibles :**
- Port incorrect
- Route `/health` non définie
- MongoDB non accessible

**Solutions :**
1. Vérifier `PORT` dans les variables d'environnement
2. Vérifier que MongoDB Atlas est accessible depuis Render
3. Vérifier les logs pour les erreurs de connexion

### Problème : Correspondances = 0

**Causes possibles :**
- Base de données vide sur Render
- Matching pas encore exécuté
- Algorithme pas déployé

**Solutions :**
1. Exécuter `node backend/trigger-matching.js` sur Render Shell
2. Vérifier que les déclarations existent dans MongoDB Atlas
3. Vérifier les logs de matching

---

## 🌍 Variables d'Environnement Render

Vérifier que ces variables sont définies dans Render :

```
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=...
MATCH_THRESHOLD=0.72
CORS_ORIGIN=https://smartsearch-frontend.onrender.com
```

**Où les configurer :**
Dashboard > Votre Service > **"Environment"** > Variables d'environnement

---

## 📊 Vérifier les Logs

### Logs en Temps Réel
Dashboard > Votre Service > **"Logs"**

### Logs Importants à Vérifier

```
✅ Build started
✅ Installing dependencies
✅ npm install complete
✅ Starting server
✅ Connected to MongoDB
✅ Server listening on port 3000
```

### Logs d'Erreur Courants

```
❌ EADDRINUSE: port already in use
   → Redémarrer le service

❌ MongoNetworkError
   → Vérifier MONGODB_URI

❌ JWT secret not defined
   → Ajouter JWT_SECRET dans les variables d'environnement
```

---

## 📱 Contact & Support

**GitHub Repository :**
https://github.com/HERVEMEUPS/smartsearch-app

**Commits Importants :**
- `a568c08` - 🐛 Fix: Système de Matching Amélioré - v3.2
- `18e20a9` - 🧪 Test: Script validation algorithme
- `011485a` - 🛠️ Tools: Scripts de débogage

**Render Dashboard :**
https://dashboard.render.com

---

## ✅ Checklist de Déploiement

Avant de déployer, vérifier :

- [ ] Tous les commits sont pushés sur GitHub
- [ ] Les tests locaux passent
- [ ] Les variables d'environnement sont configurées
- [ ] Le `package.json` est à jour
- [ ] La version Node.js est spécifiée

Après le déploiement :

- [ ] Build réussi (status "Live")
- [ ] Health check OK
- [ ] API répond correctement
- [ ] Matching lancé sur la base Render
- [ ] Correspondances visibles dans le frontend

---

**Version du Document**: 1.0  
**Dernière Mise à Jour**: 2026-06-16  
**Auteur**: Claude Code + HERVEMEUPS
