# Test de Connexion Admin - Documents Perdus

## ✅ Problèmes Résolus

### 1. Redirection après inscription
- ✅ Message de succès affiché avec couleur verte
- ✅ Redirection automatique vers login.html après 1.5 secondes
- ✅ Validation du rôle et du code admin côté frontend

### 2. Dashboard Admin
- ✅ Correction de la redirection : `admin.html` → `dashboard.html`
- ✅ Routes API fonctionnelles :
  - `/statistiques` : Affiche les stats globales
  - `/correspondances` : Affiche les matchs automatiques
  - `/documents` : Liste tous les documents
- ✅ Menu de navigation ajouté

## 🧪 Tests à effectuer

### Test 1 : Inscription Déclarant
1. Ouvrir `frontend/register.html`
2. Remplir :
   - Username : `testuser` (min 3 caractères)
   - Password : `test123456` (min 6 caractères)
   - Type : **Déclarant**
3. ✅ Le champ "Code administrateur" doit être masqué
4. Cliquer sur "S'inscrire"
5. ✅ Message vert : "✓ Compte créé avec succès ! Redirection..."
6. ✅ Redirection automatique vers login.html

### Test 2 : Inscription Admin
1. Ouvrir `frontend/register.html`
2. Remplir :
   - Username : `admin2`
   - Password : `admin123456`
   - Type : **Administrateur**
3. ✅ Le champ "Code administrateur" doit apparaître
4. Entrer le code : `ADMIN2026`
5. Cliquer sur "S'inscrire"
6. ✅ Redirection automatique vers login.html

### Test 3 : Connexion Admin
1. Ouvrir `frontend/login.html`
2. Se connecter avec :
   - Username : `admin`
   - Password : `admin123`
3. ✅ Redirection vers `dashboard.html`
4. ✅ Affichage des statistiques :
   - Total documents : 7
   - Perdus : 5
   - Trouvés : 2
   - Correspondances : 2
   - Taux récupération : 40%
5. ✅ Graphiques visibles :
   - Évolution par mois
   - Documents par type
   - Top lieux
   - Répartition perdu/trouvé
6. ✅ Correspondances automatiques affichées

### Test 4 : Navigation Admin
1. Depuis le dashboard, cliquer sur "📄 Gérer Documents"
2. ✅ Redirection vers `admin-documents.html`
3. ✅ Liste de tous les documents affichée
4. ✅ Possibilité de :
   - Filtrer par type, statut, lieu
   - Modifier un document
   - Valider un document
   - Supprimer un document

## 🔧 Commandes Serveur

### Démarrer le serveur
```bash
cd backend
npm start
```

### Vérifier que le serveur tourne
```bash
curl http://localhost:3000/login
```

### Tester les routes admin
```bash
# Login
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Statistiques (avec le token obtenu)
curl http://localhost:3000/statistiques \
  -H "Authorization: Bearer <TOKEN>"
```

## 📝 Comptes de Test Disponibles

| Username | Password | Rôle |
|----------|----------|------|
| admin | admin123 | Administrateur |
| declarant1 | declarant123 | Déclarant |
| MEUPIE | (voir users.json) | Administrateur |

## 🎯 URLs Importantes

- **Inscription** : `frontend/register.html`
- **Connexion** : `frontend/login.html`
- **Dashboard Admin** : `frontend/dashboard.html`
- **Gestion Documents** : `frontend/admin-documents.html`
- **Déclaration** : `frontend/index.html`
- **Recherche** : `frontend/recherche.html`

## ⚠️ Points d'Attention

1. Le serveur doit tourner sur `http://localhost:3000`
2. Les fichiers JSON sont stockés dans `backend/users.json` et `backend/documents.json`
3. Le code admin par défaut est `ADMIN2026` (configurable dans `.env`)
4. Les tokens JWT expirent après 24h
