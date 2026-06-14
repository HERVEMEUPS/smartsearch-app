# 🚀 Guide de Démarrage Rapide - Documents Perdus

## 📋 Prérequis
- ✅ Node.js installé
- ✅ Le serveur backend doit tourner

## 1️⃣ Démarrer le Serveur

```bash
# Ouvrir un terminal dans le dossier backend
cd backend

# Installer les dépendances (première fois seulement)
npm install

# Démarrer le serveur
npm start
```

✅ **Vérification** : Vous devez voir "Serveur lancé sur http://localhost:3000"

## 2️⃣ Accéder à l'Application

### Option A : Via un Navigateur Web
1. Ouvrir votre navigateur (Chrome, Firefox, Edge...)
2. Installer l'extension "Live Server" dans VSCode (si vous l'utilisez)
3. Clic droit sur `frontend/index.html` → "Open with Live Server"

### Option B : Directement depuis les fichiers
1. Naviguer vers le dossier `frontend`
2. Double-cliquer sur `login.html`

## 3️⃣ Tester la Connexion Admin

### Se connecter comme Admin
1. Ouvrir : `frontend/login.html`
2. Entrer :
   - **Username** : `admin`
   - **Password** : `admin123`
3. Cliquer sur "Se connecter"
4. ✅ **Résultat attendu** : Redirection vers le dashboard avec :
   - Statistiques affichées (Total, Perdus, Trouvés...)
   - 4 graphiques visibles
   - Liste des correspondances automatiques
   - Menu de navigation en haut

## 4️⃣ Tester la Création de Compte

### Créer un Compte Déclarant
1. Ouvrir : `frontend/register.html`
2. Entrer :
   - **Username** : `nouveauuser` (min 3 caractères)
   - **Password** : `password123` (min 6 caractères)
   - **Type de compte** : Sélectionner "Déclarant"
3. ✅ Le champ "Code administrateur" reste caché
4. Cliquer sur "S'inscrire"
5. ✅ Message vert : "✓ Compte créé avec succès ! Redirection..."
6. ✅ Redirection automatique vers la page de connexion

### Créer un Compte Admin
1. Ouvrir : `frontend/register.html`
2. Entrer :
   - **Username** : `admin2`
   - **Password** : `admin123456`
   - **Type de compte** : Sélectionner "Administrateur"
3. ✅ Le champ "Code administrateur" apparaît
4. Entrer le code : `ADMIN2026`
5. Cliquer sur "S'inscrire"
6. ✅ Redirection vers login.html

## 5️⃣ Explorer le Dashboard Admin

### Depuis le Dashboard
1. **Voir les Statistiques** : Scroll vers le haut
   - Total de documents
   - Nombre de perdus/trouvés
   - Correspondances automatiques
   - Taux de récupération

2. **Voir les Graphiques** : Scroll au milieu
   - Évolution mensuelle
   - Documents par type
   - Lieux de perte
   - Répartition perdu/trouvé

3. **Voir les Correspondances** : Scroll vers le bas
   - Matchs automatiques entre documents perdus et trouvés
   - Score de correspondance
   - Détails de chaque match

### Gérer les Documents
1. Cliquer sur "📄 Gérer Documents" dans le menu
2. Voir tous les documents enregistrés
3. Actions disponibles :
   - ✏️ Modifier un document
   - ✅ Valider un document
   - 🗑️ Supprimer un document
   - 🔍 Filtrer par type/statut/lieu

## 6️⃣ Tester en tant que Déclarant

### Se connecter comme Déclarant
1. Ouvrir : `frontend/login.html`
2. Entrer :
   - **Username** : `declarant1`
   - **Password** : `declarant123`
3. ✅ Redirection vers `index.html` (page d'accueil déclarant)

### Déclarer un Document
1. Remplir le formulaire :
   - Type de déclaration : Perdu / Trouvé
   - Type de document : CNI / Passport / etc.
   - Nom du propriétaire
   - Numéro (si connu)
   - Lieu de perte/découverte
   - Date
   - Description
2. Cliquer sur "Enregistrer"
3. ✅ Confirmation : Document enregistré

### Rechercher un Document
1. Aller sur `frontend/recherche.html`
2. Entrer des critères de recherche
3. Cliquer sur "Rechercher"
4. ✅ Résultats avec scores de correspondance

## 🔧 Dépannage

### Le serveur ne démarre pas
```bash
# Vérifier que le port 3000 est libre
netstat -ano | findstr :3000

# Tuer le processus si nécessaire
taskkill /F /PID <PID>

# Redémarrer
npm start
```

### "Erreur serveur" lors de la connexion
1. Vérifier que le serveur tourne : `http://localhost:3000`
2. Ouvrir la console du navigateur (F12) pour voir les erreurs
3. Vérifier le fichier `backend/users.json` existe

### Le dashboard est vide
1. Vérifier que des documents existent dans `backend/documents.json`
2. Ouvrir la console du navigateur (F12)
3. Vérifier que le token est valide dans localStorage

### CORS Error
1. Vérifier que le serveur backend autorise CORS
2. Relancer le serveur
3. Vider le cache du navigateur (Ctrl+Shift+Delete)

## 📱 URLs Rapides

| Page | URL | Accès |
|------|-----|-------|
| Connexion | `frontend/login.html` | Tous |
| Inscription | `frontend/register.html` | Tous |
| Dashboard | `frontend/dashboard.html` | Admin uniquement |
| Gestion Docs | `frontend/admin-documents.html` | Admin uniquement |
| Accueil | `frontend/index.html` | Déclarants |
| Recherche | `frontend/recherche.html` | Déclarants |

## 🎯 Comptes de Test

| Username | Password | Rôle |
|----------|----------|------|
| `admin` | `admin123` | Administrateur |
| `declarant1` | `declarant123` | Déclarant |

## ✅ Checklist de Vérification

- [ ] Serveur backend lancé (port 3000)
- [ ] Connexion admin fonctionne
- [ ] Dashboard affiche les stats
- [ ] Graphiques visibles
- [ ] Menu de navigation fonctionne
- [ ] Création de compte fonctionne
- [ ] Redirection automatique après inscription
- [ ] Champ code admin apparaît/disparaît selon le rôle
- [ ] Déclaration de document fonctionne
- [ ] Recherche de document fonctionne

## 🆘 Support

Si un problème persiste :
1. Vérifier les logs du serveur dans le terminal
2. Ouvrir la console du navigateur (F12)
3. Vérifier les fichiers `users.json` et `documents.json`
4. Redémarrer le serveur
5. Vider le cache du navigateur

---

**Dernière mise à jour** : 11 juin 2026
**Version** : 3.0
