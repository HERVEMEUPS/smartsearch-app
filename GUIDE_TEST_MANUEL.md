# 🧪 Guide de Test Manuel - Système SmartSearch

## 📋 Prérequis

✅ Backend démarré sur `https://smartsearch-backend-pxw5.onrender.com`
✅ Frontend accessible (fichiers HTML)
✅ Compte utilisateur créé et authentifié

---

## 🎯 Scénario de Test Complet

### 🔐 Étape 1 : Connexion
1. Ouvrir [login.html](frontend/login.html)
2. Se connecter avec un compte utilisateur
3. Vérifier la redirection vers `index.html`

---

### 📝 Étape 2 : Déclarer un Document Perdu

1. Aller sur [declaration.html](frontend/declaration.html)
2. Remplir le formulaire avec ces valeurs **exactes** :

```
Type de déclaration : 📍 Perdu
Type de document    : CNI (Carte Nationale d'Identité)
Nom du propriétaire : TOTO Jean
Numéro du document  : 123456789
Lieu               : Yaoundé
Date               : [date d'aujourd'hui]
Description        : Carte perdue au marché central de Yaoundé
```

3. Cliquer sur "Soumettre"
4. ✅ **Vérification** : Message "Déclaration enregistrée avec succès !"

#### 🔍 Vérification en Base de Données

**Ce qui doit être enregistré dans MongoDB :**
```json
{
  "type": "PERTE",
  "typeDocument": "CNI",
  "nomPartiel": "TOTO Jean",
  "numeroPartiel": "123456789",
  "localisation": {
    "ville": "Yaoundé"
  },
  "dateEvenement": "2026-06-15",
  "description": "Carte perdue au marché central de Yaoundé",
  "statut": "EN_ATTENTE"
}
```

⚠️ **Important** : Vérifier que `type: "PERTE"` et **pas** `"perdu"`

---

### ✅ Étape 3 : Déclarer un Document Trouvé

1. Retourner sur [declaration.html](frontend/declaration.html)
2. Remplir le formulaire avec :

```
Type de déclaration : ✅ Trouvé
Type de document    : CNI (Carte Nationale d'Identité)
Nom du propriétaire : TOTO Jean
Numéro du document  : 123456789
Lieu               : Yaoundé, Quartier Essos
Date               : [date d'aujourd'hui + 1 jour]
Description        : Carte trouvée près du marché central
```

3. Cliquer sur "Soumettre"
4. ✅ **Vérification** : Message "Déclaration enregistrée avec succès !"

#### 🔍 Vérification en Base de Données

**Ce qui doit être enregistré dans MongoDB :**
```json
{
  "type": "DECOUVERTE",
  "typeDocument": "CNI",
  "nomPartiel": "TOTO Jean",
  "numeroPartiel": "123456789",
  "localisation": {
    "ville": "Yaoundé",
    "quartier": "Quartier Essos"
  },
  "dateEvenement": "2026-06-16",
  "description": "Carte trouvée près du marché central",
  "statut": "EN_ATTENTE"
}
```

⚠️ **Important** : Vérifier que `type: "DECOUVERTE"` et **pas** `"trouve"` ou `"trouvé"`

---

### 🔍 Étape 4 : Rechercher les Documents Perdus

1. Aller sur [recherche.html](frontend/recherche.html)
2. **Test 4A : Recherche par type uniquement**

```
Type de déclaration : 📍 Perdu
[Laisser tous les autres champs vides]
```

3. Cliquer sur "🔍 Rechercher"
4. ✅ **Résultat attendu** :
   - Au moins 1 document affiché
   - Badge "📍 PERDU" visible
   - Type de document : CNI
   - Nom : TOTO Jean

---

### 🔍 Étape 5 : Rechercher les Documents Trouvés

1. Sur [recherche.html](frontend/recherche.html)
2. **Test 5A : Recherche par type uniquement**

```
Type de déclaration : ✅ Trouvé
[Laisser tous les autres champs vides]
```

3. Cliquer sur "🔍 Rechercher"
4. ✅ **Résultat attendu** :
   - Au moins 1 document affiché
   - Badge "✅ TROUVÉ" visible
   - Type de document : CNI
   - Nom : TOTO Jean

---

### 🔍 Étape 6 : Recherche Combinée

1. Sur [recherche.html](frontend/recherche.html)
2. **Test 6A : Par nom et type**

```
Type de déclaration : -- Tous --
Type de document    : CNI (Carte Nationale d'Identité)
Nom du propriétaire : TOTO
[Autres champs vides]
```

3. Cliquer sur "🔍 Rechercher"
4. ✅ **Résultat attendu** :
   - 2 documents affichés (1 perdu + 1 trouvé)
   - Badge "📍 PERDU" pour le premier
   - Badge "✅ TROUVÉ" pour le deuxième

---

### 🔍 Étape 7 : Recherche par Numéro

1. Sur [recherche.html](frontend/recherche.html)
2. **Test 7A : Recherche exacte par numéro**

```
Type de déclaration : -- Tous --
Numéro du document  : 123456789
[Autres champs vides]
```

3. Cliquer sur "🔍 Rechercher"
4. ✅ **Résultat attendu** :
   - 2 documents affichés (correspondance exacte)
   - Score élevé (proche de 100)

---

### 🔍 Étape 8 : Aucun Résultat

1. Sur [recherche.html](frontend/recherche.html)
2. **Test 8A : Recherche introuvable**

```
Type de déclaration : 📍 Perdu
Nom du propriétaire : XYZ_INEXISTANT
```

3. Cliquer sur "🔍 Rechercher"
4. ✅ **Résultat attendu** :
   - Message : "🔍 Aucun document trouvé"
   - Suggestions affichées :
     - "Essayez de laisser certains champs vides"
     - "Vérifiez l'orthographe du nom ou du lieu"
     - etc.

---

## 🧪 Tests Supplémentaires

### Test 9 : Recherche sans critères
```
[Tous les champs vides]
```
✅ **Attendu** : Afficher TOUS les documents (perdus + trouvés)

---

### Test 10 : Recherche par lieu
```
Lieu : Yaoundé
```
✅ **Attendu** : Tous les documents déclarés à Yaoundé

---

### Test 11 : Recherche par date
```
Date début : 2026-06-15
Date fin   : 2026-06-16
```
✅ **Attendu** : Documents dans cette plage de dates

---

## 🐛 Problèmes Courants et Solutions

### ❌ Problème 1 : "Aucun document trouvé" après une déclaration

**Cause possible** : Les anciennes valeurs `"perdu"` ou `"trouve"` sont encore en base

**Solution** :
```javascript
// Vérifier dans MongoDB
db.declarations.find({ type: { $exists: true } })

// Si des documents ont typeDeclaration au lieu de type :
db.declarations.find({ typeDeclaration: { $exists: true } })
```

---

### ❌ Problème 2 : Erreur 400 lors de la déclaration

**Cause possible** : Format de données incorrect

**Vérification** : Ouvrir la console du navigateur (F12) et vérifier :
```javascript
// Le payload envoyé doit contenir :
{
  "type": "PERTE" ou "DECOUVERTE",  // PAS "perdu" ou "trouve"
  "typeDocument": "CNI",             // PAS "Carte d'identité"
  ...
}
```

---

### ❌ Problème 3 : Session expirée

**Solution** :
1. Se déconnecter
2. Se reconnecter
3. Réessayer l'opération

---

## ✅ Checklist de Validation Finale

### Déclaration
- [ ] Peut déclarer un document **perdu** → enregistré comme `type: "PERTE"`
- [ ] Peut déclarer un document **trouvé** → enregistré comme `type: "DECOUVERTE"`
- [ ] Les 7 types de documents sont acceptés (CNI, Passeport, etc.)

### Recherche
- [ ] Recherche uniquement "Perdu" retourne des `type: "PERTE"`
- [ ] Recherche uniquement "Trouvé" retourne des `type: "DECOUVERTE"`
- [ ] Recherche "Tous" retourne les deux types
- [ ] Recherche par nom fonctionne
- [ ] Recherche par numéro fonctionne
- [ ] Recherche par lieu fonctionne
- [ ] Recherche par date fonctionne
- [ ] Message d'aide affiché si aucun résultat

### Affichage
- [ ] Badge "📍 PERDU" affiché en rouge
- [ ] Badge "✅ TROUVÉ" affiché en vert
- [ ] Badge de statut affiché ("🔔 Actif" ou "✔️ Résolu")
- [ ] Date formatée en français (jj/mm/aaaa)
- [ ] Lieu bien affiché (ville + quartier si présent)

### Matching (si activé)
- [ ] Documents perdus et trouvés similaires sont détectés
- [ ] Score de correspondance affiché
- [ ] Détails du match visibles

---

## 📊 Logs de Debug

### Console navigateur (F12)
Vous devriez voir ces logs lors d'une recherche :
```
📋 Valeurs des champs:
   Type déclaration: PERTE
   Type document: CNI
   Nom: TOTO
   ...

🔍 Recherche avec paramètres: {type: "PERTE", typeDocument: "CNI", ...}

📡 URL complète: https://smartsearch-backend-pxw5.onrender.com/api/declarations?type=PERTE&...

📡 Réponse recherche: 200 OK

📦 Données reçues: {success: true, data: [...]}

✅ X document(s) trouvé(s)

📊 Affichage de X résultat(s)
```

---

## 🎓 Conclusion

Si **tous les tests passent** :
✅ La nomenclature `PERTE` / `DECOUVERTE` est correctement implémentée
✅ Le système est cohérent de bout en bout
✅ Les fonctionnalités de déclaration et recherche fonctionnent

---

Date de création : 2026-06-15
Auteur : Assistant Claude
Version : 1.0
