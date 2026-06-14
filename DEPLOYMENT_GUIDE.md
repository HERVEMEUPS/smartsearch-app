# 🚀 Guide de Déploiement - OUFAREZ Documents Perdus

Guide complet pour déployer la plateforme en local et en production.

## 📋 Table des matières

- [Prérequis](#prérequis)
- [Déploiement Local](#déploiement-local)
- [Déploiement avec Docker](#déploiement-avec-docker)
- [Déploiement Production](#déploiement-production)
- [Configuration](#configuration)
- [Maintenance](#maintenance)
- [Troubleshooting](#troubleshooting)

## 🔧 Prérequis

### Logiciels requis

- **Node.js** ≥ 16.0.0 et npm ≥ 8.0.0
- **Python** ≥ 3.11
- **MongoDB** ≥ 7.0 (local ou MongoDB Atlas)
- **Docker** ≥ 24.0 (optionnel mais recommandé)
- **Docker Compose** ≥ 2.20 (optionnel)

### Comptes et API Keys

- **Anthropic Claude** ou **OpenAI GPT** (API Key requise)
- **SendGrid** (optionnel - pour les emails)
- **Twilio** (optionnel - pour les SMS)
- **MongoDB Atlas** (optionnel - pour la base de données cloud)

---

## 🏠 Déploiement Local (sans Docker)

### Étape 1 : Cloner et installer

```bash
# Cloner le projet
cd "Documents_perdus - V3"

# Installer les dépendances backend
cd backend
npm install
cd ..

# Installer les dépendances service IA
cd apps/ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download fr_core_news_sm
cd ../..
```

### Étape 2 : Configurer MongoDB

**Option A : MongoDB local**
```bash
# Démarrer MongoDB
mongod --dbpath /path/to/data --port 27017

# Créer la base de données
mongosh
> use documents_perdus
> db.createUser({
  user: "admin",
  pwd: "oufarez2026",
  roles: ["readWrite", "dbAdmin"]
})
```

**Option B : MongoDB Atlas (cloud)**
1. Créer un compte sur https://www.mongodb.com/cloud/atlas
2. Créer un cluster gratuit
3. Configurer les accès réseau (IP whitelist)
4. Obtenir l'URI de connexion

### Étape 3 : Configuration

```bash
# Copier les templates
cp .env.example .env
cp backend/.env.example backend/.env
cp apps/ai-service/.env.example apps/ai-service/.env

# Éditer .env et configurer :
# - MONGODB_URI
# - JWT_SECRET (générer une clé aléatoire)
# - LLM_API_KEY (Anthropic ou OpenAI)
```

**Générer un JWT_SECRET sécurisé :**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Étape 4 : Migration des données

```bash
cd backend
npm run migrate
# ✅ X utilisateurs migrés
# ✅ Y déclarations migrées
```

### Étape 5 : Démarrer les services

**Terminal 1 - Backend API :**
```bash
cd backend
npm run dev
# 🚀 Serveur sur http://localhost:3000
```

**Terminal 2 - Service IA :**
```bash
cd apps/ai-service
source venv/bin/activate
uvicorn app.main:app --reload --port 8000
# 🤖 Service IA sur http://localhost:8000
```

**Terminal 3 - Frontend (si disponible) :**
```bash
cd apps/web
npm run dev
# 🌐 Frontend sur http://localhost:5173
```

### Étape 6 : Vérification

```bash
# Tester le backend
curl http://localhost:3000/health

# Tester le service IA
curl http://localhost:8000/health
```

---

## 🐳 Déploiement avec Docker (Recommandé)

### Étape 1 : Configuration

```bash
# Copier le template
cp .env.example .env

# Éditer .env et configurer au minimum :
# - LLM_API_KEY
# - JWT_SECRET
```

### Étape 2 : Build et démarrage

```bash
# Build les images
docker-compose build

# Démarrer tous les services
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Vérifier le statut
docker-compose ps
```

### Étape 3 : Migration des données

```bash
# Exécuter la migration dans le container
docker-compose exec api npm run migrate
```

### Étape 4 : Accès aux services

- **Frontend** : http://localhost:5173
- **Backend API** : http://localhost:3000
- **Service IA** : http://localhost:8000
- **MongoDB** : localhost:27017

### Commandes Docker utiles

```bash
# Arrêter tous les services
docker-compose down

# Arrêter et supprimer les volumes
docker-compose down -v

# Redémarrer un service spécifique
docker-compose restart api

# Voir les logs d'un service
docker-compose logs -f api

# Entrer dans un container
docker-compose exec api sh
docker-compose exec ai-service bash

# Rebuilder après des changements
docker-compose up -d --build
```

---

## 🌐 Déploiement Production

### Architecture Production Recommandée

```
Internet
  ↓
[Cloudflare / Nginx Reverse Proxy]
  ↓
[Load Balancer]
  ├─→ [Frontend (Vercel/Netlify)]
  ├─→ [API Servers (2+ instances)]
  ├─→ [AI Service (2+ instances)]
  └─→ [MongoDB Atlas (Replica Set)]
```

### Option 1 : VPS (DigitalOcean, Linode, etc.)

**1. Préparer le serveur**

```bash
# SSH dans le serveur
ssh user@your-server-ip

# Mettre à jour
sudo apt update && sudo apt upgrade -y

# Installer Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Installer Docker Compose
sudo apt install docker-compose-plugin

# Installer Nginx
sudo apt install nginx certbot python3-certbot-nginx
```

**2. Cloner et configurer**

```bash
git clone https://github.com/votre-org/documents-perdus.git
cd documents-perdus

# Configuration production
cp .env.example .env
nano .env
# Configurer toutes les variables en mode production
```

**3. Déployer avec Docker**

```bash
# Build et démarrer
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Configurer Nginx comme reverse proxy
sudo nano /etc/nginx/sites-available/oufarez
```

**Configuration Nginx** :
```nginx
server {
    listen 80;
    server_name documents-perdus.oufarez.com;

    location / {
        proxy_pass http://localhost:5173;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $host;
    }
}
```

**4. SSL avec Let's Encrypt**

```bash
sudo certbot --nginx -d documents-perdus.oufarez.com
sudo systemctl restart nginx
```

**5. Monitoring et logs**

```bash
# Installer Prometheus + Grafana (optionnel)
docker-compose -f docker-compose.monitoring.yml up -d

# Configurer les alertes
# Voir logs centralisés
docker-compose logs -f --tail=100
```

### Option 2 : Cloud Managé (AWS, Azure, GCP)

**AWS Elastic Beanstalk / ECS**

1. Créer un Elastic Beanstalk application
2. Déployer avec Docker Compose
3. Configurer RDS pour MongoDB (ou MongoDB Atlas)
4. Ajouter un Load Balancer
5. Configurer CloudWatch pour les logs

**Vercel (Frontend uniquement)**

```bash
cd apps/web
vercel --prod
```

### Option 3 : Kubernetes (Production à grande échelle)

Voir `infra/k8s/` pour les manifestes Kubernetes.

---

## ⚙️ Configuration

### Variables d'environnement critiques

**Production obligatoire :**
```env
NODE_ENV=production
JWT_SECRET=<clé-très-sécurisée-64-caractères-minimum>
MONGODB_URI=mongodb+srv://...
LLM_API_KEY=<votre-clé-api>
```

**Sécurité :**
```env
BCRYPT_ROUNDS=12  # Augmenter en production
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50  # Réduire en production
```

**Performance :**
```env
AI_TIMEOUT=60000  # Augmenter si nécessaire
MATCH_THRESHOLD=0.75  # Ajuster selon les résultats
```

### Optimisations MongoDB

```javascript
// Créer les indexes manuellement si nécessaire
db.declarations.createIndex({ "localisation.geo": "2dsphere" })
db.declarations.createIndex({ type: 1, typeDocument: 1, dateEvenement: -1 })
db.correspondances.createIndex({ scoreGlobal: -1 })
```

---

## 🔧 Maintenance

### Backups MongoDB

**Script de backup automatique :**

```bash
#!/bin/bash
# backup-mongodb.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mongodb"

mkdir -p $BACKUP_DIR

docker-compose exec -T mongodb mongodump \
  --uri="mongodb://admin:oufarez2026@mongodb:27017" \
  --out=/tmp/backup

docker cp oufarez-mongodb:/tmp/backup $BACKUP_DIR/$DATE

# Garder seulement les 7 derniers backups
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup créé : $BACKUP_DIR/$DATE"
```

**Cron job (tous les jours à 2h) :**
```bash
crontab -e
0 2 * * * /path/to/backup-mongodb.sh
```

### Restauration

```bash
# Restaurer depuis un backup
docker-compose exec -T mongodb mongorestore \
  --uri="mongodb://admin:oufarez2026@mongodb:27017" \
  /path/to/backup
```

### Mises à jour

```bash
# 1. Backup avant mise à jour
./backup-mongodb.sh

# 2. Pull les nouvelles modifications
git pull origin main

# 3. Rebuild et redéployer
docker-compose build
docker-compose up -d

# 4. Vérifier les logs
docker-compose logs -f --tail=50

# 5. Tester les endpoints critiques
curl https://api.oufarez.com/health
```

### Monitoring

**Métriques à surveiller :**

- Taux d'erreur API (< 1%)
- Temps de réponse (p95 < 500ms)
- Utilisation CPU (< 70%)
- Utilisation mémoire (< 80%)
- Espace disque MongoDB (< 80%)
- Taux de matching réussi (> 60%)

**Alertes à configurer :**

- Service down > 2 minutes
- Erreur rate > 5%
- Latence > 2 secondes
- MongoDB connexion perdue

---

## 🆘 Troubleshooting

### Problème : MongoDB ne démarre pas

```bash
# Vérifier les logs
docker-compose logs mongodb

# Vérifier l'espace disque
df -h

# Redémarrer proprement
docker-compose down
docker volume prune
docker-compose up -d mongodb
```

### Problème : Service IA timeout

```bash
# Augmenter le timeout
AI_TIMEOUT=60000

# Vérifier les ressources
docker stats oufarez-ai

# Réduire les workers
# Dans Dockerfile : --workers 1
```

### Problème : Matching imprécis

```bash
# Ajuster les poids
WEIGHT_NLP=0.3
WEIGHT_LLM=0.6
WEIGHT_GEO=0.1

# Ajuster le seuil
MATCH_THRESHOLD=0.80  # Plus strict
```

### Problème : Erreur LLM API

```bash
# Vérifier la clé API
echo $LLM_API_KEY

# Tester manuellement
curl -X POST https://api.anthropic.com/v1/messages \
  -H "x-api-key: $LLM_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 10,
    "messages": [{"role": "user", "content": "Hello"}]
  }'

# Fallback sur OpenAI
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
```

### Logs et debugging

```bash
# Logs en temps réel
docker-compose logs -f

# Logs d'un service spécifique
docker-compose logs -f api

# Filtrer les erreurs
docker-compose logs | grep ERROR

# Exporter les logs
docker-compose logs > debug.log
```

---

## 📊 Checklist de déploiement production

- [ ] Variables d'environnement configurées
- [ ] JWT_SECRET changé et sécurisé
- [ ] MongoDB avec authentification activée
- [ ] Backups automatiques configurés
- [ ] SSL/HTTPS activé
- [ ] Rate limiting configuré
- [ ] CORS configuré correctement
- [ ] Monitoring en place
- [ ] Logs centralisés
- [ ] Alertes configurées
- [ ] Documentation à jour
- [ ] Tests E2E passés
- [ ] Plan de rollback défini

---

**Auteur** : HERVEMEUPS - OUFAREZ  
**Dernière mise à jour** : Juin 2026  
**Support** : support@oufarez.com
