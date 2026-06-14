# ⚡ Test Rapide - Headers SmartSearch

**Objectif** : Vérifier que toutes les pages ont le header "SmartSearch"

---

## 🧪 Checklist Visuelle

### 1. Page de Connexion (`login.html`)

```
┌─────────────────────────────────────────────┐
│ 🔷 SmartSearch            🏠 Accueil       │ ← Header violet
├─────────────────────────────────────────────┤
│                                             │
│           📝 Connexion                      │
│                                             │
│     [Nom d'utilisateur]                     │
│     [Mot de passe]                          │
│     [Se connecter]                          │
│                                             │
└─────────────────────────────────────────────┘
```

**À vérifier** :
- [ ] Header violet présent
- [ ] Logo "SmartSearch" visible avec icône
- [ ] Logo cliquable vers index.html
- [ ] Lien "Accueil" cliquable

---

### 2. Page d'Inscription (`register.html`)

```
┌─────────────────────────────────────────────┐
│ 🔷 SmartSearch            🏠 Accueil       │ ← Header violet
├─────────────────────────────────────────────┤
│                                             │
│         📝 Créer un compte                  │
│                                             │
│     [Nom d'utilisateur]                     │
│     [Mot de passe]                          │
│     [Type de compte ▼]                      │
│     [S'inscrire]                            │
│                                             │
└─────────────────────────────────────────────┘
```

**À vérifier** :
- [ ] Header violet présent
- [ ] Logo "SmartSearch" visible
- [ ] Identique à login.html

---

### 3. Dashboard Admin (`dashboard.html`)

```
┌─────────────────────────────────────────────┐
│ 🔷 SmartSearch         Admin: username     │ ← Header violet
├─────────────────────────────────────────────┤
│  📊 Dashboard  │  📄 Gérer Docs  │ 🏠 Home │ ← Menu admin
├─────────────────────────────────────────────┤
│                                             │
│   📊 Dashboard Administrateur               │
│                                             │
│   [Stats] [Stats] [Stats] [Stats]          │
│   [Graphiques...]                           │
│                                             │
└─────────────────────────────────────────────┘
```

**À vérifier** :
- [ ] Header violet avec logo SmartSearch
- [ ] User info affichée (ex: "Admin: admin")
- [ ] Menu de navigation secondaire visible
- [ ] Logo cliquable

---

### 4. Déclaration (`declaration.html`)

```
┌─────────────────────────────────────────────┐
│ 🔷 SmartSearch         User: username      │ ← Header violet
├─────────────────────────────────────────────┤
│                                             │
│     Déclaration de document                 │
│                                             │
│     [Type de déclaration ▼]                 │
│     [Type de document]                      │
│     [Nom du propriétaire]                   │
│     ...                                     │
│                                             │
└─────────────────────────────────────────────┘
```

**À vérifier** :
- [ ] Header violet avec logo SmartSearch
- [ ] User info visible si connecté
- [ ] Logo cliquable vers index.html

---

### 5. Recherche (`recherche.html`)

```
┌─────────────────────────────────────────────┐
│ 🔷 SmartSearch         User: username      │ ← Header violet
├─────────────────────────────────────────────┤
│                                             │
│  Recherche de documents perdus/retrouvés    │
│                                             │
│     [Type de déclaration ▼]                 │
│     [Type de document]                      │
│     [Nom du propriétaire]                   │
│     [🔍 Rechercher]                         │
│                                             │
└─────────────────────────────────────────────┘
```

**À vérifier** :
- [ ] Header violet avec logo SmartSearch
- [ ] User info visible si connecté
- [ ] Logo cliquable

---

### 6. Gestion Documents (`admin-documents.html`)

```
┌─────────────────────────────────────────────┐
│ 🔷 SmartSearch  │ Accueil │ Dashboard │... │ ← Header pro
├─────────────────────────────────────────────┤
│                                             │
│     📁 Gestion des Documents                │
│                                             │
│   [Total: 8] [Perdus: 6] [Trouvés: 2]      │
│   [Tableau des documents...]                │
│                                             │
└─────────────────────────────────────────────┘
```

**À vérifier** :
- [ ] Header professionnel présent (déjà existant)
- [ ] Logo "SmartSearch" visible
- [ ] Navigation complète

---

### 7. Accueil (`index.html`)

```
┌─────────────────────────────────────────────┐
│ 🔷 SmartSearch │ Accueil │ Rechercher │ ... │ ← Header complet
├─────────────────────────────────────────────┤
│                                             │
│     Retrouvez vos documents perdus          │
│           au Cameroun                       │
│                                             │
│   [Déclarer une perte] [Rechercher]        │
│                                             │
└─────────────────────────────────────────────┘
```

**À vérifier** :
- [ ] Header complet présent (déjà existant)
- [ ] Logo "SmartSearch" visible
- [ ] Menu de navigation complet

---

## 🎯 Test en 3 Minutes

### Étape 1 : Pages Publiques (1 min)

```bash
1. Ouvrir login.html
   ✓ Header violet avec logo SmartSearch ?

2. Ouvrir register.html
   ✓ Header violet avec logo SmartSearch ?

3. Ouvrir index.html
   ✓ Header complet avec logo SmartSearch ?
```

---

### Étape 2 : Pages Utilisateur (1 min)

```bash
1. Se connecter comme déclarant
2. Aller sur declaration.html
   ✓ Header avec logo + user info ?

3. Aller sur recherche.html
   ✓ Header avec logo + user info ?
```

---

### Étape 3 : Pages Admin (1 min)

```bash
1. Se connecter comme admin
2. Aller sur dashboard.html
   ✓ Header avec logo + user info + menu ?

3. Aller sur admin-documents.html
   ✓ Header professionnel avec logo ?
```

---

## ✅ Résultats Attendus

Si tous les tests passent :

```
✅ 7/7 pages ont un header
✅ 7/7 pages affichent "SmartSearch"
✅ 7/7 logos sont cliquables
✅ Design cohérent (dégradé violet)
✅ User info affiché quand approprié

🎉 SUCCÈS ! Identité visuelle unifiée
```

---

## 🚨 Problèmes Possibles

### Problème 1 : Logo non visible

**Cause** : Font Awesome non chargé

**Solution** :
```html
<!-- Vérifier que cette ligne est présente -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

### Problème 2 : Header pas violet

**Cause** : CSS manquant ou style.css conflit

**Solution** :
```css
/* Vérifier le style inline ou la classe */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

---

### Problème 3 : Logo pas cliquable

**Cause** : Lien manquant

**Solution** :
```html
<!-- Vérifier que le logo est dans un <a> -->
<a href="index.html" class="logo">
    <i class="fas fa-file-shield"></i>
    <span>SmartSearch</span>
</a>
```

---

## 📊 Tableau Récapitulatif

| Page | Header | Logo | Cliquable | User Info | Statut |
|------|--------|------|-----------|-----------|--------|
| login.html | ✅ | ✅ | ✅ | ➖ | ✅ |
| register.html | ✅ | ✅ | ✅ | ➖ | ✅ |
| index.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| declaration.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| recherche.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| dashboard.html | ✅ | ✅ | ✅ | ✅ | ✅ |
| admin-documents.html | ✅ | ✅ | ✅ | ✅ | ✅ |

**Légende** :
- ✅ : Présent et fonctionnel
- ➖ : Non applicable (pas nécessaire)

---

## 🎨 Cohérence Visuelle

### Couleur du Header

```
Toutes les pages utilisent le même dégradé :
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
#667eea → #764ba2 (Violet dégradé)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Logo

```
Toutes les pages affichent :
🔷 SmartSearch
└─ Icône: fas fa-file-shield
└─ Texte: SmartSearch
└─ Taille: 24px
└─ Poids: bold
```

---

## 📝 Notes

- **➖ User info** : Login et Register n'ont pas besoin d'afficher l'utilisateur (pas encore connecté)
- **✅ Menu admin** : Seulement sur dashboard.html et admin-documents.html
- **✅ Navigation complète** : index.html a le menu le plus complet

---

**Test terminé** ✅  
**Durée estimée** : 3 minutes  
**Difficulté** : Facile
