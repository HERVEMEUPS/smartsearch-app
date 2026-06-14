# 📐 DIAGRAMMES UML - Guide Complet

**Projet :** Système Intelligent de Documents Perdus  
**Auteur :** HERVEMEUPS  
**Date :** 6 juin 2026

---

## 📋 LISTE DES DIAGRAMMES CRÉÉS

| # | Diagramme | Fichier | Type | Statut |
|---|-----------|---------|------|--------|
| 1 | **Cas d'utilisation** | `01_cas_utilisation.puml` | Use Case | ✅ |
| 2 | **Classes** | `02_classes.puml` | Class | ✅ |
| 3 | **Séquence - Connexion** | `03_sequence_connexion.puml` | Sequence | ✅ |
| 4 | **Séquence - Recherche Intelligente** | `04_sequence_recherche_intelligente.puml` | Sequence | ✅ |
| 5 | **Activité - Matching** | `05_activite_matching.puml` | Activity | ✅ |
| 6 | **Déploiement** | `06_deploiement.puml` | Deployment | ✅ |
| 7 | **MCD Base de données** | `07_MCD_base_de_donnees.txt` | Conceptual Data Model | ✅ |

**Total :** 7 diagrammes professionnels ✅

---

## 🛠️ COMMENT GÉNÉRER LES IMAGES

### Méthode 1 : PlantUML Online (Le plus simple)

1. Aller sur : **https://www.plantuml.com/plantuml/uml/**
2. Copier le contenu d'un fichier `.puml`
3. Coller dans l'éditeur
4. Cliquer sur "Submit" ou appuyer sur Ctrl+S
5. Télécharger l'image générée (PNG, SVG, ou PDF)

### Méthode 2 : PlantUML avec VS Code

1. Installer l'extension **PlantUML** dans VS Code
2. Ouvrir un fichier `.puml`
3. Appuyer sur `Alt+D` pour prévisualiser
4. Clic droit → "Export Current Diagram" → Choisir le format

### Méthode 3 : PlantUML CLI (Avancé)

```bash
# Installer PlantUML
npm install -g node-plantuml

# Générer une image
puml generate 01_cas_utilisation.puml --png

# Générer toutes les images
puml generate *.puml --png
```

### Méthode 4 : Draw.io (Pour le MCD)

1. Aller sur : **https://app.diagrams.net/**
2. Créer le diagramme à partir du fichier texte `07_MCD_base_de_donnees.txt`
3. Utiliser les formes ER (Entity-Relationship)
4. Exporter en PNG ou PDF

---

## 📊 DESCRIPTION DES DIAGRAMMES

### 1️⃣ Diagramme de Cas d'Utilisation

**Rôle :** Vue d'ensemble des fonctionnalités du système

**Acteurs :**
- Visiteur (non connecté)
- Déclarant (utilisateur authentifié)
- Administrateur

**Cas d'utilisation principaux :**
- Authentification (inscription, connexion)
- Gestion des déclarations
- Recherche intelligente
- Administration (dashboard, statistiques)

**Spécificités :**
- Recherche floue avec algorithme de Levenshtein
- Correspondances automatiques perdu ↔ trouvé

---

### 2️⃣ Diagramme de Classes

**Rôle :** Structure des classes et relations

**Classes principales :**
- **Utilisateur** (Declarant, Administrateur)
- **Document**
- **RechercheIntelligente** (algorithme fuzzy)
- **MatchingEngine** (correspondances automatiques)
- **Correspondance**
- **Statistiques**
- **AuthenticationService**

**Relations :**
- Héritage : Déclarant et Administrateur héritent d'Utilisateur
- Association : Utilisateur déclare des Documents
- Utilisation : RechercheIntelligente utilise Documents

---

### 3️⃣ Diagramme de Séquence - Connexion

**Rôle :** Processus d'authentification JWT

**Flux :**
1. Utilisateur saisit identifiants
2. Frontend valide et envoie POST /login
3. API vérifie dans users.json
4. Si valide : bcrypt compare le mot de passe
5. Génération token JWT (expiration 24h)
6. Stockage dans localStorage
7. Redirection vers accueil

**Sécurité illustrée :**
- Hachage bcrypt
- Token JWT signé
- Gestion des erreurs 401

---

### 4️⃣ Diagramme de Séquence - Recherche Intelligente

**Rôle :** Algorithme de recherche floue

**Flux :**
1. Déclarant saisit "DUPON" (avec faute)
2. Frontend envoie GET /recherche avec token JWT
3. Vérification authentification (middleware)
4. Chargement documents.json
5. **Fuzzy Search avec Fuse.js**
   - Calcul de similarité (Levenshtein)
   - "DUPON" vs "DUPONT" → 90% similaire
6. Calcul du score pondéré (0-100)
7. Filtrage et tri
8. Retour résultats avec scores

**Points clés :**
- Tolérance aux fautes de frappe
- Scoring intelligent
- Détails de matching

---

### 5️⃣ Diagramme d'Activité - Matching Automatique

**Rôle :** Algorithme de correspondances perdu ↔ trouvé

**Étapes :**
1. Séparer documents perdus et trouvés
2. Pour chaque combinaison perdu/trouvé :
   - Calculer similarité du type (30%)
   - Calculer similarité du nom (40%)
   - Comparer numéros (20%)
   - Comparer lieux (10%)
   - Bonus proximité temporelle
3. Si score >= 70% : créer correspondance
4. Déterminer confiance (moyenne, élevée, très élevée)
5. Optionnel : notifier les utilisateurs

**Exemple illustré :**
- Document perdu : CNI DUPONT, n°123456
- Document trouvé : CNI DUPON, n°123456
- Score calculé : 97% → Confiance très élevée

---

### 6️⃣ Diagramme de Déploiement

**Rôle :** Architecture technique du système

**Composants :**
- **Poste Client** : Navigateur avec HTML/CSS/JS
- **Serveur Application** : Node.js + Express
- **Bibliothèques** : bcrypt, JWT, fuse.js, etc.
- **Stockage** : users.json, documents.json, .env
- **CDN** : Chart.js pour graphiques

**Protocole :**
- HTTP/HTTPS REST
- Token JWT dans header Authorization

---

### 7️⃣ MCD - Modèle Conceptuel de Données

**Rôle :** Structure de la base de données

**Entités :**
1. **UTILISATEUR** (id, username, password, role)
2. **DOCUMENT** (id, type_declaration, type_document, nom, etc.)
3. **CORRESPONDANCE** (id, score_match, confiance)
4. **NOTIFICATION** (id, type, message, lu)

**Associations :**
- UTILISATEUR déclare DOCUMENT (1,n -- 0,n)
- DOCUMENT correspond_a DOCUMENT via CORRESPONDANCE
- CORRESPONDANCE génère NOTIFICATION (1,1 -- 1,n)

**Extension SQL fournie :** Scripts PostgreSQL prêts à l'emploi

---

## 📖 UTILISATION DANS LE MÉMOIRE

### Chapitre 2 : ANALYSE

**Insérer :**
- Diagramme de cas d'utilisation
- Description de chaque cas d'utilisation
- Acteurs du système

**Exemple de texte :**
> "La Figure 2.1 présente le diagramme de cas d'utilisation du système. On distingue trois acteurs principaux : le Visiteur (non authentifié), le Déclarant (utilisateur authentifié) et l'Administrateur. Le cas d'utilisation 'Rechercher des documents' inclut obligatoirement la recherche floue (fuzzy search) qui permet une tolérance aux fautes de frappe grâce à l'algorithme de Levenshtein."

---

### Chapitre 3 : CONCEPTION

**Insérer :**
- Diagramme de classes complet
- Diagramme de déploiement
- MCD de la base de données

**Exemple de texte :**
> "La Figure 3.2 illustre le diagramme de classes du système. La classe RechercheIntelligente constitue le cœur de l'intelligence du système, utilisant la bibliothèque Fuse.js pour implémenter le fuzzy matching. Elle calcule un score de pertinence sur 100 points en pondérant différents critères : le numéro (50%), le nom (30%), le type (20%) et le lieu (15%)."

---

### Chapitre 4 : IMPLÉMENTATION

**Insérer :**
- Diagrammes de séquence (connexion, recherche)
- Diagramme d'activité (matching)

**Exemple de texte :**
> "La Figure 4.1 détaille le processus d'authentification par token JWT. Après vérification des identifiants via bcrypt, un token signé est généré avec une durée de validité de 24 heures. Ce mécanisme assure une authentification stateless, évitant ainsi le stockage de sessions côté serveur."

---

## ✅ CHECKLIST POUR LE MÉMOIRE

- [ ] Générer toutes les images en PNG (haute résolution)
- [ ] Insérer les images dans le document Word/LaTeX
- [ ] Numéroter les figures (Figure 2.1, Figure 3.2, etc.)
- [ ] Ajouter des légendes explicatives sous chaque figure
- [ ] Référencer les figures dans le texte ("cf. Figure 2.1")
- [ ] Créer une table des figures après la table des matières
- [ ] Expliquer chaque diagramme en 1-2 paragraphes
- [ ] Justifier les choix de conception

---

## 🎯 POUR LA SOUTENANCE

### Diagrammes à projeter :

1. **Cas d'utilisation** (slide 5-6)
   - Présenter les acteurs
   - Insister sur la recherche intelligente

2. **Séquence - Recherche intelligente** (slide 10-12)
   - Démontrer l'aspect "intelligent"
   - Expliquer le fuzzy matching

3. **Activité - Matching automatique** (slide 13-14)
   - Algorithme de correspondances
   - Exemple concret avec scores

4. **Déploiement** (slide 8-9)
   - Architecture technique
   - Technologies utilisées

### Script de présentation :

> "Comme le montre ce diagramme de séquence, lorsqu'un utilisateur recherche 'DUPON', le système utilise l'algorithme de Levenshtein pour calculer une similarité de 90% avec 'DUPONT' et retourne le résultat avec un score de pertinence de 57/100. Ceci illustre l'intelligence du système qui tolère les fautes de frappe."

---

## 📦 LIVRABLES

### Pour le mémoire imprimé :
- ✅ 7 diagrammes en PNG haute résolution (300 DPI)
- ✅ Légendes et numérotation
- ✅ Texte explicatif pour chaque diagramme

### Pour la présentation :
- ✅ 4 diagrammes clés en slides PowerPoint
- ✅ Animations pour diagrammes de séquence
- ✅ Exemples concrets illustrés

### Pour les annexes :
- ✅ Code source des fichiers .puml
- ✅ Scripts SQL (MCD)

---

## 🎓 CONSEILS ACADÉMIQUES

### Qualité des diagrammes :
- Utiliser une police lisible (Arial, Calibri)
- Respecter la notation UML standard
- Ajouter des notes explicatives sur les diagrammes
- Colorier les éléments importants

### Rédaction associée :
- Chaque diagramme doit être expliqué en texte
- Justifier les choix de conception
- Lier les diagrammes entre eux
- Minimum 1 page de texte par diagramme

### Erreurs à éviter :
- ❌ Insérer un diagramme sans l'expliquer
- ❌ Diagrammes trop complexes (simplifier)
- ❌ Pas de légende ni numérotation
- ❌ Images basse résolution

---

## 📞 RESSOURCES

**Outils gratuits :**
- PlantUML : https://plantuml.com/
- Draw.io : https://app.diagrams.net/
- Visual Paradigm Community : https://www.visual-paradigm.com/

**Tutoriels UML :**
- Cours UML complet : https://laurent-audibert.developpez.com/Cours-UML/
- PlantUML guide : https://plantuml.com/fr/guide

**Normes UML :**
- UML 2.5 Specification : https://www.omg.org/spec/UML/

---

**✅ Tous les diagrammes sont prêts pour votre mémoire !**

**Prochaine étape :** Générer les images et les intégrer dans votre document Word/LaTeX
