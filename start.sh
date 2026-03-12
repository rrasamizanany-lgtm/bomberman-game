#!/bin/bash

# Script de démarrage pour Bomberman - Linux/Mac

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   🎮 BOMBERMAN MULTIPLAYER 🎮          ║"
echo "║   Démarrage de l'application...       ║"
echo "╚════════════════════════════════════════╝"
echo ""

echo "[1/2] Démarrage du Backend (Port 5000)..."
cd backend && npm start &
BACKEND_PID=$!
echo "✓ Backend démarré (PID: $BACKEND_PID)"
sleep 2

echo ""
echo "[2/2] Démarrage du Frontend (Port 3000)..."
cd ../frontend && npm start &
FRONTEND_PID=$!
echo "✓ Frontend démarré (PID: $FRONTEND_PID)"
sleep 2

echo ""
echo "╔════════════════════════════════════════╗"
echo "║   ✓ Les deux serveurs sont lancés!   ║"
echo "║                                       ║"
echo "║   🌐 Frontend: http://localhost:3000  ║"
echo "║   🖥️  Backend: http://localhost:5000   ║"
echo "║                                       ║"
echo "║   Appuyez sur Ctrl+C pour arrêter.   ║"
echo "╚════════════════════════════════════════╝"
echo ""

# Attendre que les deux processus se terminent
wait
