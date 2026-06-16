# 🔐 Réinitialiser le Mot de Passe Admin sur Render

## 🎯 Situation

Votre serveur **local** fonctionne maintenant (admin/admin), mais le serveur **Render** refuse toujours la connexion.

**Cause** : Le compte admin sur MongoDB Atlas (base de données Render) a un mot de passe différent.

---

## 🛠️ Solution : Réinitialiser sur Render

### Méthode 1 : Via le Shell Render (Recommandé)

1. **Allez sur le Dashboard Render**
   - https://dashboard.render.com
   - Sélectionnez votre service backend

2. **Ouvrez le Shell**
   - Cliquez sur l'onglet "Shell"
   - Ou allez dans "Connect" → "Shell"

3. **Exécutez le script**
   ```bash
   node reset-admin-password.js
   ```

4. **Vérifiez**
   Le script devrait afficher :
   ```
   ✅ Mot de passe réinitialisé avec succès !
   
   Vous pouvez maintenant vous connecter avec:
      Username: admin
      Password: admin
   ```

5. **Testez la connexion**
   - Retournez sur votre site Render
   - Connectez-vous avec admin/admin

---

### Méthode 2 : Via MongoDB Atlas Direct

Si le shell Render ne fonctionne pas :

1. **Allez sur MongoDB Atlas**
   - https://cloud.mongodb.com
   - Sélectionnez votre cluster

2. **Ouvrez MongoDB Compass ou Shell**
   - Cliquez sur "Browse Collections"
   - Ou "Connect" → "MongoDB Compass"

3. **Trouvez la collection `users`**
   - Database: `documents_perdus` (ou votre nom de DB)
   - Collection: `users`

4. **Trouvez le document admin**
   - Filtrer par : `{ "username": "admin" }`

5. **Générez un nouveau hash bcrypt**
   
   Utilisez ce site pour générer un hash :
   - https://bcrypt-generator.com/
   - Mot de passe : `admin`
   - Rounds : 10
   - Copiez le hash généré (commence par `$2b$10$...`)

6. **Mettez à jour le document**
   ```javascript
   {
     "password": "$2b$10$VOTRE_HASH_ICI",
     "isActive": true,
     "emailVerified": true
   }
   ```

7. **Sauvegardez et testez**

---

### Méthode 3 : Via API Endpoint (À créer)

Si vous voulez une solution plus simple pour l'avenir, vous pouvez créer un endpoint API de réinitialisation.

**⚠️ ATTENTION** : Sécurisez cet endpoint avec un code secret !

Je peux vous créer cet endpoint si vous le souhaitez.

---

## 🔒 Sécurité en Production

### ⚠️ Recommandations IMPORTANTES

Une fois que vous pouvez vous connecter avec `admin/admin` sur Render :

1. **Changez IMMÉDIATEMENT le mot de passe**
   - Ne laissez JAMAIS `admin/admin` en production
   - Utilisez un mot de passe fort

2. **Exemple de mot de passe fort** :
   ```
   Admin2026!SecureP@ss#XyZ
   ```
   - 12+ caractères
   - Majuscules et minuscules
   - Chiffres
   - Symboles spéciaux

3. **Notez le mot de passe**
   - Utilisez un gestionnaire de mots de passe (LastPass, 1Password, Bitwarden)
   - Ou notez-le dans un endroit sûr

---

## 📋 Checklist Post-Réinitialisation

Après avoir réinitialisé le mot de passe sur Render :

- [ ] ✅ Connexion fonctionne avec admin/admin
- [ ] 🔒 Mot de passe changé vers un mot de passe fort
- [ ] 📝 Nouveau mot de passe noté dans un endroit sûr
- [ ] 🧪 Testé la création de déclarations
- [ ] 🧪 Testé le matching automatique
- [ ] 🧪 Testé l'affichage des correspondances

---

## 🆘 Si Vous N'Avez Pas Accès au Shell Render

### Option A : Utiliser le Compte Test

Si le compte `test` existe et fonctionne :
1. Créez un nouvel utilisateur avec le rôle admin
2. Utilisez ce nouveau compte

### Option B : Recréer la Base de Données

⚠️ **ATTENTION** : Cela supprimera TOUTES les données !

1. Supprimez toutes les collections dans MongoDB Atlas
2. Redémarrez le serveur Render
3. Le système créera automatiquement un compte admin par défaut

### Option C : Demander de l'Aide

Si aucune méthode ne fonctionne, contactez-moi avec :
1. Capture d'écran de l'erreur
2. Logs du serveur Render
3. Structure de votre base MongoDB Atlas

---

## 🎯 Résumé Rapide

### En Local ✅
```bash
cd backend
node reset-admin-password.js
# Connexion: admin/admin fonctionne !
```

### Sur Render ⏳
```bash
# Via Shell Render:
node reset-admin-password.js

# Ou via MongoDB Atlas:
# Générer hash bcrypt → Mettre à jour le document users
```

---

## 📞 Support

Si vous avez besoin d'aide :
1. Envoyez-moi une capture d'écran
2. Partagez les logs d'erreur
3. Indiquez quelle méthode vous avez essayé

---

**Créé le** : 2026-06-16  
**Pour** : Réinitialisation mot de passe sur Render  
**Status** : Guide prêt à utiliser
