# 🐛 Debug des problèmes restants

## ✅ État actuel

### **Fonctionnel :**
- ✅ Dashboard admin (statistiques s'affichent)
- ✅ Login/Logout
- ✅ Endpoints backend existent

### **À tester :**
- 🧪 Déclaration (après redéploiement backend)
- 🧪 Changer rôle utilisateur
- 🧪 Réinitialiser mot de passe
- 🧪 Supprimer utilisateur

---

## 🧪 Tests à effectuer (DANS L'ORDRE)

### **1. Attendre le redéploiement Render** ⏱️

Le dernier push (fix geo) doit être déployé :
```bash
git log --oneline -1
# Devrait afficher : 5734e6f 🔧 Fix: Rendre geo optionnel dans Declaration
```

**Vérifier sur Render :**
1. Dashboard Render → Service backend
2. Status = "Live" ✅
3. Dernier déploiement = il y a quelques minutes

---

### **2. Test déclaration** 📝

**URL :** https://smartsearch-frontend.onrender.com/declaration.html

**Étapes :**
1. Vider cache (Ctrl + Shift + Delete)
2. Se connecter
3. Remplir formulaire :
   - Type : Perdu
   - Type doc : CNI
   - Nom : Test HERVE
   - Numéro : TEST123
   - Lieu : Yaoundé
   - Date : aujourd'hui
   - Description : Test déclaration

4. **Cliquer "Soumettre"**

**Résultat attendu :**
✅ "Déclaration créée avec succès. Le matching automatique est en cours..."

**Si erreur :**
- F12 → Console → Copier l'erreur
- Vérifier que le backend est bien à jour

---

### **3. Test changer rôle** 👤

**URL :** https://smartsearch-frontend.onrender.com/admin-users.html

**Étapes :**
1. Trouver un utilisateur (pas vous-même)
2. Cliquer sur l'icône 🔧 (modifier rôle)
3. Dans le modal :
   - Sélectionner nouveau rôle (admin ↔ déclarant)
   - Cliquer "Enregistrer"

**Résultat attendu :**
✅ Message : "Rôle modifié de declarant à admin" (ou inverse)
✅ Liste se rafraîchit
✅ Badge du rôle change

**Si erreur :**
- Noter le message d'erreur exact
- F12 → Console → Vérifier l'endpoint appelé
- Vérifier le status HTTP (401, 403, 500 ?)

---

### **4. Test réinitialiser mot de passe** 🔑

**URL :** https://smartsearch-frontend.onrender.com/admin-users.html

**Étapes :**
1. Trouver un utilisateur
2. Cliquer sur l'icône 🔑 (reset password)
3. Dans le modal :
   - Entrer nouveau mot de passe : `test123456`
   - Cliquer "Réinitialiser"

**Résultat attendu :**
✅ Message : "Mot de passe réinitialisé avec succès"

**Vérification :**
- Se déconnecter
- Essayer de se connecter avec ce compte et le nouveau MDP
- Devrait fonctionner ✅

**Si erreur :**
- Noter le message exact
- Vérifier longueur MDP (min 6 caractères)

---

### **5. Test supprimer utilisateur** 🗑️

**URL :** https://smartsearch-frontend.onrender.com/admin-users.html

**⚠️ ATTENTION :** Ne supprimez PAS votre propre compte !

**Étapes :**
1. Trouver un utilisateur de test
2. Cliquer sur l'icône 🗑️ (supprimer)
3. Confirmer la suppression

**Résultat attendu :**
✅ Message : "Utilisateur [username] supprimé avec succès"
✅ Liste se rafraîchit
✅ Utilisateur n'apparaît plus

**Si erreur :**
- Noter le message exact
- Vérifier que vous ne tentez pas de supprimer votre propre compte

---

## 🔍 Debug si problèmes persistent

### **Problème : "Erreur lors de la réinitialisation du mot de passe"**

**Causes possibles :**
1. Backend pas à jour → Attendre redéploiement
2. Mot de passe trop court → Min 6 caractères
3. Token expiré → Se reconnecter

**Solution :**
```javascript
// F12 → Console → Exécuter
fetch('https://smartsearch-backend-pxw5.onrender.com/api/admin/users/TEST_USER_ID/reset-password', {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  },
  body: JSON.stringify({ newPassword: 'test123456' })
}).then(r => r.json()).then(console.log)
```

---

### **Problème : "Token invalide" sur toutes les actions admin**

**Causes :**
1. Token expiré
2. Backend redémarré (tokens invalidés)

**Solution :**
1. Se déconnecter
2. Vider localStorage (F12 → Application → Local Storage → Clear)
3. Se reconnecter

---

### **Problème : 404 sur endpoint admin**

**Vérification :**
```bash
curl https://smartsearch-backend-pxw5.onrender.com/api/admin/users/test123/role \
  -X PATCH \
  -H "Authorization: Bearer fake" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}'
```

**Résultat attendu :** `{"success":false,"message":"Token invalide"}`  
**Si 404 :** Backend pas à jour, forcer redéploiement Render

---

## 📊 Checklist de validation

Cochez au fur et à mesure :

- [ ] ⏱️ Backend déployé (status "Live" sur Render)
- [ ] 📝 Déclaration fonctionne (message de succès)
- [ ] 👤 Changer rôle fonctionne (badge change)
- [ ] 🔑 Reset password fonctionne (connexion OK avec nouveau MDP)
- [ ] 🗑️ Supprimer utilisateur fonctionne (disparaît de la liste)

---

## 🎯 Objectif final

**100% des fonctionnalités admin fonctionnelles :**
- ✅ Dashboard avec stats
- ✅ Liste documents
- ✅ Liste utilisateurs
- ✅ CRUD utilisateurs (Create, Read, Update, Delete)
- ✅ Déclarations (Create)
- ✅ Recherche documents

---

## ⏱️ Temps estimé

- Redéploiement backend : **3-5 minutes**
- Tests complets : **5-10 minutes**
- **Total : ~15 minutes**

---

## 📝 Rapport de test

Après avoir testé, noter ici :

**Déclaration :**
- ✅ / ❌ : _______
- Erreur si applicable : _______

**Changer rôle :**
- ✅ / ❌ : _______
- Erreur si applicable : _______

**Reset password :**
- ✅ / ❌ : _______
- Erreur si applicable : _______

**Supprimer utilisateur :**
- ✅ / ❌ : _______
- Erreur si applicable : _______
