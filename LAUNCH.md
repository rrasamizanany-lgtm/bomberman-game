# Guide de Lancement - Bomberman Multiplayer

## ✅ Statut de l'Application

L'application Bomberman est **complètement fonctionnelle** et prête à être utilisée!

### Serveurs Actifs
- ✅ **Backend**: http://localhost:5000 (Express + Socket.io)
- ✅ **Frontend**: http://localhost:3000 (React)

## 🎮 Comment Utiliser

### 1. Accéder à l'Application
- Ouvrez votre navigateur et allez à: **http://localhost:3000**
- Vous verrez l'écran de connexion Bomberman

### 2. Entrer Votre Pseudonyme
- Tapez votre pseudonyme (max 20 caractères)
- Cliquez sur "Join Game"

### 3. Attendre les Autres Joueurs
- Maximum 6 joueurs par partie
- Le jeu démarre automatiquement:
  - Après 5 secondes si 1 joueur
  - Après 2 secondes si 2+ joueurs

### 4. Jouer
- **↑ ↓ ← →** : Déplacement
- **ESPACE** : Placer une bombe
- **Objectif** : Être le dernier joueur vivant!

## 🎯 Mécanique du Jeu

### Gameplay
- Vous êtes dans une map 13x13 remplie de briques
- Posez une bombe → elle explose après 3 secondes
- L'explosion s'étend dans 4 directions (haut, bas, gauche, droite)
- Elle détruit les briques et les joueurs sur son passage
- Chaque joueur peut placer 1 bombe à la fois (modifie cette valeur dans le code)

### Personnages
6 emojis représentent les personnages différents:
- 😱 Peur
- 🎮 Gamer  
- 👾 Alien
- 🤖 Robot
- 👽 Créature
- 🎯 Cible

### Couleurs des Joueurs
Chaque joueur a une couleur unique pour être identifié facilement sur la map.

## 🔧 Gestion des Serveurs

### Arrêter les Serveurs
- Appuyez sur `Ctrl+C` dans chaque terminal

### Redémarrer les Serveurs
```bash
# Terminal 1 - Backend
cd c:\Project\Bomber\backend
npm start

# Terminal 2 - Frontend
cd c:\Project\Bomber\frontend
npm start
```

### Utiliser les Tâches VS Code (Recommandé)
- Ouvrez le Palette de Commandes: `Ctrl+Shift+P`
- Tapez: `Tasks: Run Task`
- Choisissez:
  - `Backend - Start Server` (Ctrl+Shift+B)
  - `Frontend - Start App`

## 📊 Configuration du Jeu

Ces paramètres sont dans [backend/server.js](../backend/server.js):

```javascript
GAME_CONFIG = {
  MAX_PLAYERS: 6,           // Nombre maximum de joueurs
  MAP_WIDTH: 13,            // Largeur de la map en tuiles
  MAP_HEIGHT: 13,           // Hauteur de la map en tuiles
  TILE_SIZE: 40,            // Taille de chaque tuile en pixels
  BOMB_TIMER: 3000,         // Temps avant explosion (ms)
  EXPLOSION_TIMER: 500      // Durée de l'explosion (ms)
}
```

## 🎨 Personnalisation

### Changer les Contrôles
Modifiez [frontend/src/components/GameCanvas.js](../frontend/src/components/GameCanvas.js):
```javascript
const keyMap = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  'w': 'up',      // Ajouter d'autres touches ici
  's': 'down',
  'a': 'left',
  'd': 'right'
};
```

### Changer les Couleurs des Joueurs
Dans [backend/server.js](../backend/server.js):
```javascript
const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];
```

### Changer les Personnages (Emojis)
Dans [frontend/src/components/GameCanvas.js](../frontend/src/components/GameCanvas.js):
```javascript
const CHARACTERS = ['😱', '🎮', '👾', '🤖', '👽', '🎯'];
```

## 🚀 Améliorations Futures

Voici les améliorations que vous pourriez ajouter:

### Gameplay
- [ ] **Power-ups**: Augmenter vitesse, portée bombe, nombre de bombes
- [ ] **Briques indestructibles**: Ajouter des obstacles permanents
- [ ] **Timer global**: Limite de temps par partie
- [ ] **Mode équipes**: Jeu en équipe de 2-3 joueurs

### Graphismes & UX
- [ ] **Animations fluides**: Interpolation des mouvements
- [ ] **Effets visuels**: Animations des explosions, particules
- [ ] **Musique & Sons**: Bande sonore, bruitages
- [ ] **Réactif mobile**: Interface adaptée aux téléphones
- [ ] **Scores & Classement**: Tableau des meilleures parties

### Backend
- [ ] **Base de données**: Sauvegarder les statistiques joueurs
- [ ] **Authentification**: Comptes utilisateurs
- [ ] **Parties sauvegardées**: Reprendre une partie
- [ ] **Anti-triche**: Valider côté serveur tous les mouvements

### Optimisations
- [ ] **Compression des données**: Réduire la taille des messages Socket.io
- [ ] **Zoom dynamique**: Adapter le zoom à la résolution
- [ ] **Matchmaking**: Créer automatiquement des parties équilibrées

## 🐛 Dépannage

### Le jeu ne se lance pas
```bash
# Vérifiez que les serveurs tournent
netstat -ano | findstr :5000  # Backend
netstat -ano | findstr :3000  # Frontend
```

### Les joueurs ne voient pas les autres
- Rechargez la page
- Vérifiez la console navigateur (F12)
- Vérifiez les logs du serveur backend

### Les mouvements sont saccadés
- C'est normal sur une connexion lente
- Les optimisations réseau aideront

### Le personnage reste coincé
- Les collisions avec d'autres joueurs fonctionnent
- Assurez-vous qu'il y a de l'espace pour bouger

## 📁 Structure des Fichiers

```
Bomber/
├── backend/
│   ├── server.js              ← Logique du jeu complète
│   ├── package.json          
│   ├── node_modules/
│   └── .env                   ← Configuration
│
├── frontend/
│   ├── public/
│   │   └── index.html         ← Page principale
│   ├── src/
│   │   ├── App.js             ← Router principal
│   │   ├── App.css
│   │   ├── index.js           ← Point d'entrée React
│   │   ├── index.css
│   │   └── components/
│   │       ├── JoinScreen.js      ← Écran connexion
│   │       ├── GameScreen.js      ← Interface de jeu
│   │       └── GameCanvas.js      ← Rendu 2D
│   ├── package.json
│   ├── node_modules/
│   └── .env                   ← Configuration frontend
│
├── .vscode/
│   ├── tasks.json             ← Commandes VS Code
│   └── extensions.json
│
├── README.md                  ← Documentation complète
└── LAUNCH.md                  ← Ce fichier
```

## 💡 Conseils

1. **Testez en multi-joueurs** : Ouvrez plusieurs fenêtres navigateurs avec des pseudonymes différents
2. **Explorez le code** : La logique du jeu est dans `backend/server.js`
3. **Modifiez les configs** : Changez les paramètres pour tester différents gameplay
4. **Ajoutez vos features** : Le code est bien structuré pour les extensions

## 🎊 Amusez-vous!

Vous avez créé une application Bomberman complète et fonctionnelle!

**Pour toute question ou amélioration, modifiez les fichiers et redémarrez l'application.** 🚀
