# ✨ Alignement des Formulaires avec MongoDB

## 🎯 Objectif

Aligner les formulaires de déclaration et de recherche avec le modèle MongoDB pour éviter les incohérences.

---

## 🔍 Problème Identifié

Les formulaires utilisaient des valeurs différentes du modèle MongoDB :

### Type de Déclaration

| Formulaire (Ancien) | Modèle MongoDB | Aligné |
|---------------------|----------------|--------|
| `perdu` ❌ | `PERTE` ✅ | ✅ |
| `trouve` ❌ | `DECOUVERTE` ✅ | ✅ |
| `retrouvé` ❌ | `DECOUVERTE` ✅ | ✅ |

### Type de Document

| Formulaire (Ancien) | Modèle MongoDB | Aligné |
|---------------------|----------------|--------|
| `CNI` ✅ | `CNI` ✅ | ✅ |
| `Passeport` ❌ | `PASSEPORT` ✅ | ✅ |
| `Permis de Conduire` ❌ | `PERMIS` ✅ | ✅ |
| `Carte Scolaire` ❌ | `CARTE_SCOLAIRE` ✅ | ✅ |
| `Diplôme` ❌ | `DIPLOME` ✅ | ✅ |
| `Acte de Naissance` ❌ | `ACTE_NAISSANCE` ✅ | ✅ |
| `AUTRE` ✅ | `AUTRE` ✅ | ✅ |

---

## ✅ Corrections Appliquées

### 1. Formulaire de Déclaration ([frontend/declaration.html](frontend/declaration.html))

**Avant** :
```html
<select id="typeDeclaration" required>
    <option value="">--Choisir--</option>
    <option value="perdu">Perdu</option>
    <option value="trouve">Trouvé</option>
</select>

<select id="typeDocument" required>
    <option value="">--Choisir--</option>
    <option value="CNI">CNI (Carte Nationale d'Identité)</option>
    <option value="Passeport">Passeport</option>
    <option value="Permis de Conduire">Permis de Conduire</option>
    <!-- etc. -->
</select>
```

**Après** :
```html
<select id="typeDeclaration" required>
    <option value="">--Choisir--</option>
    <option value="PERTE">📍 Perdu</option>
    <option value="DECOUVERTE">✅ Trouvé</option>
</select>

<select id="typeDocument" required>
    <option value="">--Choisir--</option>
    <option value="CNI">CNI (Carte Nationale d'Identité)</option>
    <option value="PASSEPORT">Passeport</option>
    <option value="PERMIS">Permis de Conduire</option>
    <option value="CARTE_SCOLAIRE">Carte Scolaire</option>
    <option value="DIPLOME">Diplôme</option>
    <option value="ACTE_NAISSANCE">Acte de Naissance</option>
    <option value="AUTRE">Autre</option>
</select>
```

---

### 2. Formulaire de Recherche ([frontend/recherche.html](frontend/recherche.html))

**Avant** :
```html
<select id="r_typeDeclaration">
    <option value="">-- Tous --</option>
    <option value="perdu">Perdu</option>
    <option value="retrouvé">Retrouvé</option>
</select>

<input type="text" id="r_typeDocument" placeholder="Ex: CNI, Passeport">
```

**Après** :
```html
<select id="r_typeDeclaration">
    <option value="">-- Tous --</option>
    <option value="PERTE">📍 Perdu</option>
    <option value="DECOUVERTE">✅ Trouvé</option>
</select>

<select id="r_typeDocument">
    <option value="">-- Tous --</option>
    <option value="CNI">CNI (Carte Nationale d'Identité)</option>
    <option value="PASSEPORT">Passeport</option>
    <option value="PERMIS">Permis de Conduire</option>
    <option value="CARTE_SCOLAIRE">Carte Scolaire</option>
    <option value="DIPLOME">Diplôme</option>
    <option value="ACTE_NAISSANCE">Acte de Naissance</option>
    <option value="AUTRE">Autre</option>
</select>
```

**Amélioration** : 
- ✅ Champ texte libre → Liste déroulante (cohérence avec déclaration)
- ✅ Mêmes valeurs que le formulaire de déclaration
- ✅ Option "Tous" pour rechercher dans tous les types

---

### 3. Affichage des Résultats ([frontend/script.js](frontend/script.js))

**Badge de type corrigé** :
```javascript
// Avant
const typeBadge = doc.type === 'perdu' ? /* ... */ : /* ... */;

// Après
const typeBadge = doc.type === 'PERTE' ? /* ... */ : /* ... */;
```

**Ajout mapping des types de documents** :
```javascript
const typeDocumentMap = {
    'CNI': 'CNI',
    'PASSEPORT': 'Passeport',
    'PERMIS': 'Permis de Conduire',
    'CARTE_SCOLAIRE': 'Carte Scolaire',
    'DIPLOME': 'Diplôme',
    'ACTE_NAISSANCE': 'Acte de Naissance',
    'AUTRE': 'Autre'
};
const typeDocumentAffiche = typeDocumentMap[doc.typeDocument] || doc.typeDocument;
```

**Résultat** : Les types s'affichent en format lisible (ex: "Permis de Conduire" au lieu de "PERMIS")

---

## 📋 Modèle MongoDB (Référence)

**Fichier** : [backend/src/models/Declaration.js](backend/src/models/Declaration.js)

```javascript
const DeclarationSchema = new Schema({
  type: {
    type: String,
    enum: {
      values: ['PERTE', 'DECOUVERTE'],
      message: 'Le type doit être "PERTE" ou "DECOUVERTE"'
    },
    required: [true, 'Le type de déclaration est requis'],
    index: true
  },
  typeDocument: {
    type: String,
    enum: {
      values: ['CNI', 'PASSEPORT', 'PERMIS', 'CARTE_SCOLAIRE', 'DIPLOME', 'ACTE_NAISSANCE', 'AUTRE'],
      message: 'Type de document invalide'
    },
    required: [true, 'Le type de document est requis'],
    index: true
  },
  // ... autres champs
});
```

---

## 🎨 Améliorations UX

### Icônes Visuelles

- 📍 **PERTE** (rouge) : Badge "PERDU"
- ✅ **DECOUVERTE** (vert) : Badge "TROUVÉ"

### Affichage Cohérent

Tous les formulaires utilisent maintenant :
- Les mêmes valeurs (ex: `PERTE` au lieu de variations "perdu", "Perdu", etc.)
- Les mêmes listes déroulantes
- Le même formatage visuel

---

## ✅ Impact

### Avant (Problèmes)

1. ❌ Déclaration avec `perdu` ne correspondait pas avec recherche `retrouvé`
2. ❌ Type document "Passeport" ne matchait pas avec "PASSEPORT" en base
3. ❌ Recherche par type ne fonctionnait pas
4. ❌ Affichage montrait "PASSEPORT" au lieu de "Passeport"

### Après (Solutions)

1. ✅ Déclaration et recherche utilisent `PERTE` et `DECOUVERTE`
2. ✅ Tous les types sont en majuscules avec underscores (ex: `ACTE_NAISSANCE`)
3. ✅ La recherche fonctionne correctement
4. ✅ L'affichage est formaté de manière lisible

---

## 🧪 Tests de Validation

### Test 1 : Créer une Déclaration

1. Allez sur https://smartsearch-frontend.onrender.com/declaration.html
2. Sélectionnez "📍 Perdu"
3. Sélectionnez "Acte de Naissance"
4. Remplissez les autres champs
5. Soumettez

**Vérification** : 
- Ouvrez la console (F12)
- Les données envoyées doivent contenir `type: "PERTE"` et `typeDocument: "ACTE_NAISSANCE"`

---

### Test 2 : Rechercher

1. Allez sur https://smartsearch-frontend.onrender.com/recherche.html
2. Sélectionnez "✅ Trouvé" dans "Type de déclaration"
3. Sélectionnez "Acte de Naissance" dans "Type de document"
4. Cliquez "🔍 Rechercher"

**Résultat attendu** :
- Les documents de type "DECOUVERTE" et "ACTE_NAISSANCE" s'affichent
- L'affichage montre "Acte de Naissance" (format lisible)
- Le badge "✅ TROUVÉ" est vert

---

### Test 3 : Vérification Backend

```bash
# Se connecter
curl -X POST https://smartsearch-backend-pxw5.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Copier le token et rechercher
curl "https://smartsearch-backend-pxw5.onrender.com/api/declarations?type=PERTE&typeDocument=CNI" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Résultat** : Les déclarations avec `type: "PERTE"` et `typeDocument: "CNI"` sont retournées

---

## 📁 Fichiers Modifiés

1. **[frontend/declaration.html](frontend/declaration.html)** - Formulaire de déclaration
2. **[frontend/recherche.html](frontend/recherche.html)** - Formulaire de recherche
3. **[frontend/script.js](frontend/script.js)** - Affichage des résultats

---

## 🎯 Checklist Finale

- [x] Type de déclaration aligné : `PERTE` / `DECOUVERTE`
- [x] Types de documents alignés : `CNI`, `PASSEPORT`, `PERMIS`, etc.
- [x] Formulaire déclaration corrigé
- [x] Formulaire recherche corrigé (+ liste déroulante au lieu de texte)
- [x] Affichage résultats corrigé (badges et formatage)
- [x] Mapping pour affichage lisible ajouté
- [x] Code committé et pushé
- [x] Documentation créée

---

## 🎉 Résultat

✅ **Tous les formulaires sont maintenant alignés avec le modèle MongoDB !**

Les utilisateurs peuvent :
- Déclarer un document avec les bonnes valeurs
- Rechercher avec les mêmes critères
- Voir les résultats formatés correctement

**Cohérence totale** entre frontend et backend ! 🚀
