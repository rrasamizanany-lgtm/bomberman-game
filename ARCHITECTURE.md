# 📐 Architecture Technique - Bomberman Multiplayer

## 🏗️ Vue d'Ensemble

Bomberman est une application web **full-stack** utilisant une architecture client-serveur avec communication temps réel via WebSockets.

```
┌─────────────────────────────────────────────────────────────────┐
│                      Navigateur Web                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  React Frontend (Port 3000)                              │   │
│  │  ┌─────────────────┐           ┌──────────────────────┐  │   │
│  │  │  JoinScreen.js  │─────────┐ │   GameScreen.js      │  │   │
│  │  │  (Connexion)    │         │ │   (Interface)        │  │   │
│  │  └─────────────────┘         │ └──────────────────────┘  │   │
│  │                              │           │               │   │
│  │                              └──►┌──────────────────────┐  │   │
│  │                                 │ GameCanvas.js (2D)    │  │   │
│  │                                 │ - Rendu Canvas HTML5  │  │   │
│  │                                 │ - Input clavier       │  │   │
│  │                                 └──────────────────────┘  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                            │                                     │
│                        Socket.io                                 │
│                     (WebSocket)                                  │
│                            │                                     │
└────────────────────────────┼─────────────────────────────────────┘
                             │
┌────────────────────────────┼─────────────────────────────────────┐
│                            │                                     │
│  ┌────────────────────────▼──────────────────────────────────┐   │
│  │  Node.js BackendServer (Port 5000)                       │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Express + Socket.io                                 │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Logique du Jeu                                      │ │   │
│  │  │ • Gestion des joueurs                               │ │   │
│  │  │ • Gestion des bombes/explosions                     │ │   │
│  │  │ • Détection de collisions                           │ │   │
│  │  │ • Sync état multijoueur en temps réel              │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  │                                                           │   │
│  │  ┌─────────────────────────────────────────────────────┐ │   │
│  │  │ Gestionnaire de Parties (In-Memory)                 │ │   │
│  │  │ • Map des parties actives                           │ │   │
│  │  │ • Map des joueurs connectés                         │ │   │
│  │  │ • Minuteurs (bombes, explosions)                    │ │   │
│  │  └─────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## 🔄 Flux de Données

### 1️⃣ Connexion Joueur

```
Joueur tape pseudo
    │
    ▼
JoinScreen affiche formulaire
    │
    ▼
Socket.io emit('joinGame', {nickname})
    │
    ▼
Server reçoit joinGame
    │
    ├─ Trouve ou crée une partie
    ├─ Crée objet joueur
    ├─ Ajoute joueur à la partie
    │
    ▼
Server emit('gameState', {...}) ← Tous les joueurs
    │
    ▼
React reçoit et affiche l'état du jeu
```

### 2️⃣ Mouvement Joueur

```
Clavier: ArrowUp/Down/Left/Right
    │
    ▼
GameCanvas écoute keydown
    │
    ▼
Socket.io emit('playerMove', {gameId, direction})
    │
    ▼
Server valide le mouvement
    ├─ Vérifie collision avec briques
    ├─ Vérifie collision avec bombes
    ├─ Vérifie collision avec autres joueurs
    │
    ├─ Si OK: Met à jour position joueur
    │         emit('playerMoved', {...})
    │
    └─ Si collision: Ignore le mouvement
    │
    ▼
Tous les clients reçoivent et mettent à jour canvas
```

### 3️⃣ Placement Bombe

```
Clavier: SPACE
    │
    ▼
Socket.io emit('placeBomb', {gameId})
    │
    ▼
Server valide
    ├─ Vérifie joueur vivant
    ├─ Vérifie bombes < maxBombes
    │
    ├─ Crée objet bombe
    ├─ Ajoute à la liste
    ├─ Incrémente activeBombs joueur
    │
    ▼
Server emit('bombPlaced', bomb) ← Tous les joueurs
    │
    ▼
Après 3 secondes: Déclenche explosion
```

### 4️⃣ Explosion

```
Minuteur bombe = 0
    │
    ▼
Server: explodeBomb(gameId, bomb)
    │
    ├─ Calcule zone explosion (4 directions + portée)
    ├─ Détruit briques sur trajet
    ├─ Vérifie joueurs touchés
    │
    ├─ Joue hit: Set joueur.alive = false
    │
    ▼
Server emit('explosion', {...}) ← Tous les joueurs
    │
    ▼
Canvas affiche animation explosion
    │
    ▼
Après 500ms: emit('explosionEnd')
```

### 5️⃣ Fin de Partie

```
Un seul joueur vivant
    │
    ▼
Server: endGame(gameId, winner)
    │
    ├─ Met gameStatus = 'finished'
    ├─ Récupère info gagnant
    │
    ▼
emit('gameEnded', {winner}) ← Tous les joueurs
    │
    ▼
Affiche écran victoire
    │
    ▼
Après 5s: Supprime partie en mémoire
```

## 🗂️ Structure des Classes de Données

### GameState
```javascript
{
  gameId: string,                    // UUID unique
  players: Map<socketId, Player>,   // Joueurs actuels
  bricks: Array<{x, y, destroyed}>, // Briques déstructibles
  bombs: Array<Bomb>,                // Bombes actives
  explosions: Array<Explosion>,      // Explosions actuelles
  gameStatus: 'waiting'|'playing'|'finished',
  winner: Player | null,
  createdAt: timestamp
}
```

### Player
```javascript
{
  id: socketId,                   // Clé Socket.io
  nickname: string,               // Pseudo du joueur
  color: string,                  // Couleur (RGB hex)
  characterIndex: number,         // Index emoji (0-5)
  x: number,                      // Position X (tile)
  y: number,                      // Position Y (tile)
  alive: boolean,                 // Vivant?
  bombPower: number,              // Portée explosion
  maxBombs: number,               // Nombre max bombes
  activeBombs: number             // Bombes placées
}
```

### Bomb
```javascript
{
  id: uuid,            // Clé unique
  x: number,           // Position X
  y: number,           // Position Y
  playerId: socketId,  // Qui l'a placée
  power: number,       // Portée explosion
  timer: number        // Temps avant explosion (ms)
}
```

### Explosion
```javascript
{
  id: uuid,
  tiles: Array<{x, y}>,    // Tuiles affectées
  createdAt: timestamp
}
```

## 🎯 Points Clés de la Logique

### 1. Détection de Collision (Mouvement)

```javascript
// Vérification ordre important:
1. Limites de la map (murs)
2. Briques encore intactes
3. Bombes placées
4. Autres joueurs vivants
```

### 2. Calcul Explosion

L'explosion se propage dans 4 directions:
- **Haut**: (x, y-1), (x, y-2), ... jusqu'à obstacle
- **Bas**: (x, y+1), (x, y+2), ...
- **Gauche**: (x-1, y), (x-2, y), ...
- **Droite**: (x+1, y), (x+2, y), ...

S'arrête si brique non-détruite trouvée.

### 3. Synchronisation Temps Réel

Tous les changements d'état émettent un événement Socket.io:
- `gameState` - État complet (connexion/reconnexion)
- `playerMoved` - Mouvement joueur
- `bombPlaced` - Nouvelle bombe
- `explosion` - Explosion créée
- `explosionEnd` - Explosion terminée
- `playerHit` - Joueur éliminé
- `gameEnded` - Partie terminée
- `playerDisconnected` - Joueur parti

## 📡 Communication Socket.io

### Events Émis par Client

```javascript
socket.emit('joinGame', {nickname})          // Rejoindre partie
socket.emit('playerMove', {gameId, direction}) // Déplacement
socket.emit('placeBomb', {gameId})           // Placer bombe
```

### Events Écoutés par Client

```javascript
socket.on('gameState', (state))              // État initial + mises à jour
socket.on('gameStarted', ())                 // Partie commence
socket.on('playerMoved', (data))             // Joueur a bougé
socket.on('bombPlaced', (bomb))              // Bombe placée
socket.on('explosion', (explosion))          // Explosion créée
socket.on('explosionEnd', (data))            // Explosion finie
socket.on('playerHit', (data))               // Joueur touché
socket.on('gameEnded', (data))               // Partie finie
socket.on('playerDisconnected', (data))      // Joueur parti
socket.on('error', (message))                // Erreur
```

## 🎨 Rendu Canvas

### Ordre de Rendu

```
1. Effacer canvas
2. Fond gris foncé
3. Grille (lignes)
4. Briques non-détruites (rectangles marron)
5. Explosions (rectangles orange semi-transparents)
6. Bombes (cercles noirs + mèche)
7. Joueurs (rectangles colorés + emoji)
8. Pseudonymes (texte blanc)
```

### Taille Canvas
- Width: 13 * 40 = 520 pixels
- Height: 13 * 40 = 520 pixels
- Chaque tuile: 40x40 pixels

## 🔐 Sécurité & Validation

### Côté Serveur

1. **Validation position**: Vérifie que le joueur ne traverse pas les murs
2. **Validation collision**: Calcule la détection de collision côté serveur
3. **Rate limiting implicite**: Les événements sont limités par la physique du jeu (délai mouvement)
4. **Disconnection**: Nettoie partie si tous les joueurs partent
5. **Timeout**: Termine partie après 5s s'il n'y a qu'un joueur

### Côté Client

- Pas de logique métier côté client
- Tout est validé/exécuté serveur
- Client affiche juste l'état reçu

## 🚀 Optimisations Réalisées

1. **In-Memory Storage**: Les parties sont en mémoire (très rapide)
2. **UUID pour IDs uniques**: Pas de collisions
3. **Map JavaScript**: Recherche O(1) pour joueurs/parties
4. **Timers natifs**: Utilise setTimeout bien optimisé de Node

## 📈 Scalabilité

### Limitations Actuelles
- Toutes les parties en mémoire du serveur
- Max ~1000 parties simultanées (dépend RAM)
- Max 6 joueurs par partie

### Améliorations Possibles
1. **Base de données**: Persister les parties
2. **Redis**: Cache temps réel pour les états
3. **Load balancer**: Distribuer sur multiple serveurs
4. **Rooms Socket.io**: Chaque partie = room (optimise les broadcast)

## 🧪 Tests

### Manuel (Recommandé)
```bash
# Ouvrez 3+ tabs navigateur
# Connectez avec différents pseudonymes
# Testez mouvements/bombes en parallèle
```

### Automatisé (À implémenter)
```javascript
// Exemple avec Jest
test('Explosion détruit briques', () => {
  // ...
});

test('Joueur ne peut pas traverser mur', () => {
  // ...
});
```

## 🐛 Points de Debug

Pour aider au debug, utilisez:

```javascript
// Backend (server.js)
console.log(`User connected: ${socket.id}`);
console.log(`Game ${gameId} started`);

// Frontend (App.js)
socket.on('gameState', (state) => {
  console.log('Game State Updated', state);
});
```

Ouvrez Console Navigateur: `F12` → Console

## 📚 Ressources

- [Socket.io Documentation](https://socket.io/docs/)
- [React Documentation](https://react.dev/)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [Express Documentation](https://expressjs.com/)

---

**L'architecture est cleanet extensible pour ajouter de nouvelles features!** 🎮
