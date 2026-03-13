import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';
import JoinScreen from './components/JoinScreen';
import GameScreen from './components/GameScreen';

function App() {
  const [screen, setScreen] = useState('join'); // join, game
  const [socket, setSocket] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const socketUrl = process.env.REACT_APP_SERVER_URL || 'http://localhost:5000';
    console.log('🔌 Connecting to socket server:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });
    setSocket(newSocket);

    // Store socket ID when connection is established
    newSocket.on('connect', () => {
      console.log('✅ Connected to server with socket ID:', newSocket.id);
      setPlayerId(newSocket.id);
    });

    newSocket.on('gameState', (state) => {
      console.log('📥 Received gameState:', state);
      console.log(`📋 Total players: ${state.players ? state.players.length : 0}`, state.players);
      setGameState(state);
      setScreen('game');
    });

    newSocket.on('gameStarted', () => {
      console.log('🎮 Game started event received!');
      setGameState(prev => {
        if (!prev) return prev;
        console.log('📝 Updating gameStatus to playing. Current gameState:', prev);
        return { ...prev, gameStatus: 'playing' };
      });
    });

    newSocket.on('playerMoved', (data) => {
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        const updatedPlayers = prev.players.map(p => 
          p.id === data.playerId 
            ? { ...p, x: data.x, y: data.y }
            : p
        );
        console.log(`✅ Updated player ${data.playerId} moved to (${data.x}, ${data.y})`);
        return { ...prev, players: updatedPlayers };
      });
    });

    newSocket.on('bombPlaced', (bomb) => {
      setGameState(prev => {
        if (!prev) return prev;
        const updatedPlayers = prev.players ? prev.players.map(p => 
          p.id === bomb.playerId
            ? { ...p, activeBombs: (p.activeBombs || 0) + 1 }
            : p
        ) : prev.players;
        console.log(`💣 Bomb placed! Players:`, updatedPlayers);
        return {
          ...prev,
          bombs: prev.bombs ? [...prev.bombs, bomb] : [bomb],
          players: updatedPlayers
        };
      });
    });

    newSocket.on('explosion', (explosionData) => {
      setGameState(prev => {
        if (!prev) return prev;
        
        // Gérer l'ancien format (juste explosion) et le nouveau (avec destroyedBricks et powerUps)
        const explosion = explosionData.explosion || explosionData;
        const destroyedBricks = explosionData.destroyedBricks || [];
        const powerUps = explosionData.powerUps || [];
        
        // Retirer la bombe de l'explosion (vérifier par ID ET par position)
        let updatedBombs = prev.bombs ? [...prev.bombs] : [];
        let bombRemoved = null;
        
        if (explosion.bombId) {
          const index = updatedBombs.findIndex(b => b.id === explosion.bombId);
          if (index !== -1) {
            bombRemoved = updatedBombs[index];
            updatedBombs.splice(index, 1);
          }
        }
        
        // Fallback: retirer aussi la bombe à la position du centre de l'explosion
        if (!bombRemoved && explosion.tiles && explosion.tiles.length > 0) {
          const centerTile = explosion.tiles[0];
          const index = updatedBombs.findIndex(b => b.x === centerTile.x && b.y === centerTile.y);
          if (index !== -1) {
            bombRemoved = updatedBombs[index];
            updatedBombs.splice(index, 1);
          }
        }
        
        // Décrémenter les bombes actives pour le joueur qui a placé la bombe
        let updatedPlayers = prev.players ? [...prev.players] : [];
        if (bombRemoved) {
          updatedPlayers = updatedPlayers.map(p => 
            p.id === bombRemoved.playerId 
              ? { ...p, activeBombs: Math.max(0, (p.activeBombs || 1) - 1) }
              : p
          );
        }
        
        // Mettre à jour les briques cassées
        let updatedBricks = prev.bricks ? [...prev.bricks] : [];
        if (destroyedBricks.length > 0) {
          updatedBricks = updatedBricks.map(brick => {
            const destroyed = destroyedBricks.find(db => db.x === brick.x && db.y === brick.y);
            if (destroyed) {
              return { ...brick, destroyed: true, destroyedAt: destroyed.destroyedAt || Date.now() };
            }
            return brick;
          });
        }
        
        return { 
          ...prev, 
          bombs: updatedBombs,
          players: updatedPlayers,
          bricks: updatedBricks,
          powerUps: powerUps,
          explosions: prev.explosions ? [...prev.explosions, explosion] : [explosion]
        };
      });
    });

    newSocket.on('explosionEnd', (data) => {
      setGameState(prev => {
        if (!prev || !prev.explosions) return prev;
        return {
          ...prev,
          explosions: prev.explosions.filter(e => e.id !== data.explosionId)
        };
      });
    });

    newSocket.on('playerHit', (data) => {
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        const updatedPlayers = prev.players.map(p => 
          p.id === data.playerId 
            ? { ...p, alive: false }
            : p
        );
        console.log(`💥 Player ${data.playerId} hit!`);
        return { ...prev, players: updatedPlayers };
      });
    });

    newSocket.on('powerUpCollected', (data) => {
      setGameState(prev => {
        // Retirer le power-up par ID
        const updatedPowerUps = prev.powerUps ? prev.powerUps.filter(pu => pu.id !== data.powerUpId) : [];
        const updatedPlayers = prev.players ? prev.players.map(p => 
          p.id === data.playerId
            ? { ...p, bombPower: data.playerStats.bombPower, maxBombs: data.playerStats.maxBombs, speed: data.playerStats.speed }
            : p
        ) : [];
        console.log(`🎁 Player ${data.playerId} collected ${data.type} power-up!`);
        return { ...prev, powerUps: updatedPowerUps, players: updatedPlayers };
      });
    });

    newSocket.on('gameEnded', (data) => {
      setGameState(prev => {
        if (!prev) return prev;
        return { ...prev, winner: data.winner, gameStatus: 'finished' };
      });
    });

    newSocket.on('playerDisconnected', (data) => {
      setGameState(prev => {
        if (!prev || !prev.players) return prev;
        return {
          ...prev,
          players: prev.players.filter(p => p.id !== data.playerId)
        };
      });
    });

    newSocket.on('error', (errMsg) => {
      setError(errMsg);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoinGame = (playerNickname) => {
    if (!playerNickname.trim()) {
      setError('Please enter a nickname');
      return;
    }
    
    setError('');
    socket.emit('joinGame', { nickname: playerNickname });
  };

  return (
    <div className="app">
      {screen === 'join' ? (
        <JoinScreen onJoin={handleJoinGame} error={error} />
      ) : (
        <GameScreen socket={socket} gameState={gameState} playerId={playerId} />
      )}
    </div>
  );
}

export default App;
