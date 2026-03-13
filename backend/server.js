import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

const PORT = process.env.PORT || 5000;

// Game state management
const games = new Map(); // gameId -> gameState
const players = new Map(); // socketId -> playerData
let waitingGame = null; // Keep track of the single waiting game

const GAME_CONFIG = {
  MAX_PLAYERS: 6,
  MAP_WIDTH: 13,
  MAP_HEIGHT: 13,
  TILE_SIZE: 40,
  BOMB_TIMER: 3000,
  EXPLOSION_TIMER: 500
};

// Initialize game state
function createGameState() {
  return {
    gameId: uuidv4(),
    players: new Map(),
    bricks: generateBricks(),
    bombs: [],
    explosions: [],
    powerUps: [], // Store active power-ups on the map
    gameStatus: 'waiting', // waiting, playing, finished
    winner: null,
    createdAt: Date.now()
  };
}

// Generate random brick layout
function generateBricks() {
  const bricks = [];
  
  // Spawn zones que nous voulons garder libres
  const spawnZones = [
    // Top-left
    { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 },
    // Top-right
    { x: GAME_CONFIG.MAP_WIDTH - 2, y: 1 }, { x: GAME_CONFIG.MAP_WIDTH - 3, y: 1 }, 
    { x: GAME_CONFIG.MAP_WIDTH - 2, y: 2 }, { x: GAME_CONFIG.MAP_WIDTH - 3, y: 2 },
    // Bottom-left
    { x: 1, y: GAME_CONFIG.MAP_HEIGHT - 2 }, { x: 2, y: GAME_CONFIG.MAP_HEIGHT - 2 },
    { x: 1, y: GAME_CONFIG.MAP_HEIGHT - 3 }, { x: 2, y: GAME_CONFIG.MAP_HEIGHT - 3 },
    // Bottom-right
    { x: GAME_CONFIG.MAP_WIDTH - 2, y: GAME_CONFIG.MAP_HEIGHT - 2 }, 
    { x: GAME_CONFIG.MAP_WIDTH - 3, y: GAME_CONFIG.MAP_HEIGHT - 2 },
    { x: GAME_CONFIG.MAP_WIDTH - 2, y: GAME_CONFIG.MAP_HEIGHT - 3 },
    { x: GAME_CONFIG.MAP_WIDTH - 3, y: GAME_CONFIG.MAP_HEIGHT - 3 },
    // Centres (pour les autres joueurs)
    { x: Math.floor(GAME_CONFIG.MAP_WIDTH / 2), y: 1 },
    { x: Math.floor(GAME_CONFIG.MAP_WIDTH / 2), y: 2 },
    { x: Math.floor(GAME_CONFIG.MAP_WIDTH / 2), y: GAME_CONFIG.MAP_HEIGHT - 2 },
    { x: Math.floor(GAME_CONFIG.MAP_WIDTH / 2), y: GAME_CONFIG.MAP_HEIGHT - 3 }
  ];
  
  const isSpawnZone = (x, y) => spawnZones.some(zone => zone.x === x && zone.y === y);
  
  for (let x = 1; x < GAME_CONFIG.MAP_WIDTH - 1; x++) {
    for (let y = 1; y < GAME_CONFIG.MAP_HEIGHT - 1; y++) {
      // Éviter les zones de spawn
      if (isSpawnZone(x, y)) {
        continue;
      }
      
      // Les murs pairs (structure de la carte) ne peuvent pas être cassés
      if (x % 2 === 0 && y % 2 === 0) {
        continue;
      }
      
      // Ajouter une brique destructible avec 75% de chance
      if (Math.random() < 0.75) {
        const brick = { x, y, destroyed: false };
        
        // Ajouter un power-up 10% de chance pour chaque type
        const powerUpRoll = Math.random();
        if (powerUpRoll < 0.1) {
          brick.powerUp = 'roller'; // Vitesse augmentée
        } else if (powerUpRoll < 0.2) {
          brick.powerUp = 'fire'; // Portée explosion augmentée
        } else if (powerUpRoll < 0.3) {
          brick.powerUp = 'bomb'; // Bombe supplémentaire
        }
        // 70% de chance : pas de power-up
        
        bricks.push(brick);
      }
    }
  }
  
  return bricks;
}

// Player colors
const PLAYER_COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F'];

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinGame', (data) => {
    const { nickname } = data;
    
    console.log(`\n🔗 User ${socket.id} attempting to join with nickname: ${nickname}`);
    
    // Use the single waiting game or create a new one
    let game = waitingGame;
    let gameId;
    
    if (game && game.gameStatus === 'waiting' && game.players.size < GAME_CONFIG.MAX_PLAYERS) {
      console.log(`✅ Found waiting game (${game.gameId.substring(0, 8)}...) with ${game.players.size} players`);
      gameId = game.gameId;
    } else {
      console.log(`❌ No available waiting game, creating new one...`);
      game = createGameState();
      gameId = game.gameId;
      games.set(gameId, game);
      waitingGame = game; // Set as the new waiting game
      console.log(`✅ Created new game: ${gameId.substring(0, 8)}...`);
    }

    // Create player
    const playerIndex = game.players.size;
    if (playerIndex >= GAME_CONFIG.MAX_PLAYERS) {
      socket.emit('error', 'Game is full');
      console.log(`❌ Game is full!`);
      return;
    }

    const spawnPositions = [
      { x: 1, y: 1 },
      { x: GAME_CONFIG.MAP_WIDTH - 2, y: 1 },
      { x: 1, y: GAME_CONFIG.MAP_HEIGHT - 2 },
      { x: GAME_CONFIG.MAP_WIDTH - 2, y: GAME_CONFIG.MAP_HEIGHT - 2 },
      { x: Math.floor(GAME_CONFIG.MAP_WIDTH / 2), y: 1 },
      { x: Math.floor(GAME_CONFIG.MAP_WIDTH / 2), y: GAME_CONFIG.MAP_HEIGHT - 2 }
    ];

    const player = {
      id: socket.id,
      nickname,
      color: PLAYER_COLORS[playerIndex],
      characterIndex: Math.floor(Math.random() * 6),
      x: spawnPositions[playerIndex].x,
      y: spawnPositions[playerIndex].y,
      alive: true,
      bombPower: 1,
      maxBombs: 1,
      activeBombs: 0,
      speed: 1
    };

    game.players.set(socket.id, player);
    players.set(socket.id, { gameId, nickname });
    socket.join(gameId);
    
    console.log(`👤 Player added: ${nickname} at (${player.x}, ${player.y})`);
    console.log(`📋 Game ${gameId.substring(0, 8)}... now has ${game.players.size} player(s)`);

    // Notify all players in the game
    const gameStateToSend = {
      gameId,
      players: Array.from(game.players.values()),
      bricks: game.bricks,
      bombs: game.bombs,
      explosions: game.explosions,
      powerUps: game.powerUps,
      gameStatus: game.gameStatus,
      config: GAME_CONFIG
    };
    
    console.log(`📡 Broadcasting gameState with ${gameStateToSend.players.length} players`);
    io.to(gameId).emit('gameState', gameStateToSend);

    // Start game if we have at least 2 players, otherwise wait for more
    if (game.players.size >= 2) {
      if (!game.startTimeout) {
        console.log(`⏱️ 2+ players detected, starting game in 10 seconds...`);
        game.startTimeout = setTimeout(() => {
          startGame(gameId);
        }, 10000);
      }
    } else if (game.players.size === 1) {
      if (!game.startTimeout) {
        console.log(`⏱️ 1 player waiting, game will start in 15 seconds if no one joins...`);
        game.startTimeout = setTimeout(() => {
          startGame(gameId);
        }, 15000);
      }
    }
  });

  socket.on('playerMove', (data) => {
    const { gameId, direction } = data;
    
    console.log(`⬅️ REÇU playerMove: direction=${direction}, gameId=${gameId}`);
    
    const game = games.get(gameId);
    
    if (!game) {
      console.log(`❌ Game not found: ${gameId}`);
      return;
    }
    
    if (game.gameStatus !== 'playing') {
      console.log(`❌ Game not playing. Status: ${game.gameStatus}`);
      return;
    }

    const player = game.players.get(socket.id);
    
    if (!player) {
      console.log(`❌ Player not found: ${socket.id}`);
      return;
    }
    
    if (!player.alive) {
      console.log(`❌ Player is dead: ${player.nickname}`);
      return;
    }

    const directions = {
      up: { x: 0, y: -1 },
      down: { x: 0, y: 1 },
      left: { x: -1, y: 0 },
      right: { x: 1, y: 0 }
    };

    const dir = directions[direction];
    if (!dir) return;

    let newX = player.x + dir.x;
    let newY = player.y + dir.y;

    // Check boundaries
    if (newX < 0 || newX >= GAME_CONFIG.MAP_WIDTH || 
        newY < 0 || newY >= GAME_CONFIG.MAP_HEIGHT) {
      return;
    }

    // Check collisions with bricks
    const brick = game.bricks.find(b => b.x === newX && b.y === newY && !b.destroyed);
    if (brick) return;

    // Check collisions with bombs
    const bomb = game.bombs.find(b => b.x === newX && b.y === newY);
    if (bomb) return;

    // Check collisions with other players
    const otherPlayer = Array.from(game.players.values()).find(
      p => p.x === newX && p.y === newY && p.alive && p.id !== socket.id
    );
    if (otherPlayer) return;

    player.x = newX;
    player.y = newY;

    console.log(`✅ ${player.nickname} moved to (${newX}, ${newY})`);

    // Vérifier si le joueur a marché sur un power-up
    const powerUpIndex = game.powerUps.findIndex(pu => pu.x === newX && pu.y === newY);
    if (powerUpIndex !== -1) {
      const powerUp = game.powerUps[powerUpIndex];
      console.log(`🎁 ${player.nickname} picked up ${powerUp.type} power-up!`);
      
      // Appliquer l'effet du power-up
      switch (powerUp.type) {
        case 'roller':
          player.speed = (player.speed || 1) * 1.5; // Augmente la vitesse de 50%
          player.bombPower = (player.bombPower || 1) + 1; // + Augmente aussi la portée pour rendre l'effet visible
          break;
        case 'fire':
          player.bombPower = (player.bombPower || 1) + 1; // Augmente la portée
          break;
        case 'bomb':
          player.maxBombs = (player.maxBombs || 1) + 1; // Permet une bombe supplémentaire
          break;
      }
      
      // Retirer le power-up
      game.powerUps.splice(powerUpIndex, 1);
      
      // Notifier les autres joueurs - envoyer l'ID du power-up collecté
      io.to(gameId).emit('powerUpCollected', {
        playerId: socket.id,
        powerUpId: powerUp.id,
        type: powerUp.type,
        playerStats: {
          bombPower: player.bombPower,
          maxBombs: player.maxBombs,
          speed: player.speed
        }
      });
    }

    io.to(gameId).emit('playerMoved', {
      playerId: socket.id,
      x: newX,
      y: newY
    });
  });

  socket.on('placeBomb', (data) => {
    const { gameId } = data;
    const game = games.get(gameId);
    if (!game || game.gameStatus !== 'playing') {
      console.log(`❌ Cannot place bomb. Game status: ${game?.gameStatus}`);
      return;
    }

    const player = game.players.get(socket.id);
    if (!player || !player.alive || player.activeBombs >= player.maxBombs) {
      console.log(`❌ Cannot place bomb for ${player?.nickname}. Alive: ${player?.alive}, ActiveBombs: ${player?.activeBombs}`);
      return;
    }

    const bomb = {
      id: uuidv4(),
      x: player.x,
      y: player.y,
      playerId: socket.id,
      power: player.bombPower,
      timer: GAME_CONFIG.BOMB_TIMER
    };

    game.bombs.push(bomb);
    player.activeBombs++;

    console.log(`💣 ${player.nickname} placed bomb at (${bomb.x}, ${bomb.y})`);

    io.to(gameId).emit('bombPlaced', bomb);

    // Bomb explosion timer
    setTimeout(() => {
      explodeBomb(gameId, bomb);
    }, GAME_CONFIG.BOMB_TIMER);
  });

  socket.on('disconnect', () => {
    const playerData = players.get(socket.id);
    if (playerData) {
      const game = games.get(playerData.gameId);
      if (game) {
        game.players.delete(socket.id);
        
        if (game.players.size === 0) {
          games.delete(playerData.gameId);
          console.log(`🗑️ Game ${playerData.gameId.substring(0, 8)}... deleted (empty)`);
          
          // Clear waitingGame if this was the waiting game
          if (waitingGame && waitingGame.gameId === playerData.gameId) {
            waitingGame = null;
            console.log(`🔄 Waiting game cleared`);
          }
        } else {
          io.to(playerData.gameId).emit('playerDisconnected', { playerId: socket.id });
          console.log(`👤 Player disconnected from game ${playerData.gameId.substring(0, 8)}... (${game.players.size} remaining)`);
        }
      }
      players.delete(socket.id);
    }
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

function startGame(gameId) {
  const game = games.get(gameId);
  if (!game) return;

  game.gameStatus = 'playing';
  console.log(`🎮 Game ${gameId.substring(0, 8)}... STARTED`);
  
  // This game is no longer the waiting game
  if (waitingGame && waitingGame.gameId === gameId) {
    waitingGame = null;
  }
  
  io.to(gameId).emit('gameStarted');
  console.log(`📢 Game ${gameId.substring(0, 8)}... sent gameStarted event`);
}

// Fonction pour calculer récursivement tous les tiles d'explosion, incluant les bombes en chaîne
function calculateExplosionTiles(gameId, bomb, processedBombs = new Set()) {
  const game = games.get(gameId);
  if (!game) return { tiles: [], bombsToExplode: [] };

  // Éviter les boucles infinies
  if (processedBombs.has(bomb.id)) {
    return { tiles: [], bombsToExplode: [] };
  }
  processedBombs.add(bomb.id);

  let allTiles = [];
  let allBombs = [bomb];
  
  // Centre
  allTiles.push({ x: bomb.x, y: bomb.y });

  const directions = [
    { x: 1, y: 0 }, { x: -1, y: 0 },
    { x: 0, y: 1 }, { x: 0, y: -1 }
  ];

  for (const dir of directions) {
    for (let i = 1; i <= bomb.power; i++) {
      const x = bomb.x + dir.x * i;
      const y = bomb.y + dir.y * i;

      if (x < 0 || x >= GAME_CONFIG.MAP_WIDTH || y < 0 || y >= GAME_CONFIG.MAP_HEIGHT) break;

      allTiles.push({ x, y });

      // Chercher une autre bombe en chaîne
      const otherBomb = game.bombs.find(b => b.x === x && b.y === y && !processedBombs.has(b.id));
      if (otherBomb) {
        console.log(`⛓️ Chain detected: bomb at (${bomb.x}, ${bomb.y}) triggers bomb at (${otherBomb.x}, ${otherBomb.y})`);
        const chainResult = calculateExplosionTiles(gameId, otherBomb, processedBombs);
        allTiles.push(...chainResult.tiles);
        allBombs.push(...chainResult.bombsToExplode);
        // Le break s'applique pas car on continue après la bombe en chaîne
        continue;
      }

      // Vérifier une brique (stop après)
      const brick = game.bricks.find(b => b.x === x && b.y === y);
      if (brick && !brick.destroyed) {
        break;
      }
    }
  }

  return { tiles: allTiles, bombsToExplode: allBombs };
}

function explodeBomb(gameId, bomb) {
  const game = games.get(gameId);
  if (!game || game.gameStatus !== 'playing') return;

  // Calculer tous les tiles d'explosion (incluant les chaînes)
  const { tiles: explosionTiles, bombsToExplode } = calculateExplosionTiles(gameId, bomb);

  // Retirer TOUTES les bombes qui explosent
  for (const bombToRemove of bombsToExplode) {
    game.bombs = game.bombs.filter(b => b.id !== bombToRemove.id);
    const player = game.players.get(bombToRemove.playerId);
    if (player) {
      player.activeBombs--;
    }
  }

  // Gérer les briques et power-ups sur chaque tile
  for (const tile of explosionTiles) {
    const brick = game.bricks.find(b => b.x === tile.x && b.y === tile.y);
    if (brick && !brick.destroyed) {
      brick.destroyed = true;
      brick.destroyedAt = Date.now();
      
      // Créer un power-up si la brique en contient un
      if (brick.powerUp) {
        game.powerUps.push({
          id: uuidv4(),
          x: brick.x,
          y: brick.y,
          type: brick.powerUp,
          createdAt: Date.now()
        });
      }
    }
  }

  const explosion = {
    id: uuidv4(),
    bombIds: bombsToExplode.map(b => b.id),
    tiles: explosionTiles,
    createdAt: Date.now()
  };

  game.explosions.push(explosion);
  
  // Envoyer UNE SEULE explosion avec tous les tiles
  const destroyedBricks = game.bricks.filter(b => b.destroyed);
  io.to(gameId).emit('explosion', { 
    explosion: explosion,
    destroyedBricks: destroyedBricks,
    powerUps: game.powerUps
  });

  // Check for hit players
  for (const tile of explosionTiles) {
    for (const [playerId, p] of game.players) {
      if (p.x === tile.x && p.y === tile.y && p.alive) {
        p.alive = false;
        console.log(`💥 ${p.nickname} hit by explosion at (${tile.x}, ${tile.y})`);
        io.to(gameId).emit('playerHit', { playerId });
      }
    }
  }

  // Check if game is over (only one player alive)
  const alivePlayers = Array.from(game.players.values()).filter(p => p.alive);
  if (alivePlayers.length === 1) {
    endGame(gameId, alivePlayers[0]);
  } else if (alivePlayers.length === 0) {
    // Everyone is dead (shouldn't happen but just in case)
    endGame(gameId, null);
  }

  // Remove explosion after timer
  setTimeout(() => {
    game.explosions = game.explosions.filter(e => e.id !== explosion.id);
    io.to(gameId).emit('explosionEnd', { explosionId: explosion.id });
  }, GAME_CONFIG.EXPLOSION_TIMER);
}

// Terminate the game when there's a winner
function endGame(gameId, winner) {
  const game = games.get(gameId);
  if (!game) return;

  game.gameStatus = 'finished';
  game.winner = winner;

  io.to(gameId).emit('gameEnded', {
    winner: winner ? {
      id: winner.id,
      nickname: winner.nickname,
      color: winner.color
    } : null
  });

  console.log(`🏆 Game ${gameId.substring(0, 8)}... ENDED - Winner: ${winner ? winner.nickname : 'nobody (all dead)'}`);
  
  // This game is finished, clear it from waiting
  if (waitingGame && waitingGame.gameId === gameId) {
    waitingGame = null;
  }
}
//   // Remove game after 5 seconds
//   setTimeout(() => {
//     for (const [socketId, playerData] of players) {
//       if (playerData.gameId === gameId) {
//         players.delete(socketId);
//       }
//     }
//     games.delete(gameId);
//   }, 5000);
// }

server.listen(PORT, () => {
  console.log(`Bomberman Server running on http://localhost:${PORT}`);
});
