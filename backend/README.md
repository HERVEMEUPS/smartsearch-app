# Backend - Documents Perdus V3 (Sécurisé)

## 🔒 Corrections de sécurité appliquées

### Problèmes corrigés

1. **Hachage des mots de passe avec bcrypt**
   - Les mots de passe sont maintenant hachés avant stockage
   - Utilisation de bcrypt avec 10 rounds de salage

2. **Authentification JWT**
   - Tokens JWT pour toutes les routes protégées
   - Les routes `/declaration` et `/recherche` nécessitent un token valide
   - Expiration des tokens après 24h

3. **Variables d'environnement**
   - Code admin et secret JWT stockés dans `.env`
   - Plus de secrets en dur dans le code

4. **Validation des entrées**
   - Vérification des champs requis
   - Validation de la longueur des mots de passe (min 6 caractères)
   - Validation des rôles

5. **Gestion des erreurs**
   - Try-catch sur toutes les routes
   - Initialisation automatique des fichiers JSON
   - Messages d'erreur appropriés

6. **ID utilisateur sécurisé**
   - Utilisation de `Math.max(id) + 1` au lieu de `length + 1`

7. **Score de recherche amélioré**
   - Seuil abaissé à 3 pour inclure les recherches par type de document
   - Filtre de score uniquement si des critères sont fournis

## 📦 Installation

```bash
npm install
```

## ⚙️ Configuration

1. Copier `.env.example` vers `.env`
2. Modifier les valeurs dans `.env` :
   - `JWT_SECRET` : Changez avec une chaîne aléatoire complexe
   - `ADMIN_CODE` : Changez le code d'accès admin
   - `PORT` : Port du serveur (par défaut 3000)

## 🚀 Démarrage

```bash
npm start
```

## 🔐 Routes API

### POST /register
Inscription d'un utilisateur
```json
{
  "username": "utilisateur",
  "password": "motdepasse123",
  "role": "declarant",
  "adminCode": "ADMIN2026" // Uniquement pour role="admin"
}
```

### POST /login
Connexion
```json
{
  "username": "utilisateur",
  "password": "motdepasse123"
}
```
Retourne un token JWT à utiliser dans les requêtes suivantes.

### POST /declaration (protégée 🔒)
Déclarer un document perdu/trouvé
```
Headers: Authorization: Bearer <token>
Body: {
  "typeDocument": "CNI",
  "nom": "Dupont",
  "numero": "123456",
  "typeDeclaration": "perdu",
  "lieu": "Paris",
  "date": "2026-06-06"
}
```

### GET /recherche (protégée 🔒)
Rechercher des documents
```
Headers: Authorization: Bearer <token>
Query params: ?nom=Dupont&typeDocument=CNI&lieu=Paris&dateDebut=2026-01-01&dateFin=2026-12-31
```

### GET /documents (protégée 🔒 - admin uniquement)
Récupérer tous les documents
```
Headers: Authorization: Bearer <token>
```

## 🔑 Utilisation du token JWT

Après le login, utilisez le token retourné dans l'en-tête de toutes les requêtes :
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ⚠️ Important

- Ne jamais commiter le fichier `.env`
- Changer les valeurs par défaut du `.env` en production
- Les fichiers `users.json` et `documents.json` sont générés automatiquement
