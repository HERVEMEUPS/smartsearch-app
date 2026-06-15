# 🧪 Guide de test rapide - Vérification des corrections

## ⚡ Tests rapides (dans l'ordre)

### 1️⃣ **Test connexion** 
✅ URL: `https://smartsearch-frontend.onrender.com/login.html`
- Connectez-vous avec votre compte admin
- Devrait rediriger vers le dashboard

---

### 2️⃣ **Test Dashboard** 
✅ URL: `https://smartsearch-frontend.onrender.com/dashboard.html`

**Avant:** ❌ "Erreur lors du chargement du dashboard"  
**Après:** ✅ Doit afficher :
- ✅ Stats documents (Total, Perdus, Trouvés, Correspondances)
- ✅ Stats utilisateurs (Total, Admins, Déclarants, Actifs)
- ✅ Graphiques (évolution, types, lieux)
- ✅ Top 5 déclarants

**Si erreur persiste:** Ouvrir la console (F12) et vérifier l'erreur exacte

---

### 3️⃣ **Test Gestion Documents**
✅ URL: `https://smartsearch-frontend.onrender.com/admin-documents.html`

**Avant:** ❌ "Erreur lors du chargement des données"  
**Après:** ✅ Doit afficher :
- ✅ Stats rapides en haut (Total, Perdus, Trouvés, Correspondances)
- ✅ Filtres (type doc, nom, lieu, déclarant)
- ✅ 3 onglets : Tous / Perdus / Trouvés
- ✅ Liste des documents avec actions

**Actions à tester:**
- 👁️ Voir détails (modal)
- ✏️ Modifier document (modal)
- ✅ Valider document
- 🗑️ Supprimer document

---

### 4️⃣ **Test Gestion Utilisateurs**
✅ URL: `https://smartsearch-frontend.onrender.com/admin-users.html`

**Avant:** ❌ "Erreur lors du chargement des données"  
**Après:** ✅ Doit afficher :
- ✅ Stats : Total, Admins, Déclarants, Actifs
- ✅ Barre de recherche + filtre par rôle
- ✅ Liste utilisateurs avec actions

**Actions à tester:**
1. **Modifier rôle** 
   - Clic sur 🔧 (bouton edit)
   - Changer declarant → admin (ou inverse)
   - ✅ Message de succès
   - ⚠️ Ne devrait PAS fonctionner sur votre propre compte

2. **Réinitialiser mot de passe**
   - Clic sur 🔑 (bouton reset)
   - Entrer nouveau mot de passe (min 6 caractères)
   - ✅ Message de succès

3. **Supprimer utilisateur**
   - Clic sur 🗑️ (bouton delete)
   - Confirmer la suppression
   - ✅ Message de succès
   - ⚠️ Ne devrait PAS fonctionner sur votre propre compte

---

### 5️⃣ **Test Déclaration (NOUVEAU FIX)**
✅ URL: `https://smartsearch-frontend.onrender.com/declaration.html`

**Avant:** ❌ "Route non trouvée"  
**Après:** ✅ Formulaire de déclaration fonctionnel

**Étapes de test:**
1. **Remplir le formulaire:**
   - Type de déclaration: Perdu ou Trouvé
   - Type de document: CNI (sélectionner dans le menu)
   - Nom du propriétaire: Test DJANGA
   - Numéro: AN203/25 (optionnel)
   - Lieu: Yaoundé
   - Date: 15/11/2025
   - Description: Test de déclaration

2. **Cliquer sur "Soumettre"**

3. **Résultat attendu:**
   - ✅ Message: "Déclaration créée avec succès. Le matching automatique est en cours..."
   - ✅ Formulaire se réinitialise

**Si erreur:** Ouvrir console (F12) pour voir l'erreur exacte

---

## 🔍 Débogage si problèmes persistent

### Console navigateur (F12)
```javascript
// Vérifier que l'API_URL est correct
console.log(API_URL);
// Devrait afficher: https://smartsearch-backend-pxw5.onrender.com

// Vérifier le token
console.log(localStorage.getItem('token'));
// Devrait afficher un long string JWT

// Vérifier le rôle
console.log(localStorage.getItem('role'));
// Devrait afficher: admin
```

### Test direct de l'API
```bash
# Health check
curl https://smartsearch-backend-pxw5.onrender.com/health

# Endpoints disponibles
curl https://smartsearch-backend-pxw5.onrender.com/
```

---

## 📋 Checklist complète

- [ ] ✅ Login fonctionne
- [ ] ✅ Dashboard charge les stats
- [ ] ✅ Admin Documents affiche la liste
- [ ] ✅ Admin Users affiche la liste
- [ ] ✅ Modifier rôle utilisateur fonctionne
- [ ] ✅ Reset password fonctionne
- [ ] ✅ Supprimer utilisateur fonctionne
- [ ] ✅ Créer déclaration fonctionne

---

## ⚠️ Si un problème persiste

1. **Vider le cache du navigateur** (Ctrl + F5)
2. **Se déconnecter et se reconnecter**
3. **Vérifier la console navigateur** (F12 → Console)
4. **Vérifier que le backend est en ligne**: `https://smartsearch-backend-pxw5.onrender.com/health`

---

## 🎉 Tout fonctionne ?

Si tous les tests passent, voici ce qui a été corrigé :

1. ✅ **4 endpoints backend ajoutés** (change role, reset password, delete user, + stats)
2. ✅ **3 services backend améliorés** (avec agrégation MongoDB pour top déclarants)
3. ✅ **6 fichiers frontend corrigés** (dashboard, admin-docs, admin-users, declaration, script.js)
4. ✅ **Mapping des données** (frontend → backend compatible MongoDB)
5. ✅ **Format de réponse standardisé** partout

**Total: 14 fichiers modifiés/créés** 🚀
