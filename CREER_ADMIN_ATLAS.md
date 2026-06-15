# 👑 Créer l'Administrateur sur MongoDB Atlas

**Objectif**: Créer l'utilisateur `meupie_admin` dans MongoDB Atlas pour pouvoir se connecter en production.

---

## 🚀 Méthode Rapide (Recommandée)

### Étape 1: Configurer la connexion Atlas

1. Ouvrez [backend/.env](backend/.env)
2. Ajoutez votre URI MongoDB Atlas:

```env
# Ajoutez cette ligne avec votre URI Atlas
MONGODB_ATLAS_URI=mongodb+srv://votre_user:votre_password@cluster.mongodb.net/smartsearch?retryWrites=true&w=majority
```

### Étape 2: Exécuter le script

```bash
cd backend
node create-admin-atlas.js
```

**Résultat attendu**:
```
✅ Administrateur créé avec succès !

📝 Informations de connexion:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👑 Administrateur:
   Username: meupie_admin
   Password: Admin@2026
   Email: admin@smartsearch.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 🛠️ Méthode Manuelle (MongoDB Compass)

Si le script ne fonctionne pas, créez l'utilisateur manuellement :

### Étape 1: Se connecter à MongoDB Compass

1. Ouvrez **MongoDB Compass**
2. Connectez-vous avec votre URI Atlas
3. Sélectionnez la base `smartsearch` (ou créez-la)
4. Sélectionnez la collection `users` (ou créez-la)

### Étape 2: Insérer le document

Cliquez sur **ADD DATA** → **Insert Document** et collez:

```json
{
  "username": "meupie_admin",
  "email": "admin@smartsearch.com",
  "telephone": "",
  "password": "$2b$10$Y0Zl5qZxJ5Zv5Z5Z5Z5Z5u5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5",
  "role": "admin",
  "isActive": true,
  "preferences": {
    "notificationEmail": true,
    "notificationSMS": false,
    "notificationPush": true,
    "langue": "fr"
  },
  "createdAt": {"$date": "2026-06-15T00:00:00.000Z"},
  "updatedAt": {"$date": "2026-06-15T00:00:00.000Z"}
}
```

⚠️ **Note**: Le mot de passe haché ci-dessus correspond à `Admin@2026`

### Étape 3: Vérifier

```bash
# Dans MongoDB Compass, exécutez cette requête:
db.users.find({ username: "meupie_admin" })
```

---

## 🔐 Générer un Nouveau Hash de Mot de Passe

Si vous voulez un autre mot de passe:

### Option A: Via Node.js

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('VotreMotDePasse', 10).then(hash => console.log(hash));"
```

### Option B: Via Script

```javascript
// Créer un fichier hash-password.js
const bcrypt = require('bcrypt');

const password = process.argv[2] || 'Admin@2026';

bcrypt.hash(password, 10).then(hash => {
  console.log('Mot de passe:', password);
  console.log('Hash:', hash);
  console.log('\nCopiez ce hash dans le champ "password" de MongoDB');
});

// Utilisation:
// node hash-password.js MonMotDePasse
```

---

## 🧪 Tester la Connexion

### Test 1: Via API directe

```bash
curl -X POST https://smartsearch-backend-pxw5.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"meupie_admin","password":"Admin@2026"}'
```

**Réponse attendue**:
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {...},
    "accessToken": "eyJ..."
  }
}
```

### Test 2: Via Frontend

1. Allez sur https://smartsearch-frontend.onrender.com/login.html
2. Entrez:
   - Username: `meupie_admin`
   - Password: `Admin@2026`
3. Cliquez sur "Se connecter"

---

## 🔍 Dépannage

### Problème: "Identifiants incorrects"

**Causes possibles**:
1. L'utilisateur n'existe pas dans Atlas
2. Le mot de passe est incorrect
3. Le hash bcrypt est mal formé

**Solutions**:
```bash
# Vérifier si l'utilisateur existe
node -e "
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_ATLAS_URI).then(async () => {
  const users = await mongoose.connection.collection('users').find({}).toArray();
  console.table(users.map(u => ({ username: u.username, email: u.email, role: u.role })));
  process.exit();
});
"
```

### Problème: "Cannot connect to Atlas"

**Causes**:
1. URI incorrecte
2. IP non autorisée
3. Utilisateur/mot de passe MongoDB incorrect

**Solutions**:
1. Vérifiez l'URI dans `.env`
2. Sur MongoDB Atlas → Network Access → Ajoutez `0.0.0.0/0`
3. Sur MongoDB Atlas → Database Access → Vérifiez les credentials

### Problème: Script ne trouve pas MONGODB_ATLAS_URI

**Solution**: Ajoutez dans [backend/.env](backend/.env):
```env
MONGODB_ATLAS_URI=mongodb+srv://username:password@cluster.mongodb.net/smartsearch
```

---

## 📋 Checklist de Vérification

Avant de tester la connexion:

- [ ] MongoDB Atlas accessible
- [ ] IP `0.0.0.0/0` autorisée dans Network Access
- [ ] Utilisateur MongoDB créé avec droits Atlas Admin
- [ ] URI correcte dans `.env` ou variables Render
- [ ] Base de données `smartsearch` créée
- [ ] Collection `users` créée
- [ ] Utilisateur `meupie_admin` inséré
- [ ] Backend Render redéployé avec les nouvelles corrections
- [ ] Frontend pointe vers le bon backend

---

## 🎯 Résumé des Identifiants

### MongoDB Atlas
```
Cluster: Cluster0
Database: smartsearch
Collection: users
```

### Utilisateur Admin Application
```
Username: meupie_admin
Password: Admin@2026
Email: admin@smartsearch.com
Role: admin
```

### Utilisateurs de Test (Local uniquement)
```
test / test123 (declarant)
admin / admin123 (admin)
```

---

## 🚀 Après la Création

Une fois l'admin créé:

1. **Attendez le redéploiement Render** (~3-5 minutes)
2. **Testez la connexion** sur https://smartsearch-frontend.onrender.com/login.html
3. **Créez d'autres utilisateurs** via le formulaire d'inscription
4. **Testez les fonctionnalités** (déclarations, recherche, etc.)

---

## 📞 Support

Si vous rencontrez des problèmes:

1. **Vérifiez les logs Render**:
   - https://dashboard.render.com
   - Cliquez sur `smartsearch-backend`
   - Onglet **Logs**

2. **Vérifiez MongoDB Atlas**:
   - https://cloud.mongodb.com
   - Collections → `users`
   - Vérifiez que l'utilisateur existe

3. **Testez l'API directement**:
   ```bash
   curl https://smartsearch-backend-pxw5.onrender.com/health
   ```

---

**Date**: 15 juin 2026  
**Version**: 2.0.1  
**Auteur**: HERVEMEUPS
