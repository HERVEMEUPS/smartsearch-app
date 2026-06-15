# 🧪 Tests à Effectuer - SmartSearch V3

## 📅 Date : 15 juin 2026

## ✅ Statut du Push
- ✅ **Frontend** : Pusheé sur GitHub
- ✅ **Backend** : Pusheé sur GitHub
- ✅ **Documentation** : Pushée sur GitHub

## 🔗 URLs de Production

| Service | URL | Statut |
|---------|-----|--------|
| **Backend API** | `https://smartsearch-backend-pxw5.onrender.com` | 🟢 Production |
| **Frontend** | Fichiers locaux ou hébergement statique | 🟡 Local |
| **MongoDB** | MongoDB Atlas | 🟢 Production |
| **GitHub Repo** | `github.com/HERVEMEUPS/smartsearch-app` | 🟢 Push OK |

---

## 🧪 PLAN DE TESTS

### ⚡ Test 1 : Vérification Backend (Health Check)

**Objectif :** S'assurer que le backend est en ligne et répond

**Commande :**
```bash
curl https://smartsearch-backend-pxw5.onrender.com/health
```

**Résultat attendu :**
```json
{
  "status": "OK",
  "timestamp": "2026-06-15T..."
}
```

**Note :** Le backend Render free tier se met en veille après 15 minutes d'inactivité. La première requête peut prendre 30-60 secondes pour réveiller le service.

---

### 🔐 Test 2 : Authentification

#### 2A. Connexion avec compte existant

**URL :** `https://smartsearch-backend-pxw5.onrender.com/api/auth/login`

**Méthode :** POST

**Body :**
```json
{
  "username": "testuser",
  "password": "Test@123"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "username": "testuser",
      "email": "test@example.com",
      "role": "user"
    }
  }
}
```

**Test cURL :**
```bash
curl -X POST https://smartsearch-backend-pxw5.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"Test@123"}'
```

---

### 📝 Test 3 : Déclaration d'un Document PERDU

**Objectif :** Vérifier que la nomenclature PERTE est correctement utilisée

**URL :** `https://smartsearch-backend-pxw5.onrender.com/api/declarations`

**Méthode :** POST

**Headers :**
```
Authorization: Bearer <votre_token>
Content-Type: application/json
```

**Body :**
```json
{
  "type": "PERTE",
  "typeDocument": "CNI",
  "nomPartiel": "DUPONT Jean",
  "numeroPartiel": "123456789",
  "localisation": {
    "ville": "Yaoundé",
    "quartier": "Essos"
  },
  "dateEvenement": "2026-06-15",
  "description": "Carte d'identité perdue au marché central"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Déclaration créée avec succès...",
  "data": {
    "_id": "...",
    "type": "PERTE",  // ✅ Doit être "PERTE" et pas "perdu"
    "typeDocument": "CNI",
    "nomPartiel": "DUPONT Jean",
    "statut": "EN_ATTENTE"
  }
}
```

**✅ VÉRIFICATION CLÉS :**
- `type` doit être exactement `"PERTE"` (pas `"perdu"`)
- `typeDocument` doit être `"CNI"` (majuscules)

---

### ✅ Test 4 : Déclaration d'un Document TROUVÉ

**Body :**
```json
{
  "type": "DECOUVERTE",
  "typeDocument": "CNI",
  "nomPartiel": "DUPONT Jean",
  "numeroPartiel": "123456789",
  "localisation": {
    "ville": "Yaoundé",
    "quartier": "Centre-ville"
  },
  "dateEvenement": "2026-06-16",
  "description": "Carte d'identité trouvée près du marché"
}
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "type": "DECOUVERTE",  // ✅ Doit être "DECOUVERTE" et pas "trouve"
    "typeDocument": "CNI"
  }
}
```

---

### 🔍 Test 5 : Recherche par Type PERTE

**Objectif :** Vérifier que la recherche filtre correctement par type

**URL :** `https://smartsearch-backend-pxw5.onrender.com/api/declarations?type=PERTE`

**Méthode :** GET

**Headers :**
```
Authorization: Bearer <votre_token>
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "type": "PERTE",  // ✅ Tous les résultats doivent avoir type: "PERTE"
      "typeDocument": "CNI",
      "nomPartiel": "DUPONT Jean",
      // ...
    }
  ],
  "pagination": {
    "total": 1,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Test cURL :**
```bash
curl -X GET "https://smartsearch-backend-pxw5.onrender.com/api/declarations?type=PERTE" \
  -H "Authorization: Bearer <votre_token>"
```

**✅ VÉRIFICATION CLÉS :**
- Tous les documents retournés doivent avoir `type: "PERTE"`
- Aucun document avec `type: "DECOUVERTE"` ne doit apparaître

---

### 🔍 Test 6 : Recherche par Type DECOUVERTE

**URL :** `https://smartsearch-backend-pxw5.onrender.com/api/declarations?type=DECOUVERTE`

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "type": "DECOUVERTE",  // ✅ Uniquement DECOUVERTE
      "typeDocument": "CNI"
    }
  ]
}
```

---

### 🔍 Test 7 : Recherche Combinée (Type + Nom)

**URL :** `https://smartsearch-backend-pxw5.onrender.com/api/declarations?type=PERTE&search=DUPONT`

**Résultat attendu :**
```json
{
  "success": true,
  "data": [
    {
      "type": "PERTE",
      "nomPartiel": "DUPONT Jean"
    }
  ]
}
```

---

### 🎯 Test 8 : Matching Automatique

**Objectif :** Vérifier que le système détecte automatiquement les correspondances PERTE ↔ DECOUVERTE

**Pré-requis :**
1. Avoir déclaré un document PERTE (Test 3)
2. Avoir déclaré un document DECOUVERTE similaire (Test 4)

**URL :** `https://smartsearch-backend-pxw5.onrender.com/api/matching/auto`

**Méthode :** GET

**Headers :**
```
Authorization: Bearer <admin_token>
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Matching terminé",
  "data": {
    "correspondancesTrouvées": 1,
    "nouveauxMatches": 1
  }
}
```

**Vérification MongoDB :**
```javascript
// Dans MongoDB Compass ou Shell
db.correspondances.find({}).pretty()

// Résultat attendu :
{
  "_id": ObjectId("..."),
  "declarationPerte": ObjectId("..."),
  "declarationDecouverte": ObjectId("..."),
  "scoreCorrespondance": 95,
  "statut": "EN_ATTENTE",
  "detailsMatch": [
    "Même type de document",
    "Nom similaire (100%)",
    "Numéro identique",
    "Dates proches"
  ]
}
```

---

### 📊 Test 9 : Statistiques Admin

**Objectif :** Vérifier les statistiques du dashboard

**URL :** `https://smartsearch-backend-pxw5.onrender.com/api/admin/stats`

**Méthode :** GET

**Headers :**
```
Authorization: Bearer <admin_token>
```

**Résultat attendu :**
```json
{
  "success": true,
  "data": {
    "total": 2,
    "perdus": 1,
    "trouves": 1,
    "correspondances": 1,
    "tauxRecuperation": 100,
    "parType": [
      ["CNI", 2],
      ["PASSEPORT", 0]
    ]
  }
}
```

---

### 🌐 Test 10 : Frontend Local

**Objectif :** Tester l'interface utilisateur

#### 10A. Ouvrir l'application
```bash
cd frontend
# Option 1 : Ouvrir directement
start index.html

# Option 2 : Serveur local
python -m http.server 8000
# Puis ouvrir http://localhost:8000
```

#### 10B. Connexion
1. Ouvrir `login.html`
2. Se connecter avec :
   - Username : `testuser`
   - Password : `Test@123`
3. ✅ Vérifier la redirection vers `index.html`
4. ✅ Vérifier l'affichage du nom d'utilisateur

#### 10C. Déclaration
1. Aller sur `declaration.html`
2. Remplir :
   - Type : "📍 Perdu"
   - Type doc : "CNI"
   - Nom : "TEST User"
   - Lieu : "Yaoundé"
   - Date : Aujourd'hui
   - Description : "Test de déclaration"
3. ✅ Cliquer "Soumettre"
4. ✅ Vérifier le message "Déclaration enregistrée"

#### 10D. Recherche
1. Aller sur `recherche.html`
2. Sélectionner :
   - Type : "📍 Perdu"
3. ✅ Cliquer "🔍 Rechercher"
4. ✅ Vérifier que les résultats s'affichent
5. ✅ Vérifier le badge "📍 PERDU" (rouge)
6. ✅ Vérifier que `type: "PERTE"` dans les données

---

## ✅ CHECKLIST FINALE

### Backend
- [ ] Backend répond (health check OK)
- [ ] Connexion fonctionne (token reçu)
- [ ] Déclaration PERTE enregistrée avec `type: "PERTE"` ✅
- [ ] Déclaration DECOUVERTE enregistrée avec `type: "DECOUVERTE"` ✅
- [ ] Recherche PERTE retourne uniquement `type: "PERTE"` ✅
- [ ] Recherche DECOUVERTE retourne uniquement `type: "DECOUVERTE"` ✅
- [ ] Matching automatique détecte correspondances ✅
- [ ] Statistiques calculent correctement ✅

### Frontend
- [ ] Connexion fonctionne
- [ ] Formulaire déclaration envoie `type: "PERTE"` ou `"DECOUVERTE"`
- [ ] Formulaire recherche filtre correctement
- [ ] Résultats s'affichent avec badge correct
- [ ] Badge "📍 PERDU" pour type PERTE
- [ ] Badge "✅ TROUVÉ" pour type DECOUVERTE

### Cohérence
- [ ] Pas de conversion `perdu`/`trouve` dans les réponses API
- [ ] MongoDB stocke uniquement `PERTE` et `DECOUVERTE`
- [ ] Frontend lit correctement `doc.type === 'PERTE'`

---

## 🐛 Problèmes Courants

### Problème 1 : Backend ne répond pas
**Cause :** Render free tier en veille  
**Solution :** Attendre 30-60 secondes, réessayer

### Problème 2 : Erreur 401 (Unauthorized)
**Cause :** Token expiré ou invalide  
**Solution :** Se reconnecter pour obtenir un nouveau token

### Problème 3 : Aucun résultat dans la recherche
**Cause :** Aucune donnée en base ou filtres trop restrictifs  
**Solution :** 
1. Déclarer d'abord des documents
2. Essayer de rechercher sans filtres

### Problème 4 : CORS Error
**Cause :** Frontend sur un domaine non autorisé  
**Solution :** 
1. Vérifier `CORS_ORIGIN` dans `.env` backend
2. Utiliser `localhost` ou domaine autorisé

---

## 📝 Rapport de Tests

### Template de Rapport

```markdown
# Rapport de Tests - SmartSearch V3
Date : [Date]
Testeur : NGOA

## Tests Backend
- [ ] Test 1 : Health Check - ✅ OK / ❌ Échec
- [ ] Test 2 : Authentification - ✅ OK / ❌ Échec
- [ ] Test 3 : Déclaration PERTE - ✅ OK / ❌ Échec
- [ ] Test 4 : Déclaration DECOUVERTE - ✅ OK / ❌ Échec
- [ ] Test 5 : Recherche PERTE - ✅ OK / ❌ Échec
- [ ] Test 6 : Recherche DECOUVERTE - ✅ OK / ❌ Échec
- [ ] Test 7 : Recherche combinée - ✅ OK / ❌ Échec
- [ ] Test 8 : Matching auto - ✅ OK / ❌ Échec
- [ ] Test 9 : Statistiques - ✅ OK / ❌ Échec

## Tests Frontend
- [ ] Test 10A : Ouverture app - ✅ OK / ❌ Échec
- [ ] Test 10B : Connexion - ✅ OK / ❌ Échec
- [ ] Test 10C : Déclaration - ✅ OK / ❌ Échec
- [ ] Test 10D : Recherche - ✅ OK / ❌ Échec

## Vérification Nomenclature
- [ ] Backend utilise PERTE/DECOUVERTE - ✅ OK / ❌ Échec
- [ ] Frontend affiche correctement - ✅ OK / ❌ Échec
- [ ] Pas de conversion perdu/trouve - ✅ OK / ❌ Échec

## Conclusion
[Résumé des tests]
```

---

**Auteur :** NGOA (HERVEMEUPS)  
**Projet :** SmartSearch V3 - Master 2 SIGL  
**Date :** 15 juin 2026
