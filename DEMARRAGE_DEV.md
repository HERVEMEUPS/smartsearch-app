# 🚀 Guide de Démarrage en Mode Développement

Ce guide explique comment démarrer l'application en mode développement local avec votre MongoDB local.

## ✅ Changements effectués

### Configuration Frontend
Les fichiers suivants ont été modifiés pour pointer vers `http://localhost:3000` au lieu de Render :
- ✅ `frontend/script.js` (ligne 97)
- ✅ `frontend/index.html` (ligne 286)

**Note** : `dashboard.html` et `admin-documents.html` utilisent `script.js`, donc ils héritent automatiquement de la bonne configuration.

## 📋 Étapes pour Démarrer

### 1. Vérifier MongoDB
Assurez-vous que MongoDB est démarré sur votre machine :

```bash
# Windows - Vérifier si MongoDB est actif
mongod --version

# Si MongoDB n'est pas démarré, lancez-le
mongod

# Ou si vous utilisez MongoDB Compass, assurez-vous qu'il est connecté à localhost:27017
```

### 2. Démarrer le Backend
Ouvrez un terminal dans le dossier du projet :

```bash
cd backend
npm install   # Si première fois
npm start
```

Vous devriez voir :
```
✅ Connecté à MongoDB
🚀 Serveur démarré sur http://localhost:3000
```

### 3. Ouvrir le Frontend
Ouvrez simplement les fichiers HTML dans votre navigateur :
- **Page d'accueil** : `frontend/index.html`
- **Connexion** : `frontend/login.html`
- **Dashboard Admin** : `frontend/dashboard.html` (après connexion)
- **Documents Admin** : `frontend/admin-documents.html` (après connexion)

### 4. Se Connecter
Utilisez un des comptes existants :

**Compte Admin**
- Username : `admin`
- Password : (celui configuré dans votre base)

**Compte Test**
- Username : `test`
- Password : (celui configuré dans votre base)

## 📊 Vérifier les Données

### Option 1 : Script de diagnostic
```bash
node backend/diagnostic-correspondances.js
```

Ce script affiche :
- Nombre total de déclarations
- Répartition PERTE vs DECOUVERTE
- Nombre de correspondances
- Diagnostic détaillé

**Résultat attendu** :
```
📊 STATISTIQUES DES DÉCLARATIONS:
  Total: 6
  PERTE (documents perdus): 3
  DECOUVERTE (documents trouvés): 3

🔗 STATISTIQUES DES CORRESPONDANCES:
  Total correspondances: 0
  PROPOSEE: 0
```

### Option 2 : Via le Dashboard
1. Connectez-vous en tant qu'admin
2. Allez sur `dashboard.html`
3. Allez sur `admin-documents.html`
4. Vous devriez voir les 6 documents

## ⚠️ Problème : "Aucune correspondance détectée"

**Cause** : Le système de matching nécessite un service IA externe qui n'est pas démarré.

**Solutions** :

### Solution A : Matching Manuel (Temporaire)
Pour tester rapidement sans le service IA, vous pouvez modifier manuellement `backend/src/services/matchingService.js` à la ligne 38 :

```javascript
// Au lieu de
const matchResult = await this.computeMatch(declaration, candidate);

// Utilisez temporairement
const matchResult = {
  score_global: 0.80,
  score_nlp: 0.75,
  score_llm: 0.85,
  score_geo: 0.80,
  au_dessus_du_seuil: true,
  raisonnement: `Correspondance basique : même type (${declaration.typeDocument}), même ville (${declaration.localisation.ville})`,
  metadata: { model_used: 'basic-match', processing_time_ms: 5 }
};
```

Puis lancez :
```bash
node backend/trigger-matching.js
```

### Solution B : Créer le Service IA (Recommandé)
Voir le fichier `SOLUTION_CORRESPONDANCES.md` pour les détails sur la création du service IA Python/FastAPI.

## 🔄 Basculer entre Local et Production

### Mode Développement (Local)
```javascript
// frontend/script.js ligne 97
const API_URL = "http://localhost:3000";
```

### Mode Production (Render)
```javascript
// frontend/script.js ligne 97
const API_URL = "https://smartsearch-backend-pxw5.onrender.com";
```

**Conseil** : Utilisez toujours le mode local pendant le développement pour tester vos modifications avant de les déployer sur Render.

## 📝 Scripts Utiles

| Script | Description |
|--------|-------------|
| `node backend/diagnostic-correspondances.js` | Affiche l'état de la base de données |
| `node backend/seed-test-data.js` | Crée 6 déclarations de test |
| `node backend/trigger-matching.js` | Déclenche le matching manuellement |

## ❓ Dépannage

### "Cannot connect to MongoDB"
- Vérifiez que MongoDB est démarré
- Vérifiez l'URL dans `backend/.env` : `MONGO_URI=mongodb://localhost:27017/documents_perdus`

### "Port 3000 already in use"
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Ou changez le port dans backend/.env
PORT=3001
```

### "Token invalid" après connexion
- Supprimez localStorage dans le navigateur (F12 > Application > Local Storage > Clear)
- Reconnectez-vous

### Les documents n'apparaissent pas
1. Vérifiez que le backend est démarré
2. Ouvrez la console du navigateur (F12)
3. Vérifiez les erreurs réseau (onglet Network)
4. Vérifiez que l'API_URL pointe vers `http://localhost:3000`

## ✅ Checklist Avant de Commencer

- [ ] MongoDB est démarré
- [ ] Backend est démarré (`npm start` dans le dossier backend)
- [ ] API_URL dans `script.js` et `index.html` pointe vers `http://localhost:3000`
- [ ] Données de test créées (via `seed-test-data.js`)
- [ ] Navigateur ouvert sur `frontend/index.html`

## 🎯 Prochaines Étapes

1. ✅ Démarrer l'application en local
2. ✅ Vérifier que les 6 documents apparaissent
3. ⚠️  Implémenter le matching (solution A ou B ci-dessus)
4. ✅ Voir les correspondances dans le dashboard
5. 🚀 Déployer sur Render quand tout fonctionne
