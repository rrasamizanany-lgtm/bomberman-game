@echo off
REM Script de démarrage pour Bomberman - Windows Batch

echo.
echo ╔════════════════════════════════════════╗
echo ║   🎮 BOMBERMAN MULTIPLAYER 🎮          ║
echo ║   Démarrage de l'application...       ║
echo ╚════════════════════════════════════════╝
echo.

echo [1/2] Démarrage du Backend (Port 5000)...
start cmd /k "cd backend && npm start"
echo ✓ Backend en cours de démarrage...
timeout /t 3 /nobreak

echo.
echo [2/2] Démarrage du Frontend (Port 3000)...
start cmd /k "cd frontend && npm start"
echo ✓ Frontend en cours de démarrage...
timeout /t 3 /nobreak

echo.
echo ╔════════════════════════════════════════╗
echo ║   ✓ Les deux serveurs devraient     ║
echo ║     se lancer dans les prochaines   ║
echo ║     secondes.                       ║
echo ║                                       ║
echo ║   🌐 Frontend: http://localhost:3000 ║
echo ║   🖥️  Backend: http://localhost:5000  ║
echo ║                                       ║
echo ║   Appuyez sur Ctrl+C pour arrêter.  ║
echo ╚════════════════════════════════════════╝
echo.
