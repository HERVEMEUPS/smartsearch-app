# 🚀 Installation Rapide - Sans Docker

## Problème rencontré

MongoDB n'est pas installé localement et Docker n'est pas démarré.

## Solution : Utiliser MongoDB Atlas (Cloud Gratuit)

### Étape 1 : Créer un compte MongoDB Atlas

1. Aller sur https://www.mongodb.com/cloud/atlas/register
2. Créer un compte gratuit
3. Créer un cluster gratuit (M0)
4. Créer un utilisateur de base de données :
   - Username: `oufarez`
   - Password: `oufarez2026` (ou votre choix)
5. Ajouter votre IP dans Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)

### Étape 2 : Obtenir l'URI de connexion

1. Dans Atlas, cliquer sur "Connect" sur votre cluster
2. Choisir "Connect your application"
3. Copier l'URI (ressemble à) :
   ```
   mongodb+srv://oufarez:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Étape 3 : Configurer le backend

```bash
cd backend
```

Créer/éditer le fichier `.env` :

```env
NODE_ENV=development
PORT=3000

# MongoDB Atlas
MONGODB_URI=mongodb+srv://oufarez:oufarez2026@cluster0.xxxxx.mongodb.net/documents_perdus?retryWrites=true&w=majority

# JWT
JWT_SECRET=changez-moi-production-cle-securisee-aleatoire-minimum-32-caracteres

# Admin
ADMIN_CODE=ADMIN2026

# Service IA (optionnel pour le backend seul)
AI_SERVICE_URL=http://localhost:8000
AI_TIMEOUT=30000

# CORS
CORS_ORIGIN=http://localhost:5173
```

⚠️ **Important** : Remplacer `xxxxx` par votre vrai cluster ID et ajuster le mot de passe.

### Étape 4 : Démarrer le serveur

```bash
# Dans le dossier backend
npm start

# Vous devriez voir :
# ✅ MongoDB connecté avec succès
# 🚀 Serveur lancé sur http://localhost:3000
```

### Étape 5 : Tester

```bash
# Dans un autre terminal
curl http://localhost:3000/health

# Réponse attendue :
# {"status":"healthy","timestamp":"...","uptime":...}
```

### Étape 6 : Migrer les anciennes données (optionnel)

```bash
cd backend
npm run migrate
```

---

## Alternative : Installer MongoDB localement

### Windows

1. Télécharger MongoDB Community Server :
   https://www.mongodb.com/try/download/community

2. Installer avec l'option "Complete"

3. Ajouter au PATH :
   ```
   C:\Program Files\MongoDB\Server\7.0\bin
   ```

4. Créer un dossier de données :
   ```bash
   mkdir C:\data\db
   ```

5. Démarrer MongoDB :
   ```bash
   mongod --dbpath C:\data\db
   ```

6. Dans `.env`, utiliser :
   ```env
   MONGODB_URI=mongodb://localhost:27017/documents_perdus
   ```

---

## Option Docker (Si vous voulez l'utiliser plus tard)

1. **Installer Docker Desktop** : https://www.docker.com/products/docker-desktop/

2. **Démarrer Docker Desktop**

3. **Lancer tous les services** :
   ```bash
   cd "Documents_perdus - V3"
   docker-compose up -d
   ```

---

## 🆘 En cas de problème

### Erreur "MongoNetworkError"
- Vérifier l'URI dans `.env`
- Vérifier que l'IP est autorisée dans Atlas
- Vérifier votre connexion internet

### Erreur "Authentication failed"
- Vérifier le username/password dans l'URI
- S'assurer que l'utilisateur existe dans Atlas

### Port 3000 déjà utilisé
- Changer le port dans `.env` : `PORT=3001`
- Ou arrêter le processus utilisant le port 3000

---

## 📚 Prochaines étapes

Une fois le backend qui fonctionne :

1. **Tester les endpoints** :
   - GET http://localhost:3000/
   - GET http://localhost:3000/health

2. **Créer les services manquants** :
   - declarationService.js
   - matchingService.js
   - notificationService.js

3. **Créer les routes** :
   - authRoutes.js
   - declarationRoutes.js
   - etc.

4. **Démarrer le service IA** (optionnel pour commencer) :
   ```bash
   cd apps/ai-service
   python -m venv venv
   venv\Scripts\activate
   pip install -r requirements.txt
   python -m spacy download fr_core_news_sm
   uvicorn app.main:app --reload --port 8000
   ```

Voir [NEXT_STEPS.md](NEXT_STEPS.md) pour le guide complet !
