# 📘 Guide de Compilation LaTeX - SmartSearch

## 🎯 Présentations Disponibles

### 1. Présentation Complète de la Plateforme
**Fichier** : `PRESENTATION_SMARTSEARCH.tex` (40+ slides)

**Contenu** :
- Contexte & Problématique
- Architecture globale
- Fonctionnalités (Utilisateur + Admin)
- Système de matching intelligent
- Sécurité
- Base de données
- Résultats & Performance
- Déploiement
- Tests & Validation
- Démonstration
- Difficultés rencontrées
- Perspectives
- Conclusion

**Public** : Jury de soutenance, enseignants, tout public

---

### 2. Présentation Fuzzy Matching (Focus Technique)
**Fichier** : `PRESENTATION_FUZZY_MATCHING.tex` (15 slides)

**Contenu** :
- Problème du matching
- Solution RapidFuzz
- Architecture technique
- Algorithmes
- Performance
- Validation

**Public** : Développeurs, architectes techniques

---

## 🛠️ Compilation

### Option 1 : Overleaf (Recommandé - En Ligne)

1. **Aller sur Overleaf** : https://www.overleaf.com
2. **Créer un compte** (gratuit)
3. **New Project** → **Upload Project**
4. **Uploader le fichier .tex**
5. **Cliquer sur "Recompile"**
6. **Télécharger le PDF**

**Avantages** :
- ✅ Aucune installation requise
- ✅ Compilation automatique
- ✅ Prévisualisation en temps réel
- ✅ Collaboration possible
- ✅ Templates gratuits

---

### Option 2 : Installation Locale (Windows)

#### Étape 1 : Installer MiKTeX

```bash
# Télécharger MiKTeX depuis
https://miktex.org/download

# Installer (mode Admin recommandé)
# Accepter l'installation automatique des packages
```

#### Étape 2 : Installer un Éditeur LaTeX

**TeXstudio** (Recommandé) :
```bash
# Télécharger depuis
https://www.texstudio.org

# Installer normalement
```

**Alternatives** :
- TeXmaker : https://www.xm1math.net/texmaker/
- VS Code + LaTeX Workshop extension

#### Étape 3 : Compiler

```bash
# Méthode 1 : Via l'éditeur
1. Ouvrir le fichier .tex dans TeXstudio
2. Appuyer sur F5 (ou Build & View)
3. Le PDF s'ouvre automatiquement

# Méthode 2 : Ligne de commande
cd Documentation
pdflatex PRESENTATION_SMARTSEARCH.tex
pdflatex PRESENTATION_SMARTSEARCH.tex  # 2x pour les références
```

---

### Option 3 : Installation Locale (Linux)

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install texlive-full texstudio

# Fedora
sudo dnf install texlive-scheme-full texstudio

# Compiler
pdflatex PRESENTATION_SMARTSEARCH.tex
```

---

### Option 4 : Installation Locale (Mac)

```bash
# Installer MacTeX
https://www.tug.org/mactex/

# Installer TeXShop (inclus) ou TeXstudio

# Compiler
pdflatex PRESENTATION_SMARTSEARCH.tex
```

---

## 📦 Packages LaTeX Utilisés

Les présentations utilisent les packages suivants :

```latex
\usepackage[utf8]{inputenc}      % Encodage UTF-8
\usepackage[french]{babel}       % Langue française
\usepackage{graphicx}            % Images
\usepackage{listings}            % Code source
\usepackage{xcolor}              % Couleurs
\usepackage{tikz}                % Diagrammes
\usepackage{booktabs}            % Tableaux
\usepackage{fontawesome5}        % Icônes
\usepackage{hyperref}            % Liens hypertexte
```

**Note** : MiKTeX/TeXLive installeront automatiquement les packages manquants.

---

## 🎨 Personnalisation

### Changer le Thème Beamer

```latex
% Dans le fichier .tex, ligne ~20
\usetheme{Madrid}       % Thème actuel

% Remplacer par :
\usetheme{Berlin}
\usetheme{Copenhagen}
\usetheme{Singapore}
\usetheme{Warsaw}
```

### Changer les Couleurs

```latex
% Lignes ~30-33
\definecolor{bleuNgoa}{RGB}{0,102,204}     % Modifier RGB
\definecolor{vertSucces}{RGB}{0,153,51}
\definecolor{rougeErreur}{RGB}{204,0,0}
```

### Changer le Ratio

```latex
% Ligne ~1
\documentclass[aspectratio=169]{beamer}    % 16:9 (actuel)
\documentclass[aspectratio=43]{beamer}     % 4:3 (classique)
```

---

## 🐛 Dépannage

### Erreur : "Package fontawesome5 not found"

**Solution** :
```bash
# MiKTeX : Ouvrir MiKTeX Console
# → Packages → fontawesome5 → Install

# Ou en ligne de commande
mpm --install=fontawesome5
```

---

### Erreur : "Font shape undefined"

**Solution** :
```bash
# Installer les polices manquantes
sudo apt-get install texlive-fonts-extra  # Linux
# ou
# MiKTeX Console → Update all packages
```

---

### Erreur : "Undefined control sequence \faGithub"

**Solution** :
- Remplacer `\faGithub` par `\textbf{GitHub}` dans le .tex
- Ou installer le package `fontawesome5`

---

### Compilation Lente

**Solution** :
```bash
# Utiliser pdflatex en mode draft
pdflatex -draftmode PRESENTATION_SMARTSEARCH.tex

# Puis compilation finale
pdflatex PRESENTATION_SMARTSEARCH.tex
```

---

## 📄 Exporter en PDF

### Depuis Overleaf
1. Cliquer sur **Download PDF** (en haut à droite)
2. Le PDF est téléchargé

### Depuis TeXstudio
1. Appuyer sur **F5** (Build & View)
2. Le PDF est généré dans le même dossier

### Depuis Ligne de Commande
```bash
pdflatex PRESENTATION_SMARTSEARCH.tex
# Le PDF est créé : PRESENTATION_SMARTSEARCH.pdf
```

---

## 🎤 Présenter avec le PDF

### Mode Présentation

**Windows** :
- Adobe Reader : Ctrl+L (plein écran)
- PowerPoint : Importer PDF → Présenter

**Mac** :
- Aperçu : Cmd+Option+P
- Keynote : Importer PDF

**Linux** :
- Evince : F5 (plein écran)
- Okular : Ctrl+Shift+P

### Annotations en Direct

**Outils recommandés** :
- **PDF Annotator** (Windows, payant)
- **Xournal++** (Linux/Windows, gratuit)
- **GoodNotes** (iPad, payant)
- **Foxit Reader** (Multi-plateforme, gratuit)

---

## 🔧 Modification Rapide

### Ajouter une Slide

```latex
\begin{frame}{Titre de la Slide}
    \begin{block}{Bloc}
        Contenu du bloc
    \end{block}

    \begin{itemize}
        \item Point 1
        \item Point 2
    \end{itemize}
\end{frame}
```

### Ajouter un Diagramme

```latex
\begin{tikzpicture}
    \node[draw, fill=blue!20] (a) at (0,0) {Box A};
    \node[draw, fill=red!20] (b) at (3,0) {Box B};
    \draw[->, thick] (a) -- (b);
\end{tikzpicture}
```

### Ajouter du Code

```latex
\begin{lstlisting}[language=Python]
def hello_world():
    print("Hello, World!")
\end{lstlisting}
```

---

## 📊 Structure du Projet

```
Documentation/
├── PRESENTATION_SMARTSEARCH.tex       # Présentation complète (40+ slides)
├── PRESENTATION_FUZZY_MATCHING.tex    # Présentation technique (15 slides)
├── GUIDE_COMPILATION_LATEX.md         # Ce guide
│
└── Output/ (après compilation)
    ├── PRESENTATION_SMARTSEARCH.pdf
    ├── PRESENTATION_FUZZY_MATCHING.pdf
    └── *.aux, *.log, *.nav, *.out, *.snm, *.toc (fichiers temporaires)
```

---

## ✅ Checklist Avant Soutenance

### Préparation du Fichier
- [ ] Compilation réussie sans erreur
- [ ] PDF généré
- [ ] Toutes les slides visibles
- [ ] Pas de texte tronqué
- [ ] Diagrammes corrects
- [ ] Code lisible
- [ ] Liens hypertexte fonctionnels

### Contenu
- [ ] Informations personnelles à jour
- [ ] Date correcte
- [ ] Numéros de slides visibles
- [ ] Table des matières complète
- [ ] Références bibliographiques
- [ ] Contact / URL projet

### Présentation
- [ ] Mode plein écran testé
- [ ] Durée estimée (15-20 min pour 40 slides)
- [ ] Notes de présentation préparées
- [ ] Fichier de secours (clé USB + cloud)
- [ ] Ordinateur de secours disponible

---

## 🎓 Conseils de Présentation

### Timing
- **1 slide = ~30 secondes** en moyenne
- **40 slides** = ~20 minutes de présentation
- **Prévoir 5-10 min de questions**

### Structure Recommandée
1. **Introduction** (2 min) - Slides 1-5
2. **Contexte** (2 min) - Slides 6-10
3. **Architecture** (3 min) - Slides 11-18
4. **Fonctionnalités** (4 min) - Slides 19-28
5. **Résultats** (3 min) - Slides 29-35
6. **Démonstration** (3 min) - Slides 36-38
7. **Conclusion** (2 min) - Slides 39-40
8. **Questions** (5-10 min)

### Astuces
- ✅ **Ne pas lire les slides** (parler librement)
- ✅ **Exemples concrets** (démonstration live si possible)
- ✅ **Regarder le jury**
- ✅ **Gérer le temps** (chronomètre)
- ✅ **Anticiper les questions**

---

## 📚 Ressources LaTeX

### Tutoriels
- **Overleaf Guides** : https://www.overleaf.com/learn
- **Beamer User Guide** : https://ctan.org/pkg/beamer
- **TikZ Gallery** : https://texample.net/tikz/examples/

### Templates
- **Overleaf Templates** : https://www.overleaf.com/latex/templates
- **LaTeX Templates** : https://www.latextemplates.com

### Communauté
- **TeX StackExchange** : https://tex.stackexchange.com
- **Reddit r/LaTeX** : https://www.reddit.com/r/LaTeX/

---

## 🌟 Versions des Présentations

### v3.1 (16 juin 2026)
- ✅ Présentation complète de la plateforme
- ✅ Présentation technique fuzzy matching
- ✅ 40+ slides avec diagrammes
- ✅ Code examples et résultats
- ✅ Section Q&A

### v3.0 (15 juin 2026)
- Première version basique

---

## 📞 Support

### En Cas de Problème

1. **Vérifier la syntaxe LaTeX** : Souvent une accolade manquante
2. **Lire les logs** : Le fichier .log contient les erreurs détaillées
3. **Google l'erreur** : "latex error + message d'erreur"
4. **TeX StackExchange** : Poster votre question avec MWE (Minimal Working Example)

### Contacts Utiles
- **Forum LaTeX français** : https://texnique.fr
- **Mailing list** : texlive@tug.org

---

**Bonne soutenance !** 🎓

---

**Auteur** : NGOA (HERVEMEUPS) - M2 SIGL  
**Date** : 16 juin 2026  
**Version** : v3.1
