# ⚡ Quick Start - Documents Perdus V3

**Démarrage ultra-rapide en 3 minutes !**

---

## 📥 Installation (2 minutes)

```bash
# 1. Aller dans le dossier backend
cd backend

# 2. Installer les dépendances
npm install

# 3. C'est tout ! Les fichiers .env et JSON sont déjà créés
```

---

## 🚀 Démarrage (30 secondes)

```bash
# Dans le dossier backend
npm start
```

Vous devriez voir :
```
Serveur lancé sur http://localhost:3000
```

---

## 🌐 Ouvrir l'application (10 secondes)

Ouvrir dans votre navigateur :
```
frontend/index.html
```

Ou avec Live Server si vous utilisez VS Code.

---

## 🧪 Test rapide (1 minute)

### 1. Créer un compte

1. Cliquer sur "Connexion" → "Créer un compte"
2. Remplir :
   - Username : **demo**
   - Password : **demo123**
   - Type : **Déclarant**
3. S'inscrire

### 2. Se connecter

1. Se connecter avec **demo** / **demo123**
2. Vous devriez voir "Connecté : demo" en haut à droite

### 3. Déclarer un document

1. Cliquer sur "📝 Déclarer un document"
2. Remplir :
   - Type : **Perdu**
   - Type doc : **CNI**
   - Nom : **DUPONT Jean**
   - Lieu : **Yaoundé**
   - Date : **Aujourd'hui**
3. Soumettre → Message de succès !

### 4. Rechercher

1. Cliquer sur "🔍 Rechercher un document"
2. Entrer dans le champ Nom : **DUPONT**
3. Rechercher
4. Votre document apparaît avec un score ! ✅

---

## ✅ Ça marche !

**Votre application est fonctionnelle !** 🎉

---

## 📚 Aller plus loin

| Document | Contenu |
|----------|---------|
| [README.md](README.md) | Vue d'ensemble et installation complète |
| [TEST_GUIDE.md](TEST_GUIDE.md) | 20 scénarios de test détaillés |
| [RAPPORT_PROJET.md](RAPPORT_PROJET.md) | Analyse technique complète |
| [backend/README.md](backend/README.md) | Documentation API |
| [CHANGELOG.md](CHANGELOG.md) | Historique des modifications |

---

## 🔑 Comptes de test disponibles

| Username | Password | Rôle |
|----------|----------|------|
| admin | admin123 | Admin |
| declarant1 | 1234 | Déclarant |

⚠️ À supprimer en production

---

## 🐛 Problème ?

### Le serveur ne démarre pas
```bash
cd backend
npm install
npm start
```

### Erreur de connexion
- Vérifier que le serveur tourne sur le port 3000
- Vérifier l'URL dans `frontend/script.js` : `http://localhost:3000`

### Pas de résultat de recherche
- Se reconnecter pour obtenir un nouveau token
- Vérifier qu'il y a des documents dans `backend/documents.json`

---

## 💡 Configuration rapide

### Changer le port du serveur
Éditer `backend/.env` :
```env
PORT=8080
```

### Changer le code admin
Éditer `backend/.env` :
```env
ADMIN_CODE=VotreCodeSecurise
```

### Changer le secret JWT
Éditer `backend/.env` :
```env
JWT_SECRET=VotreSecretComplexe123456789
```

---

## 🎯 Fonctionnalités principales

✅ **Authentification sécurisée** (JWT + bcrypt)  
✅ **Déclaration** de documents perdus/trouvés  
✅ **Recherche intelligente** avec scoring  
✅ **Gestion des rôles** (Admin / Déclarant)  
✅ **Interface responsive**  

---

## 📞 Besoin d'aide ?

- Consulter [TEST_GUIDE.md](TEST_GUIDE.md) pour les tests détaillés
- Consulter [backend/README.md](backend/README.md) pour l'API
- Consulter [RAPPORT_PROJET.md](RAPPORT_PROJET.md) pour l'architecture

---

**Bon développement ! 🚀**
