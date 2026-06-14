# 🗄️ Configuration MongoDB Atlas - Guide Visuel

## Étape 1 : Créer un compte (2 minutes)

```
https://www.mongodb.com/cloud/atlas/register
```

1. Créer un compte avec email ou Google
2. Valider l'email si demandé
3. Connexion automatique au dashboard

---

## Étape 2 : Créer un cluster gratuit (1 minute)

Sur le dashboard :

```
┌─────────────────────────────────────────────────┐
│ MongoDB Atlas Dashboard                          │
│                                                  │
│  [+ Create]  ← Cliquer ici                      │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Shared (FREE)        ✓ Recommandé        │  │
│  │ M0 Sandbox - FREE                        │  │
│  │                                           │  │
│  │ Provider: [AWS ▼]                        │  │
│  │ Region:   [eu-west-3 (Paris) ▼]        │  │
│  │                                           │  │
│  │ Cluster Name: oufarez-cluster           │  │
│  │                                           │  │
│  │          [Create Cluster]                │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

⏱️ Attendre 1-3 minutes que le cluster soit créé...

---

## Étape 3 : Créer un utilisateur (1 minute)

```
┌─────────────────────────────────────────────────┐
│ Security                                         │
│  → Database Access  ← Cliquer ici               │
│  → Network Access                                │
└─────────────────────────────────────────────────┘

Puis :

┌─────────────────────────────────────────────────┐
│ Database Users                                   │
│                                                  │
│  [+ Add New Database User]  ← Cliquer ici       │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ Authentication Method: Password          │  │
│  │                                           │  │
│  │ Username: oufarez                        │  │
│  │ Password: oufarez2026                    │  │
│  │                                           │  │
│  │ Database User Privileges:                │  │
│  │ [✓] Read and write to any database      │  │
│  │                                           │  │
│  │          [Add User]                      │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Étape 4 : Autoriser l'accès réseau (1 minute)

```
┌─────────────────────────────────────────────────┐
│ Security                                         │
│  → Database Access                               │
│  → Network Access  ← Cliquer ici                │
└─────────────────────────────────────────────────┘

Puis :

┌─────────────────────────────────────────────────┐
│ IP Access List                                   │
│                                                  │
│  [+ Add IP Address]  ← Cliquer ici              │
│                                                  │
│  ┌──────────────────────────────────────────┐  │
│  │ [Allow Access from Anywhere]  ← Choisir │  │
│  │                                           │  │
│  │ IP Address: 0.0.0.0/0                    │  │
│  │ Description: Development access          │  │
│  │                                           │  │
│  │ ⚠️  For development only!                │  │
│  │                                           │  │
│  │          [Confirm]                       │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

---

## Étape 5 : Obtenir l'URI de connexion (30 secondes)

```
┌─────────────────────────────────────────────────┐
│ Databases                                        │
│                                                  │
│  oufarez-cluster     [Browse Collections]       │
│                      [Connect]  ← Cliquer ici   │
└─────────────────────────────────────────────────┘

Puis :

┌─────────────────────────────────────────────────┐
│ Connect to oufarez-cluster                       │
│                                                  │
│  [Drivers]  ← Choisir                           │
│  [MongoDB for VS Code]                          │
│  [MongoDB Shell]                                │
└─────────────────────────────────────────────────┘

Puis :

┌─────────────────────────────────────────────────┐
│ Connect your application                         │
│                                                  │
│  Driver: Node.js                                │
│  Version: 4.1 or later                          │
│                                                  │
│  Connection string:                             │
│  ┌────────────────────────────────────────┐   │
│  │ mongodb+srv://oufarez:<password>@      │   │
│  │ cluster0.xxxxx.mongodb.net/            │   │
│  │ ?retryWrites=true&w=majority          │   │
│  │                                        │   │
│  │         [Copy]  ← Cliquer ici         │   │
│  └────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

📋 **L'URI est copié dans votre presse-papier !**

---

## Étape 6 : Configurer le backend (30 secondes)

### Format de l'URI copiée :

```
mongodb+srv://oufarez:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Modifications à faire :

1. **Remplacer `<password>`** par votre vrai mot de passe : `oufarez2026`
2. **Ajouter le nom de la base de données** après `.net/` : `documents_perdus`

### URI finale :

```
mongodb+srv://oufarez:oufarez2026@cluster0.xxxxx.mongodb.net/documents_perdus?retryWrites=true&w=majority
```

⚠️ **Important** : Le `xxxxx` sera remplacé par votre vrai cluster ID (ex: `abc123`)

---

## Étape 7 : Mettre à jour le fichier .env

Ouvrir : `backend\.env`

**Remplacer la ligne** :
```env
MONGODB_URI=mongodb://localhost:27017/documents_perdus
```

**Par** :
```env
MONGODB_URI=mongodb+srv://oufarez:oufarez2026@cluster0.xxxxx.mongodb.net/documents_perdus?retryWrites=true&w=majority
```

💡 **Astuce** : Faire Ctrl+F et chercher "MONGODB_URI"

---

## ✅ Vérification

### Test 1 : Démarrer le serveur

```bash
cd backend
npm start
```

**Résultat attendu** :
```
═══════════════════════════════════════════════════
🚀 Serveur OUFAREZ démarré avec succès !
═══════════════════════════════════════════════════
✅ MongoDB connecté avec succès
📍 Base de données: documents_perdus
🌐 Host: cluster0-shard-00-00.xxxxx.mongodb.net
```

### Test 2 : Vérifier la connexion

```bash
curl http://localhost:3000/health
```

**Réponse attendue** :
```json
{
  "status": "healthy",
  "timestamp": "2026-06-06T...",
  "uptime": 1.23
}
```

### Test 3 : Créer un compte

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@test.com",
    "password": "test123",
    "role": "declarant"
  }'
```

**Réponse attendue** :
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "username": "test",
    "email": "test@test.com",
    "role": "declarant"
  }
}
```

---

## 🔍 Voir les données dans MongoDB Atlas

1. **Aller sur** : https://cloud.mongodb.com
2. **Cliquer sur "Browse Collections"** sur votre cluster
3. **Voir** :
   - Database : `documents_perdus`
   - Collections : `users`, `declarations`, etc.

---

## 🆘 Problèmes Courants

### Erreur : "MongoNetworkError"

**Cause** : IP non autorisée

**Solution** :
1. Aller dans "Network Access"
2. Vérifier que `0.0.0.0/0` est dans la liste
3. Attendre 1-2 minutes que la règle s'applique

### Erreur : "Authentication failed"

**Cause** : Mauvais username/password

**Solution** :
1. Vérifier l'URI dans `.env`
2. S'assurer que `<password>` est remplacé
3. Vérifier l'utilisateur dans "Database Access"

### Erreur : "Connection string invalid"

**Cause** : URI mal formatée

**Solution** : Vérifier :
- Format : `mongodb+srv://...`
- Pas d'espaces
- Nom de base de données après `.net/`

---

## 📱 Alternative : MongoDB Compass (GUI)

Pour voir vos données visuellement :

1. **Télécharger** : https://www.mongodb.com/try/download/compass
2. **Installer** MongoDB Compass
3. **Coller** votre URI de connexion
4. **Cliquer** sur "Connect"

Vous verrez votre base de données graphiquement !

---

## 🎯 Résumé en 1 Minute

```bash
1. Créer compte : https://mongodb.com/cloud/atlas/register
2. Créer cluster gratuit M0
3. Créer user : oufarez / oufarez2026
4. Autoriser IP : 0.0.0.0/0
5. Copier URI : mongodb+srv://oufarez:oufarez2026@...
6. Coller dans backend/.env
7. npm start
✅ Done !
```

---

**Temps total** : ~5 minutes

**Coût** : 0€ (cluster M0 gratuit à vie)

**Stockage** : 512 MB (largement suffisant pour MVP)
