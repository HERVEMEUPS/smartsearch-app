# 🐛 Debug dans la console navigateur

## 🔍 Étapes de debug

### **1. Ouvrir la console (F12)**

1. Aller sur : https://smartsearch-frontend.onrender.com/admin-users.html
2. Appuyer sur **F12**
3. Aller dans l'onglet **Console**

---

### **2. Vérifier le token**

Coller et exécuter dans la console :

```javascript
console.log("Token:", localStorage.getItem('token'));
console.log("Username:", localStorage.getItem('username'));
console.log("Role:", localStorage.getItem('role'));
```

**Résultat attendu :**
- Token : long string JWT (commence par `eyJ...`)
- Username : votre nom d'utilisateur
- Role : `admin`

**Si l'un est null ou undefined :** Se reconnecter !

---

### **3. Tester manuellement le reset password**

Remplacer `USER_ID_ICI` par l'ID d'un utilisateur (copier depuis la liste) :

```javascript
const userId = "USER_ID_ICI"; // Remplacer par un vrai ID
const token = localStorage.getItem('token');

fetch(`https://smartsearch-backend-pxw5.onrender.com/api/admin/users/${userId}/reset-password`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ newPassword: 'test123456' })
})
.then(response => {
  console.log('Status:', response.status);
  console.log('OK:', response.ok);
  return response.json();
})
.then(data => {
  console.log('Response:', data);
  if (data.success) {
    console.log('✅ SUCCESS:', data.message);
  } else {
    console.log('❌ FAILED:', data.message);
  }
})
.catch(err => console.error('Error:', err));
```

---

### **4. Interpréter les résultats**

#### **Status 200 + success:true**
✅ **Ça fonctionne !** Le problème vient du frontend, pas du backend.

#### **Status 401/403 + "Token invalide"**
❌ **Token expiré ou invalide**

**Solution :**
1. Se déconnecter
2. Vider le localStorage :
   ```javascript
   localStorage.clear();
   ```
3. Se reconnecter

#### **Status 404**
❌ **L'endpoint n'existe pas** (backend pas à jour)

**Solution :** Attendre que Render déploie le backend

#### **Status 500**
❌ **Erreur serveur**

**Solution :** Vérifier les logs Render

---

### **5. Tester changer rôle**

```javascript
const userId = "USER_ID_ICI";
const token = localStorage.getItem('token');

fetch(`https://smartsearch-backend-pxw5.onrender.com/api/admin/users/${userId}/role`, {
  method: 'PATCH',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ role: 'admin' })
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

---

### **6. Tester supprimer utilisateur**

⚠️ **Attention :** Ne pas utiliser votre propre ID !

```javascript
const userId = "USER_ID_ICI";
const token = localStorage.getItem('token');

fetch(`https://smartsearch-backend-pxw5.onrender.com/api/admin/users/${userId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(response => response.json())
.then(data => console.log('Response:', data))
.catch(err => console.error('Error:', err));
```

---

## 🔧 Solutions rapides

### **Problème : Token invalide**

```javascript
// Se déconnecter et vider le cache
localStorage.clear();
window.location.href = 'login.html';
```

### **Problème : Endpoint 404**

Vérifier que le backend est à jour :
```javascript
fetch('https://smartsearch-backend-pxw5.onrender.com/')
  .then(r => r.json())
  .then(data => console.log('Backend version:', data.version));
```

Devrait afficher : `Backend version: 2.0.0`

### **Problème : CORS**

Si erreur CORS, le backend doit ajouter votre domaine frontend dans la config CORS.

---

## 📋 Checklist de debug

- [ ] Token existe et n'est pas null
- [ ] Token commence par `eyJ`
- [ ] Role = `admin`
- [ ] Status code = 200 (pas 401/403/404)
- [ ] `data.success = true`
- [ ] Backend version = 2.0.0

---

## 🎯 Résultat attendu

Après toutes les corrections, vous devriez voir :

```json
{
  "success": true,
  "message": "Mot de passe réinitialisé avec succès"
}
```

ou

```json
{
  "success": true,
  "message": "Rôle modifié de declarant à admin"
}
```

---

## 📞 Si ça ne marche toujours pas

1. **Copier les résultats de la console** (texte complet)
2. **Prendre screenshot de l'erreur**
3. **Vérifier les logs Render backend**

Le problème est soit :
- 🔐 Token expiré/invalide
- 🚫 Backend pas déployé
- ⚙️ Format de réponse différent
