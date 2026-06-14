# 🧪 Guide de Test de l'API - OUFAREZ Documents Perdus

Guide complet pour tester tous les endpoints de l'API.

## 📋 Prérequis

- Backend démarré : `npm start` (port 3000)
- MongoDB connecté
- Outil de test : Postman, Insomnia, ou curl

---

## 1️⃣ Authentification

### 1.1 Inscription (Admin)

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@oufarez.com",
  "telephone": "+237600000001",
  "password": "admin123",
  "role": "admin",
  "adminCode": "ADMIN2026"
}
```

**Réponse attendue (201):**
```json
{
  "success": true,
  "message": "Compte créé avec succès",
  "data": {
    "username": "admin",
    "email": "admin@oufarez.com",
    "role": "admin"
  }
}
```

### 1.2 Inscription (Utilisateur normal)

```bash
POST http://localhost:3000/api/auth/register
Content-Type: application/json

{
  "username": "user1",
  "email": "user1@test.com",
  "telephone": "+237600000002",
  "password": "password123",
  "role": "declarant"
}
```

### 1.3 Connexion

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "username": "user1",
  "password": "password123"
}
```

**Réponse (200):**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {
      "username": "user1",
      "email": "user1@test.com",
      "role": "declarant"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

⚠️ **IMPORTANT** : Copier le `accessToken` pour les requêtes suivantes !

### 1.4 Obtenir le profil

```bash
GET http://localhost:3000/api/auth/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 2️⃣ Déclarations

### 2.1 Créer une déclaration de PERTE

```bash
POST http://localhost:3000/api/declarations
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "type": "PERTE",
  "typeDocument": "CNI",
  "description": "Perdu ma carte d'identité nationale au nom de NGOA Jean Pierre, numéro commençant par 123456. Perdue près du marché central de Yaoundé.",
  "nomPartiel": "NGOA Jean Pierre",
  "numeroPartiel": "123456",
  "dateEvenement": "2026-06-01T10:00:00Z",
  "localisation": {
    "ville": "Yaoundé",
    "quartier": "Centre-ville",
    "pointRepere": "Marché central"
  }
}
```

**Réponse (201):**
```json
{
  "success": true,
  "message": "Déclaration créée avec succès. Le matching automatique est en cours...",
  "data": {
    "_id": "6659a1b2c3d4e5f6g7h8i9j0",
    "type": "PERTE",
    "typeDocument": "CNI",
    "statut": "EN_ATTENTE",
    ...
  }
}
```

### 2.2 Créer une déclaration de DÉCOUVERTE

```bash
POST http://localhost:3000/api/declarations
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "type": "DECOUVERTE",
  "typeDocument": "CNI",
  "description": "Trouvé une CNI au nom de NGOA J.P. près du supermarché Casino. Document en bon état.",
  "nomPartiel": "NGOA",
  "numeroPartiel": "1234",
  "dateEvenement": "2026-06-01T14:00:00Z",
  "localisation": {
    "ville": "Yaoundé",
    "quartier": "Centre-ville",
    "pointRepere": "Casino supermarché"
  }
}
```

**Note** : Si la description correspond à une perte déjà déclarée, le matching IA se déclenche automatiquement en arrière-plan !

### 2.3 Lister toutes les déclarations

```bash
GET http://localhost:3000/api/declarations
Authorization: Bearer <votre_token>
```

**Avec filtres :**
```bash
GET http://localhost:3000/api/declarations?type=PERTE&ville=Yaoundé&page=1&limit=10
```

### 2.4 Mes déclarations

```bash
GET http://localhost:3000/api/declarations/mes-declarations
Authorization: Bearer <votre_token>
```

### 2.5 Obtenir une déclaration par ID

```bash
GET http://localhost:3000/api/declarations/6659a1b2c3d4e5f6g7h8i9j0
Authorization: Bearer <votre_token>
```

### 2.6 Mettre à jour une déclaration

```bash
PUT http://localhost:3000/api/declarations/6659a1b2c3d4e5f6g7h8i9j0
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "description": "Description mise à jour avec plus de détails...",
  "numeroPartiel": "123456789"
}
```

### 2.7 Supprimer une déclaration

```bash
DELETE http://localhost:3000/api/declarations/6659a1b2c3d4e5f6g7h8i9j0
Authorization: Bearer <votre_token>
```

### 2.8 Statistiques des déclarations

```bash
GET http://localhost:3000/api/declarations/statistiques
Authorization: Bearer <votre_token>
```

---

## 3️⃣ Correspondances (Matching)

### 3.1 Lister les correspondances

```bash
GET http://localhost:3000/api/correspondances
Authorization: Bearer <votre_token>
```

**Avec filtres :**
```bash
GET http://localhost:3000/api/correspondances?statut=PROPOSEE&minScore=0.8
```

### 3.2 Correspondances pour une déclaration

```bash
GET http://localhost:3000/api/correspondances/declaration/6659a1b2c3d4e5f6g7h8i9j0
Authorization: Bearer <votre_token>
```

### 3.3 Obtenir une correspondance par ID

```bash
GET http://localhost:3000/api/correspondances/665abc123def456ghi789jkl
Authorization: Bearer <votre_token>
```

### 3.4 Accepter une correspondance

```bash
POST http://localhost:3000/api/correspondances/665abc123def456ghi789jkl/accept
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "commentaire": "Oui, c'est bien mon document !"
}
```

### 3.5 Rejeter une correspondance

```bash
POST http://localhost:3000/api/correspondances/665abc123def456ghi789jkl/reject
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "commentaire": "Non, ce n'est pas le bon document"
}
```

### 3.6 Confirmer la récupération

```bash
POST http://localhost:3000/api/correspondances/665abc123def456ghi789jkl/confirm
Authorization: Bearer <votre_token>
```

### 3.7 Ajouter un feedback

```bash
POST http://localhost:3000/api/correspondances/665abc123def456ghi789jkl/feedback
Authorization: Bearer <votre_token>
Content-Type: application/json

{
  "pertinent": true,
  "commentaire": "Excellent matching ! Très précis."
}
```

### 3.8 Statistiques de matching

```bash
GET http://localhost:3000/api/correspondances/statistiques
Authorization: Bearer <votre_token>
```

---

## 4️⃣ Notifications

### 4.1 Mes notifications

```bash
GET http://localhost:3000/api/notifications
Authorization: Bearer <votre_token>
```

**Seulement non lues :**
```bash
GET http://localhost:3000/api/notifications?unreadOnly=true
```

### 4.2 Nombre de notifications non lues

```bash
GET http://localhost:3000/api/notifications/unread-count
Authorization: Bearer <votre_token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "count": 3
  }
}
```

### 4.3 Marquer une notification comme lue

```bash
PUT http://localhost:3000/api/notifications/665xyz789abc012def345ghi/read
Authorization: Bearer <votre_token>
```

### 4.4 Marquer toutes comme lues

```bash
PUT http://localhost:3000/api/notifications/mark-all-read
Authorization: Bearer <votre_token>
```

---

## 5️⃣ Administration (Admin uniquement)

### 5.1 Dashboard admin complet

```bash
GET http://localhost:3000/api/admin/dashboard
Authorization: Bearer <admin_token>
```

**Réponse :**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10,
      "active": 9,
      "byRole": {
        "admin": 1,
        "declarant": 9
      }
    },
    "declarations": {
      "total": 25,
      "byType": {
        "PERTE": 15,
        "DECOUVERTE": 10
      },
      "byStatut": {
        "EN_ATTENTE": 10,
        "EN_MATCH": 8,
        "CLOTUREE": 7
      }
    },
    "matching": {
      "total": 12,
      "highQuality": 8,
      "successRate": "58.33"
    }
  }
}
```

### 5.2 Liste des utilisateurs

```bash
GET http://localhost:3000/api/admin/users?page=1&limit=20
Authorization: Bearer <admin_token>
```

### 5.3 Désactiver un utilisateur

```bash
PUT http://localhost:3000/api/admin/users/6659a1b2c3d4e5f6g7h8i9j0/deactivate
Authorization: Bearer <admin_token>
```

### 5.4 Statistiques utilisateurs

```bash
GET http://localhost:3000/api/admin/statistics/users
Authorization: Bearer <admin_token>
```

### 5.5 Statistiques déclarations

```bash
GET http://localhost:3000/api/admin/statistics/declarations?dateDebut=2026-01-01&dateFin=2026-12-31
Authorization: Bearer <admin_token>
```

### 5.6 Statistiques matching

```bash
GET http://localhost:3000/api/admin/statistics/matching
Authorization: Bearer <admin_token>
```

---

## 📝 Scénario de Test Complet

### Étape 1 : Créer 2 utilisateurs

```bash
# Utilisateur 1 (a perdu son document)
POST /api/auth/register
{
  "username": "alice",
  "email": "alice@test.com",
  "password": "alice123",
  "role": "declarant"
}

# Utilisateur 2 (a trouvé un document)
POST /api/auth/register
{
  "username": "bob",
  "email": "bob@test.com",
  "password": "bob123",
  "role": "declarant"
}
```

### Étape 2 : Alice déclare une perte

```bash
# Se connecter en tant qu'Alice
POST /api/auth/login
{
  "username": "alice",
  "password": "alice123"
}

# Créer une déclaration de perte
POST /api/declarations
Authorization: Bearer <alice_token>
{
  "type": "PERTE",
  "typeDocument": "CNI",
  "description": "Perdu ma CNI au nom de ALICE DUPONT, numéro 987654321",
  "nomPartiel": "ALICE DUPONT",
  "numeroPartiel": "987654",
  "dateEvenement": "2026-06-05T10:00:00Z",
  "localisation": {
    "ville": "Douala",
    "quartier": "Akwa"
  }
}
```

### Étape 3 : Bob déclare une découverte

```bash
# Se connecter en tant qu'Bob
POST /api/auth/login
{
  "username": "bob",
  "password": "bob123"
}

# Créer une déclaration de découverte
POST /api/declarations
Authorization: Bearer <bob_token>
{
  "type": "DECOUVERTE",
  "typeDocument": "CNI",
  "description": "Trouvé une CNI au nom de ALICE D., numéro 9876...",
  "nomPartiel": "ALICE",
  "numeroPartiel": "9876",
  "dateEvenement": "2026-06-05T14:00:00Z",
  "localisation": {
    "ville": "Douala",
    "quartier": "Akwa"
  }
}
```

⚡ **Automatique** : Le matching IA se déclenche et crée une correspondance !

### Étape 4 : Vérifier les notifications

```bash
# Alice vérifie ses notifications
GET /api/notifications
Authorization: Bearer <alice_token>

# Elle voit : "🎉 Correspondance trouvée ! Score: 87%"
```

### Étape 5 : Consulter la correspondance

```bash
# Alice consulte les correspondances pour sa déclaration
GET /api/correspondances/declaration/<id_declaration_alice>
Authorization: Bearer <alice_token>

# Elle voit les détails du matching avec le score IA
```

### Étape 6 : Accepter et confirmer

```bash
# Alice accepte la correspondance
POST /api/correspondances/<id_correspondance>/accept
Authorization: Bearer <alice_token>

# Après avoir récupéré son document, elle confirme
POST /api/correspondances/<id_correspondance>/confirm
Authorization: Bearer <alice_token>
```

### Étape 7 : Bob reçoit une notification

```bash
# Bob vérifie ses notifications
GET /api/notifications
Authorization: Bearer <bob_token>

# Il voit : "✅ Récupération confirmée. Merci !"
```

---

## 🐛 Codes d'erreur courants

| Code | Message | Solution |
|------|---------|----------|
| 400 | Champs manquants | Vérifier le body de la requête |
| 401 | Token manquant | Ajouter `Authorization: Bearer <token>` |
| 403 | Token invalide/expiré | Se reconnecter pour obtenir un nouveau token |
| 403 | Accès refusé | Vérifier les permissions (admin requis) |
| 404 | Route non trouvée | Vérifier l'URL |
| 404 | Ressource non trouvée | Vérifier l'ID |
| 409 | Utilisateur déjà existant | Choisir un autre username/email |
| 429 | Trop de requêtes | Attendre quelques minutes (rate limiting) |
| 500 | Erreur serveur | Vérifier les logs du serveur |

---

## 📊 Collection Postman

Vous pouvez importer cette collection dans Postman pour tester rapidement.

**Fichier** : `postman_collection.json` (à créer)

---

## ✅ Checklist de Test

- [ ] Inscription admin
- [ ] Inscription utilisateur
- [ ] Connexion
- [ ] Créer déclaration perte
- [ ] Créer déclaration découverte
- [ ] Vérifier le matching automatique
- [ ] Consulter les correspondances
- [ ] Accepter une correspondance
- [ ] Confirmer la récupération
- [ ] Vérifier les notifications
- [ ] Dashboard admin
- [ ] Statistiques

---

**Note** : Pour tester le module IA, il doit être démarré séparément sur le port 8000.
