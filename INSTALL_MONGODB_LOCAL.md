# 💾 Installation MongoDB Local - Windows

## Méthode 1 : Installation Standard (Recommandé)

### 1. Télécharger MongoDB

Aller sur : https://www.mongodb.com/try/download/community

**Sélectionner** :
- Version : 7.0.x (latest)
- Platform : Windows
- Package : msi

**Cliquer sur** "Download"

### 2. Installer MongoDB

1. **Lancer** le fichier `.msi` téléchargé
2. **Choisir** "Complete" installation
3. **Cocher** "Install MongoDB as a Service"
4. **Cocher** "Install MongoDB Compass" (GUI optionnel)
5. **Terminer** l'installation

### 3. Vérifier l'installation

Ouvrir PowerShell ou CMD :

```bash
mongod --version
```

Si la commande ne fonctionne pas, ajouter au PATH :
- Aller dans "Variables d'environnement système"
- Ajouter : `C:\Program Files\MongoDB\Server\7.0\bin`

### 4. Créer le répertoire de données

```bash
mkdir C:\data\db
```

### 5. Démarrer MongoDB

**Option A : Service (automatique)**
```bash
net start MongoDB
```

**Option B : Manuel**
```bash
mongod --dbpath C:\data\db
```

### 6. Tester la connexion

```bash
mongosh
```

Vous devriez voir :
```
Current Mongosh Log ID: ...
Connecting to: mongodb://127.0.0.1:27017
Using MongoDB: 7.0.x
```

---

## Méthode 2 : Installation avec Chocolatey

Si vous avez Chocolatey installé :

```bash
choco install mongodb
```

Puis :
```bash
mkdir C:\data\db
net start MongoDB
```

---

## Méthode 3 : Docker (Plus Simple)

### 1. Démarrer Docker Desktop

Cliquer sur l'icône Docker dans la barre des tâches.

### 2. Lancer MongoDB

```bash
docker run -d --name oufarez-mongodb -p 27017:27017 mongo:7.0
```

### 3. Vérifier

```bash
docker ps
```

Vous devriez voir le container `oufarez-mongodb` en cours d'exécution.

---

## Configuration Backend

Une fois MongoDB démarré (par n'importe quelle méthode), votre fichier `backend\.env` est déjà configuré :

```env
MONGODB_URI=mongodb://localhost:27017/documents_perdus
```

## Démarrer le Backend

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
🌐 Host: localhost
📡 URL: http://localhost:3000
```

---

## 🧪 Tester

### Test 1 : API Health Check

```bash
curl http://localhost:3000/health
```

### Test 2 : Créer un compte

```bash
curl -X POST http://localhost:3000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"test\",\"email\":\"test@test.com\",\"password\":\"test123\",\"role\":\"declarant\"}"
```

### Test 3 : Voir dans MongoDB

Si vous avez installé MongoDB Compass (GUI) :

1. Ouvrir MongoDB Compass
2. Connexion : `mongodb://localhost:27017`
3. Voir la base : `documents_perdus`
4. Voir la collection : `users`

---

## 🆘 Problèmes Courants

### Erreur : "mongod n'est pas reconnu"

**Solution** : Ajouter au PATH
1. Rechercher "Variables d'environnement"
2. Modifier PATH
3. Ajouter : `C:\Program Files\MongoDB\Server\7.0\bin`
4. Redémarrer le terminal

### Erreur : "Port 27017 déjà utilisé"

**Solution** : Un MongoDB est déjà en cours

```bash
# Arrêter le service
net stop MongoDB

# OU trouver et tuer le processus
tasklist | findstr mongod
taskkill /F /PID <pid>
```

### Erreur : "Access denied to C:\data\db"

**Solution** : Lancer le terminal en administrateur

```bash
# Puis recréer le dossier
mkdir C:\data\db
```

---

## 📊 Commandes Utiles

### Démarrer MongoDB
```bash
net start MongoDB
```

### Arrêter MongoDB
```bash
net stop MongoDB
```

### Voir le statut
```bash
sc query MongoDB
```

### Se connecter avec le shell
```bash
mongosh
```

### Voir les bases de données
```javascript
show dbs
```

### Utiliser la base
```javascript
use documents_perdus
```

### Voir les collections
```javascript
show collections
```

### Voir les utilisateurs
```javascript
db.users.find().pretty()
```

---

## ⚡ Temps d'Installation

- **Téléchargement** : 2-5 minutes
- **Installation** : 3-5 minutes
- **Configuration** : 1 minute
- **Total** : ~10 minutes

---

## 💡 Recommandation

Pour le **développement local** : MongoDB local ou Docker
Pour la **production** : MongoDB Atlas (cloud)

**MongoDB local** est parfait pour développer sans connexion internet !
