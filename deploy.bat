@echo off
chcp 65001 >nul
REM 🚀 Script de Déploiement SmartSearch (Windows)
REM Ce script prépare votre application pour le déploiement sur Render.com

echo ========================================================
echo 🚀 Préparation du déploiement SmartSearch...
echo ========================================================
echo.

REM Vérifier si Git est installé
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git n'est pas installé !
    echo Téléchargez-le sur : https://git-scm.com/download/win
    pause
    exit /b 1
)

REM Vérifier si Git est initialisé
if not exist .git (
    echo ⚠️  Git n'est pas initialisé. Initialisation...
    git init
    echo ✓ Git initialisé
)

REM Vérifier si le remote origin existe
git remote get-url origin >nul 2>&1
if errorlevel 1 (
    echo.
    echo 📝 Configuration GitHub
    echo ========================================================
    set /p GITHUB_URL="Entrez l'URL de votre dépôt GitHub : "
    git remote add origin !GITHUB_URL!
    echo ✓ Remote GitHub configuré
)

REM Ajouter tous les fichiers
echo.
echo 📦 Ajout des fichiers...
git add .

REM Créer le commit
echo.
set /p COMMIT_MSG="💬 Message de commit (Entrée pour message par défaut) : "
if "!COMMIT_MSG!"=="" set COMMIT_MSG=🚀 Ready for deployment - SmartSearch App

git commit -m "!COMMIT_MSG!"
echo ✓ Commit créé

REM Vérifier/renommer la branche
for /f "tokens=*" %%i in ('git branch --show-current') do set CURRENT_BRANCH=%%i
if not "!CURRENT_BRANCH!"=="main" (
    echo ⚠️  Renommage de la branche en 'main'...
    git branch -M main
)

REM Pousser vers GitHub
echo.
echo 📤 Envoi vers GitHub...
git push -u origin main

if errorlevel 0 (
    echo.
    echo ========================================================
    echo    ✓✓✓ CODE POUSSÉ AVEC SUCCÈS ! ✓✓✓
    echo    🎉 Votre code est maintenant sur GitHub ! 🎉
    echo ========================================================
    echo.
    echo 📋 PROCHAINES ÉTAPES :
    echo.
    echo 1️⃣  Allez sur https://render.com
    echo 2️⃣  Créez un compte (gratuit)
    echo 3️⃣  Cliquez sur 'New +' → 'Web Service'
    echo 4️⃣  Connectez votre dépôt GitHub
    echo 5️⃣  Configurez le backend :
    echo      - Name: smartsearch-backend
    echo      - Root Directory: backend
    echo      - Build Command: npm install
    echo      - Start Command: npm start
    echo 6️⃣  Ajoutez les variables d'environnement :
    echo      - NODE_ENV = production
    echo      - JWT_SECRET = votre-secret-ultra-securise-changez-moi
    echo      - ADMIN_CODE = ADMIN2026
    echo      - PORT = 10000
    echo 7️⃣  Créez le service
    echo.
    echo 8️⃣  Répétez pour le frontend (Static Site) :
    echo      - Name: smartsearch-frontend
    echo      - Publish Directory: frontend
    echo.
    echo 📖 Pour plus de détails, consultez :
    echo    - DEPLOIEMENT_RAPIDE.md (version courte)
    echo    - GUIDE_DEPLOIEMENT_RENDER.md (version détaillée)
    echo.
) else (
    echo.
    echo ❌ Erreur lors du push
    echo.
    echo Vérifiez :
    echo   - Que vous avez configuré votre compte GitHub
    echo   - Que l'URL du dépôt est correcte
    echo   - Que vous avez les droits d'accès au dépôt
    echo.
)

pause
