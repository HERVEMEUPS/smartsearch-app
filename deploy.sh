#!/bin/bash

# 🚀 Script de Déploiement SmartSearch
# Ce script prépare votre application pour le déploiement sur Render.com

echo "🚀 Préparation du déploiement SmartSearch..."
echo ""

# Couleurs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Vérifier si Git est initialisé
if [ ! -d .git ]; then
    echo -e "${YELLOW}⚠️  Git n'est pas initialisé. Initialisation...${NC}"
    git init
    echo -e "${GREEN}✓ Git initialisé${NC}"
fi

# Demander l'URL du dépôt GitHub si pas déjà configuré
REMOTE=$(git remote get-url origin 2>/dev/null)
if [ -z "$REMOTE" ]; then
    echo ""
    echo -e "${BLUE}📝 Configuration GitHub${NC}"
    echo "Entrez l'URL de votre dépôt GitHub (ex: https://github.com/username/smartsearch.git) :"
    read GITHUB_URL

    git remote add origin "$GITHUB_URL"
    echo -e "${GREEN}✓ Remote GitHub configuré${NC}"
fi

# Ajouter tous les fichiers
echo ""
echo -e "${BLUE}📦 Ajout des fichiers...${NC}"
git add .

# Créer le commit
echo ""
echo "💬 Message de commit (appuyez sur Entrée pour utiliser le message par défaut) :"
read COMMIT_MSG

if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="🚀 Ready for deployment - SmartSearch App"
fi

git commit -m "$COMMIT_MSG"
echo -e "${GREEN}✓ Commit créé${NC}"

# Vérifier la branche
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}⚠️  Renommage de la branche en 'main'...${NC}"
    git branch -M main
fi

# Pousser vers GitHub
echo ""
echo -e "${BLUE}📤 Envoi vers GitHub...${NC}"
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✓✓✓ CODE POUSSÉ AVEC SUCCÈS ! ✓✓✓${NC}"
    echo ""
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}   🎉 Votre code est maintenant sur GitHub ! 🎉${NC}"
    echo -e "${GREEN}════════════════════════════════════════════════════${NC}"
    echo ""
    echo -e "${BLUE}📋 PROCHAINES ÉTAPES :${NC}"
    echo ""
    echo "1️⃣  Allez sur https://render.com"
    echo "2️⃣  Créez un compte (gratuit)"
    echo "3️⃣  Cliquez sur 'New +' → 'Web Service'"
    echo "4️⃣  Connectez votre dépôt GitHub"
    echo "5️⃣  Configurez le backend :"
    echo "     - Name: smartsearch-backend"
    echo "     - Root Directory: backend"
    echo "     - Build Command: npm install"
    echo "     - Start Command: npm start"
    echo "6️⃣  Ajoutez les variables d'environnement :"
    echo "     - NODE_ENV = production"
    echo "     - JWT_SECRET = $(openssl rand -hex 32 2>/dev/null || echo 'votre-secret-changez-moi')"
    echo "     - ADMIN_CODE = ADMIN2026"
    echo "     - PORT = 10000"
    echo "7️⃣  Créez le service"
    echo ""
    echo "8️⃣  Répétez pour le frontend (Static Site) :"
    echo "     - Name: smartsearch-frontend"
    echo "     - Publish Directory: frontend"
    echo ""
    echo -e "${YELLOW}📖 Pour plus de détails, consultez :${NC}"
    echo "   - DEPLOIEMENT_RAPIDE.md (version courte)"
    echo "   - GUIDE_DEPLOIEMENT_RENDER.md (version détaillée)"
    echo ""
else
    echo ""
    echo -e "${RED}❌ Erreur lors du push${NC}"
    echo ""
    echo "Vérifiez :"
    echo "  - Que vous avez configuré votre compte GitHub"
    echo "  - Que l'URL du dépôt est correcte"
    echo "  - Que vous avez les droits d'accès au dépôt"
    echo ""
    exit 1
fi
