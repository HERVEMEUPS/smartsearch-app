# ⚡ Test Rapide - Pages Admin

**Objectif** : Vérifier que le dashboard et la page de gestion des documents fonctionnent

---

## 🎯 Test en 5 Minutes

### Étape 1 : Vérifier le Serveur (30 secondes)

```bash
# Terminal
cd backend
npm start

# ✓ Vous devez voir : "Serveur lancé sur http://localhost:3000"
```

---

### Étape 2 : Se Connecter (30 secondes)

1. Ouvrir : `frontend/login.html`
2. Entrer :
   - Username : `admin`
   - Password : `admin123`
3. Cliquer sur "Se connecter"

✅ **Résultat attendu** : Redirection vers `dashboard.html`

---

### Étape 3 : Vérifier le Dashboard (1 minute)

**Checklist visuelle** :

```
┌────────────────────────────────────────────┐
│ 📊 Dashboard Administrateur                │
├────────────────────────────────────────────┤
│                                            │
│ ✓ Total: 8    ✓ Perdus: 6                │
│ ✓ Trouvés: 2  ✓ Correspondances: 2       │
│                                            │
│ ✓ Graphique "Évolution par Mois"         │
│ ✓ Graphique "Documents par Type"         │
│ ✓ Graphique "Top Lieux"                  │
│ ✓ Graphique "Répartition Perdu/Trouvé"   │
│                                            │
│ ✓ Section "Correspondances Automatiques"  │
│   - 2 correspondances affichées           │
└────────────────────────────────────────────┘
```

**Si tout est ✓** → Dashboard fonctionne ! ✅

---

### Étape 4 : Vérifier la Gestion Documents (1 minute)

1. Cliquer sur "📄 Gérer Documents" (menu du haut)

**Checklist visuelle** :

```
┌────────────────────────────────────────────┐
│ 📁 Gestion des Documents                  │
├────────────────────────────────────────────┤
│                                            │
│ ✓ Total: 8  Perdus: 6  Trouvés: 2        │
│                                            │
│ ✓ Filtres visibles (4 champs)            │
│ ✓ Boutons (Rechercher, Réinitialiser)    │
│                                            │
│ ✓ Onglets : [Tous] [Perdus] [Trouvés]    │
│                                            │
│ ✓ Tableau avec 8 documents :              │
│   1. CNI - MEUPIE Rodrigue               │
│   2. Passport - FOSSI                     │
│   3. Acte - MAFO Krystie                 │
│   4. Acte - DJANGA Kymia                 │
│   5. Acte - DJANGA Kymia                 │
│   6. Acte - DJANGA Kymie                 │
│   7. Passport - FOSSI                     │
│   8. Permis - MEUPIE                      │
│                                            │
│ ✓ Boutons action : 👁️ ✏️ ✅ 🗑️         │
└────────────────────────────────────────────┘
```

**Si tout est ✓** → Page admin fonctionne ! ✅

---

### Étape 5 : Test Fonctionnel Rapide (2 minutes)

#### Test A : Filtrer

1. Dans le champ "Type de document", taper : `Passport`
2. Cliquer sur "🔍 Rechercher"
3. ✅ Résultat : 2 documents affichés (les passeports)

#### Test B : Changer d'Onglet

1. Cliquer sur "Documents Perdus"
2. ✅ Résultat : 6 documents affichés
3. Cliquer sur "Documents Trouvés"
4. ✅ Résultat : 2 documents affichés

#### Test C : Voir un Document

1. Cliquer sur l'icône 👁️ d'un document
2. ✅ Résultat : Une modale s'ouvre avec tous les détails

---

## 🚨 Que Faire en Cas d'Erreur ?

### Problème 1 : Page Vide

**Solution** :
1. Ouvrir la Console (F12)
2. Vérifier s'il y a une erreur rouge
3. Si oui, prendre une capture d'écran
4. Ouvrir `TEST_DASHBOARD_SIMPLE.html` pour diagnostiquer

---

### Problème 2 : "Token invalide"

**Solution** :
1. Se déconnecter
2. Vider le cache (Ctrl + Shift + Delete)
3. Se reconnecter

---

### Problème 3 : Statistiques à "-"

**Solution** :
1. Vérifier que le serveur tourne
2. Ouvrir la console (F12)
3. Chercher une erreur réseau (rouge)
4. Vérifier l'URL : doit être `http://localhost:3000`

---

## 📊 Résultats Attendus

| Test | Résultat Attendu | Votre Résultat |
|------|------------------|----------------|
| Connexion | Redirection vers dashboard | ☐ OK ☐ KO |
| Dashboard stats | 8, 6, 2, 2 | ☐ OK ☐ KO |
| Dashboard graphiques | 4 graphiques visibles | ☐ OK ☐ KO |
| Admin stats | 8, 6, 2 | ☐ OK ☐ KO |
| Admin tableau | 8 documents | ☐ OK ☐ KO |
| Filtres | Fonctionnels | ☐ OK ☐ KO |
| Onglets | Fonctionnels | ☐ OK ☐ KO |
| Boutons action | Cliquables | ☐ OK ☐ KO |

---

## ✅ Validation Finale

Si tous les tests sont ✓ :

```
🎉 SUCCÈS !
✓ Dashboard fonctionnel
✓ Gestion documents fonctionnelle
✓ Toutes les API fonctionnent
✓ Interface réactive
```

Votre application est prête à l'emploi ! 🚀

---

## 🛠️ Outils de Debug Disponibles

### Pour Diagnostic Approfondi

1. **TEST_DASHBOARD_SIMPLE.html**
   - Test pas à pas de toutes les fonctionnalités
   - Console de debug intégrée
   - Test des routes API

2. **DEBUG_ADMIN_DOCUMENTS.html**
   - Diagnostic spécifique page admin
   - Affichage des données brutes
   - Test d'authentification

3. **Console Navigateur (F12)**
   - Onglet "Console" : erreurs JavaScript
   - Onglet "Network" : appels API
   - Onglet "Application" : localStorage

---

## 📞 Aide Rapide

### Commandes Utiles

```bash
# Redémarrer le serveur
cd backend
taskkill /F /PID <PID>
npm start

# Tester l'API
curl http://localhost:3000/stats-public

# Se connecter via API
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

---

**Temps total du test** : 5 minutes  
**Difficulté** : Facile  
**Prérequis** : Serveur démarré
