# 🔑 Guide : Créer un Utilisateur Admin

## 🎯 Problème

La base MongoDB Atlas est vide, il n'y a aucun utilisateur. C'est pour ça que :
- ❌ La connexion échoue
- ❌ La recherche ne fonctionne pas

## ✅ Solution : Créer un Admin via MongoDB Atlas

### Méthode 1 : Via MongoDB Atlas (Le Plus Simple) ⭐

#### 1. Aller sur MongoDB Atlas

🔗 https://cloud.mongodb.com

#### 2. Se connecter et ouvrir la base

1. Connectez-vous avec votre compte
2. Cliquez sur **"Browse Collections"** sur votre cluster
3. Sélectionnez la base **"documents_perdus"** (ou **"smartsearch"**)

#### 3. Créer la collection "users" si nécessaire

Si elle n'existe pas :
1. Cliquez sur **"Create Database"** ou **"+"**
2. Database name : `documents_perdus`
3. Collection name : `users`
4. Cliquez **"Create"**

#### 4. Ajouter un document (utilisateur admin)

1. Cliquez sur la collection **"users"**
2. Cliquez sur **"INSERT DOCUMENT"**
3. Passez en mode **"JSON"** (bouton en haut à droite)
4. **Collez ce JSON** :

```json
{
  "username": "admin",
  "email": "admin@smartsearch.com",
  "telephone": "+237600000000",
  "password": "$2b$10$YQ5JZ5Z5Z5Z5Z5Z5Z5Z5ZO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5",
  "role": "admin",
  "isActive": true,
  "preferences": {
    "notificationEmail": true,
    "notificationSMS": false,
    "notificationPush": true,
    "langue": "fr"
  },
  "createdAt": {
    "$date": "2026-06-15T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2026-06-15T00:00:00.000Z"
  }
}
```

⚠️ **IMPORTANT** : Ce mot de passe haché correspond à `admin123`

5. Cliquez sur **"Insert"**

#### 5. Créer un utilisateur test (optionnel)

Répétez l'opération avec ce JSON :

```json
{
  "username": "test_declarant",
  "email": "test@smartsearch.com",
  "telephone": "+237611111111",
  "password": "$2b$10$YQ5JZ5Z5Z5Z5Z5Z5Z5Z5ZO5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5",
  "role": "declarant",
  "isActive": true,
  "preferences": {
    "notificationEmail": true,
    "notificationSMS": false,
    "notificationPush": true,
    "langue": "fr"
  },
  "createdAt": {
    "$date": "2026-06-15T00:00:00.000Z"
  },
  "updatedAt": {
    "$date": "2026-06-15T00:00:00.000Z"
  }
}
```

Mot de passe : `test123`

---

### Méthode 2 : Via Script Node.js

#### 1. Récupérer l'URI MongoDB

Sur Render Dashboard :
1. smartsearch-backend → Environment
2. Copiez la valeur de `MONGODB_URI`

#### 2. Lancer le script

```bash
cd "c:\Users\COMPUTER CARE\Documents\NGOA\M2 SIGL\Projet\Documents_perdus - V3"
node create-admin-production.js
```

#### 3. Suivre les instructions

Le script vous demandera :
- L'URI MongoDB (coller celle copiée)
- Le nom d'utilisateur (appuyez sur Entrée pour "admin")
- Le mot de passe (appuyez sur Entrée pour "admin123")

---

## ⚠️ Hash du Mot de Passe Correct

Le hash ci-dessus est **INCORRECT** (c'était un exemple).

Pour générer le bon hash de `admin123`, utilisez ce script :

```javascript
const bcrypt = require('bcrypt');
bcrypt.hash('admin123', 10).then(hash => console.log(hash));
```

Ou utilisez cet outil en ligne : https://bcrypt-generator.com/
- Entrez `admin123`
- Rounds : 10
- Copiez le hash généré

Mettez à jour le champ `password` dans le JSON avec le hash correct.

---

## 🧪 Test après Création

Une fois l'admin créé, testez :

### Test 1 : Connexion

```bash
curl -X POST https://smartsearch-backend-pxw5.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Résultat attendu** :
```json
{
  "success": true,
  "data": {
    "user": { "username": "admin", "role": "admin" },
    "accessToken": "...",
    "refreshToken": "..."
  }
}
```

### Test 2 : Frontend

1. Allez sur https://smartsearch-frontend.onrender.com/login.html
2. Connectez-vous :
   - Username : `admin`
   - Password : `admin123`
3. Vous devriez être redirigé vers le dashboard

---

## 📊 Comptes Créés

| Username | Password | Rôle | Usage |
|----------|----------|------|-------|
| `admin` | `admin123` | admin | Gestion utilisateurs, documents, stats |
| `test_declarant` | `test123` | declarant | Tester les déclarations |

---

## ✅ Checklist

- [ ] Connexion à MongoDB Atlas
- [ ] Collection "users" créée
- [ ] Admin ajouté via JSON
- [ ] (Optionnel) Utilisateur test ajouté
- [ ] Test connexion avec curl
- [ ] Test connexion frontend
- [ ] Recherche fonctionne

---

## 🎉 Résultat

Une fois l'admin créé, vous pourrez :
- ✅ Vous connecter au frontend
- ✅ Créer des déclarations
- ✅ Faire des recherches
- ✅ Gérer les utilisateurs

**Temps estimé** : 5 minutes ⚡
