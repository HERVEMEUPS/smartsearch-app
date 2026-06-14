# 🧪 Guide de test - Documents Perdus V3

Ce document fournit une procédure complète pour tester toutes les fonctionnalités de l'application.

---

## 🚀 Préparation

### 1. Démarrer le serveur backend

```bash
cd backend
npm start
```

Vous devriez voir :
```
Serveur lancé sur http://localhost:3000
```

### 2. Ouvrir le frontend

Ouvrir `frontend/index.html` dans votre navigateur.

---

## 📋 SCÉNARIOS DE TEST

### ✅ TEST 1 : Inscription d'un déclarant

**Objectif :** Créer un nouveau compte déclarant

1. Cliquer sur "Connexion" puis "Créer un compte"
2. Remplir le formulaire :
   - **Nom d'utilisateur :** test_declarant
   - **Mot de passe :** test123456
   - **Type de compte :** Déclarant
3. Cliquer sur "S'inscrire"

**Résultat attendu :**
- ✅ Message "Compte créé avec succès !"
- ✅ Redirection vers la page de connexion

**Vérification backend :**
```bash
cat backend/users.json
```
Le nouvel utilisateur doit apparaître avec un mot de passe haché.

---

### ✅ TEST 2 : Inscription d'un administrateur

**Objectif :** Créer un compte admin avec le code

1. Retourner sur la page d'inscription
2. Remplir le formulaire :
   - **Nom d'utilisateur :** test_admin
   - **Mot de passe :** admin123456
   - **Type de compte :** Administrateur
   - **Code administrateur :** ADMIN2026 (ou votre code dans .env)
3. Cliquer sur "S'inscrire"

**Résultat attendu :**
- ✅ Compte créé avec succès
- ✅ Redirection vers login

**Test négatif :**
- Réessayer avec un mauvais code admin
- ❌ Message d'erreur "Code administrateur incorrect"

---

### ✅ TEST 3 : Connexion

**Objectif :** Se connecter avec un compte créé

1. Page de connexion
2. Entrer :
   - **Username :** test_declarant
   - **Password :** test123456
3. Cliquer sur "Se connecter"

**Résultat attendu :**
- ✅ Redirection vers `index.html`
- ✅ Affichage "Connecté : test_declarant" en haut à droite
- ✅ Bouton "Déconnexion" visible

**Test négatif :**
- Essayer avec un mauvais mot de passe
- ❌ Message "Identifiants incorrects"

---

### ✅ TEST 4 : Déclaration d'un document perdu

**Objectif :** Déclarer un document perdu

1. Connecté en tant que test_declarant
2. Cliquer sur "📝 Déclarer un document"
3. Remplir le formulaire :
   - **Type de déclaration :** Perdu
   - **Type de document :** CNI
   - **Nom du propriétaire :** NGOA Martin
   - **Numéro du document :** 123456789
   - **Lieu :** Yaoundé
   - **Date :** 2026-06-06
   - **Description :** Carte d'identité perdue au marché central
4. Cliquer sur "Soumettre"

**Résultat attendu :**
- ✅ Message "Déclaration enregistrée"
- ✅ Formulaire vidé automatiquement

**Vérification backend :**
```bash
cat backend/documents.json
```
Le document doit apparaître avec :
- `declarantId`
- `declarantUsername`
- `dateDeclaration`

---

### ✅ TEST 5 : Déclaration d'un document trouvé

**Objectif :** Déclarer un document trouvé

1. Retourner sur la page de déclaration
2. Remplir :
   - **Type :** Trouvé
   - **Type doc :** Passeport
   - **Nom :** FOSSI Claire
   - **Lieu :** Douala
   - **Date :** 2026-06-05
3. Soumettre

**Résultat attendu :**
- ✅ Déclaration enregistrée

---

### ✅ TEST 6 : Recherche par nom

**Objectif :** Rechercher un document par nom

1. Cliquer sur "🔍 Rechercher un document"
2. Entrer uniquement :
   - **Nom :** NGOA
3. Cliquer sur "🔍 Rechercher"

**Résultat attendu :**
- ✅ Le document de NGOA Martin apparaît
- ✅ Score visible : 4
- ✅ Affichage : Type, Nom, Numéro, Lieu, Date

---

### ✅ TEST 7 : Recherche par type exact

**Objectif :** Rechercher par type de document

1. Page de recherche
2. Entrer :
   - **Type de document :** CNI
3. Rechercher

**Résultat attendu :**
- ✅ Tous les documents de type "CNI" apparaissent
- ✅ Score : 3 (type exact)

---

### ✅ TEST 8 : Recherche par numéro exact

**Objectif :** Rechercher par numéro (score le plus élevé)

1. Page de recherche
2. Entrer :
   - **Numéro :** 123456789
3. Rechercher

**Résultat attendu :**
- ✅ Document trouvé
- ✅ Score : 5 (numéro exact = meilleur score)

---

### ✅ TEST 9 : Recherche multi-critères

**Objectif :** Combiner plusieurs filtres

1. Page de recherche
2. Entrer :
   - **Type de déclaration :** Perdu
   - **Type de document :** CNI
   - **Nom :** NGOA
   - **Lieu :** Yaoundé
   - **Date début :** 2026-06-01
   - **Date fin :** 2026-06-07
3. Rechercher

**Résultat attendu :**
- ✅ Le document de NGOA Martin apparaît
- ✅ Score cumulé : 3 (type) + 4 (nom) = 7

**Vérification du scoring :**
- Numéro exact : +5
- Nom contient : +4
- Type exact : +3
- Seuil minimum : 3

---

### ✅ TEST 10 : Recherche sans résultat

**Objectif :** Tester le cas où aucun document ne correspond

1. Page de recherche
2. Entrer :
   - **Nom :** XXXX_INEXISTANT
3. Rechercher

**Résultat attendu :**
- ✅ Message "Aucun document trouvé"

---

### ✅ TEST 11 : Filtrage par date

**Objectif :** Filtrer par période

1. Page de recherche
2. Entrer :
   - **Date début :** 2026-06-05
   - **Date fin :** 2026-06-05
3. Rechercher

**Résultat attendu :**
- ✅ Seuls les documents du 5 juin 2026 apparaissent
- ❌ Les documents du 6 juin n'apparaissent PAS

---

### ✅ TEST 12 : Expiration du token JWT

**Objectif :** Tester l'expiration de la session

**Note :** Le token expire après 24h. Pour tester immédiatement :

1. Connecté, ouvrir la console du navigateur (F12)
2. Exécuter :
```javascript
localStorage.setItem("token", "faux_token_invalide")
```
3. Essayer de déclarer un document

**Résultat attendu :**
- ✅ Message "Session expirée. Veuillez vous reconnecter."
- ✅ Redirection automatique vers login
- ✅ localStorage vidé

---

### ✅ TEST 13 : Déconnexion

**Objectif :** Se déconnecter proprement

1. Connecté, cliquer sur le bouton "Déconnexion" en haut à droite
2. Vérifier la redirection vers login

**Résultat attendu :**
- ✅ Message "Déconnexion réussie"
- ✅ Redirection vers login.html
- ✅ localStorage vidé (vérifier dans F12 > Application > Local Storage)

---

### ✅ TEST 14 : Accès non authentifié

**Objectif :** Vérifier que les routes sont protégées

1. Déconnecté, essayer d'accéder directement à `declaration.html`
2. Ou bien, en JavaScript :
```javascript
fetch("http://localhost:3000/declaration", {
  method: "POST",
  headers: {"Content-Type": "application/json"},
  body: JSON.stringify({typeDocument: "Test"})
})
```

**Résultat attendu :**
- ✅ Redirection vers login avec message
- ✅ Ou erreur 401 "Token d'authentification manquant"

---

### ✅ TEST 15 : Validation côté serveur

**Objectif :** Tester la validation des champs

1. Connecté, ouvrir la console (F12)
2. Exécuter :
```javascript
const token = localStorage.getItem("token");
fetch("http://localhost:3000/declaration", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
  },
  body: JSON.stringify({nom: "TEST"}) // Champs requis manquants
}).then(r => r.json()).then(console.log)
```

**Résultat attendu :**
- ❌ Erreur 400
- ✅ Message : "Champs manquants: typeDocument, typeDeclaration, lieu, date"

---

### ✅ TEST 16 : Mot de passe trop court

**Objectif :** Validation de la longueur du mot de passe

1. Page d'inscription
2. Entrer :
   - Username : test
   - Password : 123 (seulement 3 caractères)
   - Role : Déclarant
3. S'inscrire

**Résultat attendu :**
- ❌ Erreur
- ✅ Message : "Le mot de passe doit faire au moins 6 caractères"

---

### ✅ TEST 17 : Username déjà existant

**Objectif :** Empêcher les doublons

1. Essayer de créer un compte avec un username déjà pris (ex: test_declarant)

**Résultat attendu :**
- ❌ Erreur 400
- ✅ Message : "Utilisateur déjà existant"

---

### ✅ TEST 18 : Route admin (GET /documents)

**Objectif :** Vérifier que seuls les admins peuvent accéder

**Test avec compte admin :**
1. Se connecter en tant que test_admin (ou admin)
2. Ouvrir la console (F12)
3. Exécuter :
```javascript
const token = localStorage.getItem("token");
fetch("http://localhost:3000/documents", {
  headers: {"Authorization": `Bearer ${token}`}
})
.then(r => r.json())
.then(console.log)
```

**Résultat attendu :**
- ✅ Liste complète de tous les documents

**Test avec compte déclarant :**
1. Se connecter en tant que test_declarant
2. Exécuter le même code

**Résultat attendu :**
- ❌ Erreur 403
- ✅ Message : "Accès réservé aux administrateurs"

---

### ✅ TEST 19 : Mot de passe haché

**Objectif :** Vérifier que les mots de passe ne sont jamais en clair

1. Ouvrir `backend/users.json`
2. Chercher le champ `password` de n'importe quel utilisateur

**Résultat attendu :**
- ✅ Format : `$2b$10$hashbcryptavecpleindecaracteresaleatoires...`
- ❌ PAS le mot de passe en clair

---

### ✅ TEST 20 : Recherche sensible à la casse (partiellement)

**Objectif :** Vérifier la recherche insensible à la casse

1. Rechercher avec **nom :** ngoa (minuscules)
2. Le document de NGOA Martin (majuscules) doit être trouvé

**Résultat attendu :**
- ✅ Document trouvé malgré la différence de casse

---

## 🔧 Tests avec outils (optionnel)

### Test API avec curl

**Login :**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test_declarant","password":"test123456"}'
```

**Déclaration (avec token) :**
```bash
TOKEN="votre_token_ici"
curl -X POST http://localhost:3000/declaration \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "typeDeclaration":"perdu",
    "typeDocument":"CNI",
    "nom":"TEST CURL",
    "lieu":"Test",
    "date":"2026-06-06"
  }'
```

**Recherche :**
```bash
curl "http://localhost:3000/recherche?nom=TEST" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Checklist finale

- [ ] ✅ Inscription déclarant fonctionne
- [ ] ✅ Inscription admin avec code fonctionne
- [ ] ✅ Connexion réussie
- [ ] ✅ Déconnexion fonctionne
- [ ] ✅ Déclaration document perdu
- [ ] ✅ Déclaration document trouvé
- [ ] ✅ Recherche par nom
- [ ] ✅ Recherche par type
- [ ] ✅ Recherche par numéro
- [ ] ✅ Recherche multi-critères
- [ ] ✅ Filtrage par date
- [ ] ✅ Scoring affiché correctement
- [ ] ✅ Protection des routes (token requis)
- [ ] ✅ Expiration token détectée
- [ ] ✅ Validation champs requis
- [ ] ✅ Mots de passe hachés
- [ ] ✅ Accès admin restreint
- [ ] ✅ Messages d'erreur clairs
- [ ] ✅ Interface responsive

---

## 🐛 En cas de problème

### Le serveur ne démarre pas
```bash
cd backend
npm install
npm start
```

### Erreur "Token invalide"
- Vérifier que le JWT_SECRET est le même dans `.env` et à l'exécution
- Se reconnecter pour obtenir un nouveau token

### Aucun résultat de recherche
- Vérifier qu'il y a des documents dans `backend/documents.json`
- Vérifier que le token est valide
- Vérifier les critères de recherche (seuil score = 3)

### Erreur CORS
- Vérifier que le serveur tourne sur le port 3000
- Vérifier que l'URL dans `script.js` est correcte : `http://localhost:3000`

---

## ✅ TOUT EST OK ?

Si tous les tests passent, le projet est **100% fonctionnel** ! 🎉

Prêt pour :
- ✅ Démonstration
- ✅ Présentation
- ✅ Soumission du projet

---

**Bon testing ! 🚀**
