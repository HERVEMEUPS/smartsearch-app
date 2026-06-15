# 🔧 Corrections de nomenclature - Système de déclaration

## 📋 Problème identifié

Il y avait une **incohérence de terminologie** entre le backend MongoDB et certains fichiers :

### ❌ Ancien format (incorrect)
- Type de déclaration : `"perdu"`, `"trouve"`, `"trouvé"`
- Champ utilisé : `typeDeclaration`

### ✅ Nouveau format (correct - MongoDB)
- Type de déclaration : `"PERTE"`, `"DECOUVERTE"`
- Champ utilisé : `type`
- Type de document : `"CNI"`, `"PASSEPORT"`, `"PERMIS"`, etc.

---

## 🔨 Corrections effectuées

### 1️⃣ **backend/intelligent-search.js**
Corrigé les fonctions qui utilisaient l'ancien format :

#### Fonction `intelligentSearch()` - Ligne 40
```javascript
// ❌ Avant
if (typeDeclaration && doc.typeDeclaration !== typeDeclaration) return false;

// ✅ Après
if (typeDeclaration && doc.type !== typeDeclaration) return false;
```

#### Fonction `findMatches()` - Lignes 155-156
```javascript
// ❌ Avant
const perdus = documents.filter(d => d.typeDeclaration === 'perdu');
const trouves = documents.filter(d => d.typeDeclaration === 'trouve' || d.typeDeclaration === 'trouvé');

// ✅ Après
const perdus = documents.filter(d => d.type === 'PERTE');
const trouves = documents.filter(d => d.type === 'DECOUVERTE');
```

#### Fonction `getStatistics()` - Lignes 291-292
```javascript
// ❌ Avant
const perdus = documents.filter(d => d.typeDeclaration === 'perdu').length;
const trouves = documents.filter(d => d.typeDeclaration === 'trouve' || d.typeDeclaration === 'trouvé').length;

// ✅ Après
const perdus = documents.filter(d => d.type === 'PERTE').length;
const trouves = documents.filter(d => d.type === 'DECOUVERTE').length;
```

---

### 2️⃣ **frontend/script.js**
Simplifié le code de déclaration - plus besoin de mapping :

#### Fonction de déclaration - Lignes 335-356
```javascript
// ❌ Avant : Mapping inutile
const typeMapping = {
    'perdu': 'PERTE',
    'trouve': 'DECOUVERTE',
    'trouvé': 'DECOUVERTE'
};

const documentData = {
    type: typeMapping[typeDeclarationValue] || 'PERTE',
    typeDocument: typeDocMapping[typeDocumentValue] || typeDocumentValue.toUpperCase().replace(/ /g, '_'),
    // ...
};

// ✅ Après : Valeurs directes
const documentData = {
    type: typeDeclarationValue,  // Déjà "PERTE" ou "DECOUVERTE"
    typeDocument: typeDocumentValue,  // Déjà "CNI", "PASSEPORT", etc.
    // ...
};
```

---

### 3️⃣ **Fichiers déjà corrects** ✅

#### ✅ frontend/declaration.html
```html
<select id="typeDeclaration" required>
    <option value="PERTE">📍 Perdu</option>
    <option value="DECOUVERTE">✅ Trouvé</option>
</select>

<select id="typeDocument" required>
    <option value="CNI">CNI</option>
    <option value="PASSEPORT">Passeport</option>
    <!-- etc. -->
</select>
```

#### ✅ frontend/recherche.html
```html
<select id="r_typeDeclaration">
    <option value="PERTE">📍 Perdu</option>
    <option value="DECOUVERTE">✅ Trouvé</option>
</select>
```

#### ✅ backend/src/models/Declaration.js
```javascript
type: {
    type: String,
    enum: {
        values: ['PERTE', 'DECOUVERTE'],
        message: 'Le type doit être "PERTE" ou "DECOUVERTE"'
    }
}
```

---

## 🎯 Résultat

### Nomenclature unifiée dans tout le projet :

| Concept | Champ DB | Valeurs possibles | Usage |
|---------|----------|-------------------|-------|
| Type de déclaration | `type` | `PERTE`, `DECOUVERTE` | MongoDB, API, Frontend |
| Type de document | `typeDocument` | `CNI`, `PASSEPORT`, `PERMIS`, etc. | MongoDB, API, Frontend |

### Flux de données cohérent :
```
HTML (value="PERTE") 
  → JavaScript (type: "PERTE")
    → API Backend (type: "PERTE")
      → MongoDB ({type: "PERTE"})
        → Recherche intelligente (filter: type === "PERTE")
```

---

## ✅ Tests à effectuer

1. **Déclaration d'un document perdu**
   - Vérifier que `type: "PERTE"` est bien enregistré en base
   
2. **Déclaration d'un document trouvé**
   - Vérifier que `type: "DECOUVERTE"` est bien enregistré en base

3. **Recherche par type**
   - Filtrer uniquement les documents "Perdu" → doit retourner `type: "PERTE"`
   - Filtrer uniquement les documents "Trouvé" → doit retourner `type: "DECOUVERTE"`
   - Filtrer "Tous" → doit retourner les deux types

4. **Matching automatique**
   - Vérifier que `findMatches()` trouve bien les correspondances PERTE ↔ DECOUVERTE

5. **Statistiques**
   - Vérifier que `getStatistics()` compte correctement les documents perdus et trouvés

---

## 📝 Notes importantes

- **Pas de rétrocompatibilité** : Les anciennes valeurs `"perdu"`, `"trouve"`, `"trouvé"` ne sont plus supportées
- **Migration des données** : Si la base contient d'anciennes données, il faudra les migrer
- **Cohérence stricte** : MongoDB n'acceptera que `"PERTE"` et `"DECOUVERTE"` (enum strict)

---

Date de correction : 2026-06-15
