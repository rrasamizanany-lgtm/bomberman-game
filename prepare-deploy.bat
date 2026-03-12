@echo off
REM Script de déploiement pour Bomberman (Windows)

echo.
echo 🎮 Bomberman - Preparation au Deploiement
echo ==========================================
echo.

REM Verifier si git est installe
where git >nul 2>nul
if errorlevel 1 (
    echo ❌ Git n'est pas installe. Installez-le d'abord.
    exit /b 1
)

echo 📁 Initialisation du Depot Git...

REM Initialiser git si necessaire
if not exist ".git" (
    git init
    git config user.email "votre.email@example.com"
    git config user.name "Votre Nom"
    echo ✅ Depot git initialise
) else (
    echo ✅ Depot git deja existant
)

echo.
echo 🔧 Installation des dependances...
cd backend
call npm install
cd ..
cd frontend
call npm install
cd ..
echo ✅ Dependances installees

echo.
echo 📦 Verification de la structure...
if exist "render.yaml" (
    echo ✅ render.yaml trouve
) else (
    echo ⚠️  render.yaml non trouve
)

echo.
echo 🚀 Pret pour le deploiement!
echo.
echo Prochaines etapes:
echo 1. Creez un compte sur https://render.com
echo 2. Connectez votre repo GitHub
echo 3. Lisez DEPLOYMENT.md pour les instructions detaillees
echo.
echo Pour ajouter a git:
echo   git add .
echo   git commit -m "Initial commit: Bomberman game"
echo   git remote add origin https://github.com/VOTRE_USER/bomberman-game.git
echo   git push -u origin main
echo.
pause
