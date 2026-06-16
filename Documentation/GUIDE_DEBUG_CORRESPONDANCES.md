# 🔍 Guide de Débogage - Correspondances Non Affichées

**Problème**: Les correspondances sont créées dans la base de données mais n'apparaissent pas dans le dashboard frontend.

---

## ✅ Vérifications Effectuées

### 1. **Backend - Correspondances en Base de Données**
```bash
cd backend
node check-correspondances.js
```

**Résultat**: ✅ 2 correspondances trouvées (DJANGA Kymia + MEUPIE) avec score 100%

### 2. **Backend - API Fonctionnelle**
```bash
cd backend
node test-api-correspondances.js
```

**Résultat**: ✅ L'API `/api/correspondances` retourne correctement les 2 matchs

---

## 🐛 Causes Possibles du Problème Frontend

### Cause 1: **Session Utilisateur Non Connectée**
**Symptôme**: "Aucune correspondance détectée pour le moment"

**Solution**:
1. Ouvrir http://localhost:3000/frontend/login.html
2. Se connecter avec:
   - Username: `admin`
   - Password: `admin`
3. Aller sur http://localhost:3000/frontend/dashboard.html

### Cause 2: **Token Expiré**
**Symptôme**: Erreur 401 Unauthorized dans la console

**Solution**:
1. Ouvrir la console navigateur (F12)
2. Aller dans Application > Local Storage
3. Supprimer le token
4. Se reconnecter

### Cause 3: **CORS / Backend Non Démarré**
**Symptôme**: Erreur réseau dans la console

**Solution**:
```bash
cd backend
npm run dev
```

Vérifier que le serveur écoute sur http://localhost:3000

### Cause 4: **Cache Navigateur**
**Symptôme**: Anciennes données affichées

**Solution**:
- Faire **Ctrl + Shift + R** (hard refresh)
- Ou vider le cache: Paramètres > Vie privée > Effacer les données

---

## 🧪 Page de Test Standalone

J'ai créé une page de test pour diagnostiquer le problème:

### **Ouvrir**: [`http://localhost:3000/frontend/test-correspondances.html`](../frontend/test-correspondances.html)

Cette page permet de:
1. ✅ Tester la connexion admin
2. ✅ Récupérer les correspondances via l'API
3. ✅ Afficher le JSON brut
4. ✅ Visualiser les matchs formatés

---

## 📋 Checklist de Débogage

Suivre ces étapes dans l'ordre:

### Étape 1: Vérifier le Backend
```bash
# Terminal 1
cd backend
npm run dev
```

Attendre le message:
```
✅ Serveur démarré sur le port 3000
🗄️  Connecté à MongoDB
```

### Étape 2: Vérifier la Base de Données
```bash
# Terminal 2
cd backend
node check-correspondances.js
```

**Attendu**: 2 correspondances (DJANGA Kymia + MEUPIE)

### Étape 3: Tester l'API
```bash
node test-api-correspondances.js
```

**Attendu**: Connexion réussie + 2 correspondances récupérées

### Étape 4: Tester dans le Navigateur

#### A. Ouvrir la Console (F12)
Aller dans l'onglet **Console**

#### B. Ouvrir la Page de Test
http://localhost:3000/frontend/test-correspondances.html

#### C. Cliquer sur les Boutons
1. "Se connecter en tant qu'admin"
2. "Charger les correspondances"

**Attendu**: 2 correspondances affichées

#### D. Si ça marche, ouvrir le Dashboard
http://localhost:3000/frontend/dashboard.html

Vérifier dans la section "🔗 Correspondances Automatiques Détectées"

---

## 🔧 Solutions Rapides

### Si aucune correspondance n'apparaît:

#### Solution 1: Re-générer les Correspondances
```bash
cd backend
node backend/trigger-matching.js
```

#### Solution 2: Forcer le Rechargement
Dans le dashboard, cliquer sur le bouton **🔄 Actualiser**

#### Solution 3: Se Reconnecter
1. Déconnexion
2. Reconnexion avec admin/admin
3. Recharger le dashboard

---

## 📊 État Actuel du Système

| Composant | État | Détails |
|-----------|------|---------|
| **Algorithme Matching** | ✅ Corrigé | Score DJANGA: 100% |
| **Base de Données** | ✅ OK | 2 correspondances créées |
| **API Backend** | ✅ OK | Endpoint fonctionnel |
| **Frontend Code** | ✅ OK | Fonction `loadMatches()` correcte |
| **Affichage** | ❓ À tester | Dépend de la session utilisateur |

---

## 🆘 Dépannage Avancé

### Vérifier les Logs Backend
```bash
# Dans le terminal où tourne npm run dev
# Chercher les lignes:
GET /api/correspondances - 200
```

### Vérifier le localStorage
```javascript
// Dans la console navigateur (F12)
console.log('Token:', localStorage.getItem('token'));
console.log('Role:', localStorage.getItem('role'));
```

**Attendu**:
- `token`: une longue chaîne JWT
- `role`: `"admin"`

### Tester Manuellement l'API
```javascript
// Dans la console navigateur (F12)
fetch('http://localhost:3000/api/correspondances', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(d => console.log('Correspondances:', d))
.catch(e => console.error('Erreur:', e));
```

**Attendu**: Un objet avec `{ success: true, data: [...] }`

---

## 📸 Captures Attendues

### Dashboard avec Correspondances

Vous devriez voir:

```
🔗 Correspondances Automatiques Détectées
Système intelligent de matching PERDU ↔ TROUVÉ

┌─────────────────────────────────────────────┐
│ 📄 ACTE_NAISSANCE           [100%] PROPOSEE │
│ 🔴 Perdu: DJANGA Kymia (AN203/25)          │
│ 🟢 Trouvé: DJANGA Kymia (AN203/25)         │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ 📄 PERMIS                   [100%] PROPOSEE │
│ 🔴 Perdu: MEUPIE (Pe4325)                  │
│ 🟢 Trouvé: MEUPIE (Pe4325)                 │
└─────────────────────────────────────────────┘
```

---

## 🎯 Prochaines Étapes

1. **Tester** la page de test: http://localhost:3000/frontend/test-correspondances.html
2. Si OK, **actualiser** le dashboard: http://localhost:3000/frontend/dashboard.html
3. Si problème persiste, **vérifier** les logs console (F12)

---

**Fichiers Utiles**:
- Test correspondances: [`frontend/test-correspondances.html`](../frontend/test-correspondances.html)
- Script check DB: [`backend/check-correspondances.js`](../backend/check-correspondances.js)
- Script test API: [`backend/test-api-correspondances.js`](../backend/test-api-correspondances.js)
