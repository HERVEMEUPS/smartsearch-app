# 🔧 Corrections des endpoints API - Dashboard Admin

## 📋 Problème identifié

Les pages admin (dashboard.html, admin-documents.html, admin-users.html) appelaient des endpoints API qui n'existaient pas ou avaient des chemins incorrects, provoquant des erreurs "Erreur lors du chargement du dashboard/données".

## ✅ Corrections effectuées

### 1. **Backend - Routes admin ajoutées** (`backend/src/routes/adminRoutes.js`)

Ajout de 3 nouvelles routes manquantes:
- `PATCH /api/admin/users/:userId/role` - Modifier le rôle d'un utilisateur
- `PATCH /api/admin/users/:userId/reset-password` - Réinitialiser le mot de passe
- `DELETE /api/admin/users/:userId` - Supprimer un utilisateur

### 2. **Backend - Contrôleur admin** (`backend/src/controllers/adminController.js`)

Ajout de 3 méthodes de contrôleur:
- `changeUserRole()` - Changer le rôle d'un utilisateur
- `resetUserPassword()` - Réinitialiser le mot de passe
- `deleteUser()` - Supprimer un utilisateur

### 3. **Backend - Service utilisateur** (`backend/src/services/userService.js`)

#### Méthodes ajoutées:
- `changeUserRole(userId, newRole)` - Modification du rôle avec audit log
- `resetUserPassword(userId, newPassword)` - Réinitialisation MDP avec validation
- `deleteUser(adminId, userId)` - Suppression avec protection auto-suppression

#### Méthode améliorée:
- `getStatistics()` - Maintenant retourne:
  - Total utilisateurs
  - Utilisateurs actifs/inactifs
  - Répartition par rôle (admins, déclarants)
  - **Top 10 déclarants** avec nombre de déclarations (agrégation MongoDB)

### 4. **Frontend - dashboard.html**

#### Corrections:
- ❌ `/api/admin/statistics` → ✅ `/api/admin/statistics/declarations`
- ❌ `/api/admin/users/statistics` → ✅ `/api/admin/statistics/users`
- Ajout de gestion du format de réponse: `result.success ? result.data : result`

### 5. **Frontend - admin-documents.html**

#### Corrections:
- Gestion du format de réponse API pour les documents
- Gestion du format de réponse pour les correspondances
- Support des formats: `{success, data}` et réponse directe

### 6. **Frontend - admin-users.html**

#### Corrections:
- ❌ `/api/admin/users/statistics` → ✅ `/api/admin/statistics/users`
- Gestion du format de réponse pour utilisateurs
- Fix des IDs utilisateur: support `_id` (MongoDB) et `id`
- Ajout de quotes autour des IDs dans les appels onclick (évite les erreurs JS)

## 🎯 Résultat

Maintenant les 3 pages admin devraient charger correctement:
- ✅ **Dashboard** - Affiche les statistiques des documents et utilisateurs
- ✅ **Gestion Documents** - Liste tous les documents avec stats
- ✅ **Gestion Utilisateurs** - Liste utilisateurs avec actions (modifier rôle, reset password, supprimer)

## 🧪 Tests à effectuer

1. **Dashboard** - Vérifier que les stats se chargent
2. **Gestion Documents** - Vérifier la liste des documents
3. **Gestion Utilisateurs** - Tester:
   - Modification de rôle
   - Réinitialisation de mot de passe
   - Suppression d'utilisateur (pas soi-même)

## 📝 Notes techniques

- Tous les endpoints ajoutés nécessitent authentification + rôle admin
- Les audit logs sont créés pour toutes les actions sensibles
- Protection contre la suppression de son propre compte admin
- Validation des mots de passe (min 6 caractères)
- Format de réponse standardisé: `{success: boolean, data: any, message?: string}`
