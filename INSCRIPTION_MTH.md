# 👤 Créer votre Compte MTH

## 🎯 Méthode la Plus Simple

### Étape 1 : Aller sur la Page d'Inscription

Cliquez sur ce lien :
**https://smartsearch-frontend.onrender.com/register.html**

### Étape 2 : Remplir le Formulaire

```
Nom d'utilisateur: MTH
Email: mth@smartsearch.com
Mot de passe: (choisissez un mot de passe)
Type de compte: Admin
Code administrateur: ADMIN2026
```

### Étape 3 : Cliquer sur "Créer un compte"

Vous verrez un message de confirmation.

### Étape 4 : Se Connecter

Retournez sur :
**https://smartsearch-frontend.onrender.com/login.html**

Et connectez-vous avec vos identifiants !

---

## ⚠️ Note Importante

**Le compte "MTH" n'existe pas encore dans la base de données MongoDB Atlas.**

C'est pourquoi vous voyez "Erreur serveur" ou "Identifiants incorrects" quand vous essayez de vous connecter.

Vous devez d'abord **créer** le compte via l'inscription, puis vous pourrez vous **connecter**.

---

## 🔄 Alternative : Inscription via Console

Si vous ne voulez pas passer par l'interface web, attendez 5 minutes (pour que le rate limiter se réinitialise) et exécutez :

```bash
curl -X POST https://smartsearch-backend-pxw5.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "MTH",
    "email": "mth@smartsearch.com",
    "password": "Mth@2026",
    "role": "admin",
    "adminCode": "ADMIN2026"
  }'
```

Mot de passe : `Mth@2026`

---

## ✅ Vérification

Une fois inscrit, testez la connexion :

```bash
curl -X POST https://smartsearch-backend-pxw5.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "MTH",
    "password": "Mth@2026"
  }'
```

Vous devriez voir :
```json
{
  "success": true,
  "message": "Connexion réussie",
  "data": {
    "user": {...},
    "accessToken": "eyJ..."
  }
}
```

---

## 🎯 Résumé

1. ❌ **Pourquoi ça ne marche pas** : Le compte MTH n'existe pas dans la base de données
2. ✅ **Solution** : S'inscrire d'abord via https://smartsearch-frontend.onrender.com/register.html
3. ✅ **Ensuite** : Se connecter avec les identifiants créés

**Le système fonctionne correctement** - il faut juste créer le compte avant de se connecter ! 😊
