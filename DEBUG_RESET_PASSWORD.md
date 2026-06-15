# 🔧 Diagnostic: Réinitialisation du mot de passe

## 📋 Problème Identifié

L'utilisateur ne parvient pas à réinitialiser le mot de passe des utilisateurs depuis l'interface admin ([admin-users.html](frontend/admin-users.html)).

## 🔍 Investigation

### 1. **Test de l'API Backend**

Test effectué avec le script [test-reset-password.js](test-reset-password.js):

```bash
node test-reset-password.js
```

**Résultat:** Le serveur Render retourne `{"detail":"Not Found"}` pour toutes les requêtes.

### 2. **Analyse du Code**

#### ✅ Backend ([backend/src/controllers/adminController.js](backend/src/controllers/adminController.js:35-43))
```javascript
exports.resetUserPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const result = await userService.resetUserPassword(req.params.userId, newPassword);

  res.json({
    success: true,
    message: result.message || 'Mot de passe réinitialisé avec succès'
  });
});
```

#### ✅ Service ([backend/src/services/userService.js](backend/src/services/userService.js:339-361))
```javascript
async resetUserPassword(userId, newPassword) {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  if (!newPassword || newPassword.length < 6) {
    throw new Error('Le mot de passe doit faire au moins 6 caractères');
  }

  // Hasher et enregistrer le nouveau mot de passe
  user.password = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);
  await user.save();

  await AuditLog.log({
    action: 'RESET_USER_PASSWORD',
    entite: 'USER',
    entiteId: userId
  });

  return { message: 'Mot de passe réinitialisé avec succès' };
}
```

#### ✅ Route ([backend/src/routes/adminRoutes.js](backend/src/routes/adminRoutes.js:43))
```javascript
router.patch('/users/:userId/reset-password', adminController.resetUserPassword);
```

#### ✅ Frontend ([frontend/admin-users.html](frontend/admin-users.html:751-782))
```javascript
async function savePasswordReset() {
  const newPassword = document.getElementById("modalNewPassword").value;
  const token = localStorage.getItem("token");

  if (newPassword.length < 6) {
    alert("Le mot de passe doit faire au moins 6 caractères");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/api/admin/users/${currentUserId}/reset-password`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({ newPassword })
    });

    const data = await response.json();

    if (response.ok && data.success) {
      alert(data.message || "Mot de passe réinitialisé avec succès");
      closeModal("modalResetPassword");
    } else {
      alert(data.message || "Erreur lors de la réinitialisation");
    }
  } catch (error) {
    console.error("Erreur:", error);
    alert("Erreur lors de la réinitialisation du mot de passe");
  }
}
```

### 3. **Diagnostic du Problème**

❌ **Le backend déployé sur Render ne répond pas correctement**

```bash
curl -X POST https://smartsearch-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

**Réponse:** `{"detail":"Not Found"}`

Cette réponse `{"detail":"Not Found"}` est typique de **FastAPI** (Python), pas **Express** (Node.js), ce qui suggère:

1. Le mauvais service est déployé sur Render
2. Le service Express n'est pas correctement démarré
3. Il y a un problème de routing dans Render

## 🛠️ Solution

### Option 1: Redéployer le Backend sur Render

1. Vérifier que le service `smartsearch-backend` sur Render pointe vers le bon dépôt GitHub
2. Vérifier la commande de build: `cd backend && npm install`
3. Vérifier la commande de start: `cd backend && npm start`
4. Vérifier les variables d'environnement:
   - `MONGODB_URI` : URI de connexion MongoDB Atlas
   - `JWT_SECRET` : Secret JWT (généré automatiquement)
   - `ADMIN_CODE` : Code admin (ADMIN2026)
   - `PORT` : 10000

5. Redéployer manuellement depuis le dashboard Render

### Option 2: Tester Localement

```bash
# Terminal 1: Backend
cd backend
npm install
npm start

# Terminal 2: Test
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Option 3: Logs de Debug Ajoutés

Des logs détaillés ont été ajoutés dans [frontend/admin-users.html](frontend/admin-users.html) pour faciliter le diagnostic:

```javascript
console.log("🔧 Tentative de réinitialisation...");
console.log("   User ID:", currentUserId);
console.log("   Password length:", newPassword.length);
console.log("   URL:", url);
console.log("   Response status:", response.status, response.statusText);
console.log("   Response data:", data);
```

## 📝 Prochaines Étapes

1. ✅ **Logs de debug ajoutés** dans le frontend
2. ⏳ **Vérifier le déploiement Render**
3. ⏳ **Tester localement** pour confirmer que le code fonctionne
4. ⏳ **Redéployer** le backend correctement sur Render
5. ⏳ **Tester en production** après redéploiement

## 🔗 Fichiers Impliqués

- Frontend: [frontend/admin-users.html](frontend/admin-users.html:672-714)
- Backend Controller: [backend/src/controllers/adminController.js](backend/src/controllers/adminController.js:35-43)
- Backend Service: [backend/src/services/userService.js](backend/src/services/userService.js:339-361)
- Backend Route: [backend/src/routes/adminRoutes.js](backend/src/routes/adminRoutes.js:43)
- Configuration Render: [render.yaml](render.yaml:3-18)

## 🧪 Test Script

Script de test créé: [test-reset-password.js](test-reset-password.js)

```bash
node test-reset-password.js
```

Ce script teste l'ensemble du flow:
1. Connexion admin
2. Récupération des utilisateurs
3. Réinitialisation du mot de passe
4. Test de connexion avec le nouveau mot de passe
