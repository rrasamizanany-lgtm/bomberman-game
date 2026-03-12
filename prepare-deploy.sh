#!/bin/bash
# Script de déploiement pour Bomberman

echo "🎮 Bomberman - Préparation au Déploiement"
echo "=========================================="

# Vérifier si git est installé
if ! command -v git &> /dev/null; then
    echo "❌ Git n'est pas installé. Installez-le d'abord."
    exit 1
fi

echo ""
echo "📁 Initialisation du Dépôt Git..."

# Initialiser git si nécessaire
if [ ! -d ".git" ]; then
    git init
    git config user.email "votre.email@example.com"
    git config user.name "Votre Nom"
    echo "✅ Dépôt git initialisé"
else
    echo "✅ Dépôt git déjà existant"
fi

echo ""
echo "🔧 Installation des dépendances..."
cd backend
npm install
cd ..
cd frontend
npm install
cd ..
echo "✅ Dépendances installées"

echo ""
echo "📦 Vérification de la structure..."
if [ -f "render.yaml" ]; then
    echo "✅ render.yaml trouvé"
else
    echo "⚠️  render.yaml non trouvé"
fi

echo ""
echo "🚀 Prêt pour le déploiement!"
echo ""
echo "Prochaines étapes:"
echo "1. Créez un compte sur https://render.com"
echo "2. Connectez votre repo GitHub"
echo "3. Lisez DEPLOYMENT.md pour les instructions détaillées"
echo ""
echo "Pour ajouter à git:"
echo "  git add ."
echo "  git commit -m 'Initial commit: Bomberman game'"
echo "  git remote add origin https://github.com/VOTRE_USER/bomberman-game.git"
echo "  git push -u origin main"
