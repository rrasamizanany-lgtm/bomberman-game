import React, { useEffect, useRef } from 'react';
import '../App.css';

const CHARACTERS = ['😱', '🎮', '👾', '🤖', '👽', '🎯'];
const TILE_SIZE = 40;

// Fonction utilitaire pour ajuster la luminosité d'une couleur hex
function adjustBrightness(color, percent) {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
    (B < 255 ? B < 1 ? 0 : B : 255))
    .toString(16).slice(1);
}

// Convertir une direction en angle de rotation (en radians)
function directionToAngle(direction) {
  const angleMap = {
    'right': 0,
    'down': Math.PI / 2,
    'left': Math.PI,
    'up': -Math.PI / 2,
    'idle': 0
  };
  return angleMap[direction] || 0;
}

// Interpoler l'angle le plus court entre deux angles
function interpolateAngle(currentAngle, targetAngle, speed) {
  let diff = targetAngle - currentAngle;
  
  // Prendre le chemin le plus court autour du cercle
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  
  // Interpoler
  const newAngle = currentAngle + diff * speed;
  return newAngle;
}

function GameCanvas({ gameState, socket, playerId }) {
  const canvasRef = useRef(null);
  const keysPressed = useRef({});
  const playerPositionsRef = useRef({}); // Track player positions for direction
  const lastDirectionRef = useRef({}); // Track last direction pressed for each player
  const currentFacingAngleRef = useRef({}); // Track current facing angle for each player
  const targetFacingAngleRef = useRef({}); // Track target facing angle
  const turningRef = useRef({}); // Track if player is currently turning
  const animationFrameRef = useRef(0);
  const lastMovementTimeRef = useRef(0); // Track last time we sent movement
  const movementThrottleRef = useRef(50); // Send movement max 20 times per second (50ms)
  const playerCountLogRef = useRef(0); // Track if we've logged player count change

  useEffect(() => {
    // Log player count only if it changes
    const currentPlayerCount = gameState?.players?.length || 0;
    if (currentPlayerCount !== playerCountLogRef.current) {
      console.log(`👥 Players in canvas: ${currentPlayerCount}`, gameState?.players?.map(p => ({ id: p.id.substring(0, 8), nickname: p.nickname, x: p.x, y: p.y })));
      playerCountLogRef.current = currentPlayerCount;
    }
  }, [gameState?.players?.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !gameState || !gameState.config) return;

    // Set canvas dimensions
    canvas.width = gameState.config.MAP_WIDTH * TILE_SIZE;
    canvas.height = gameState.config.MAP_HEIGHT * TILE_SIZE;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid background
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gameState.config.MAP_WIDTH; i++) {
      ctx.beginPath();
      ctx.moveTo(i * TILE_SIZE, 0);
      ctx.lineTo(i * TILE_SIZE, gameState.config.MAP_HEIGHT * TILE_SIZE);
      ctx.stroke();
    }
    for (let i = 0; i <= gameState.config.MAP_HEIGHT; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * TILE_SIZE);
      ctx.lineTo(gameState.config.MAP_WIDTH * TILE_SIZE, i * TILE_SIZE);
      ctx.stroke();
    }

    // Draw bricks avec meilleur design
    if (gameState.bricks && gameState.bricks.length > 0) {
      gameState.bricks.forEach(brick => {
        const x = brick.x * TILE_SIZE + 1;
        const y = brick.y * TILE_SIZE + 1;
        const size = TILE_SIZE - 2;
        
        if (brick.destroyed) {
          // Briques cassées avec effet de disparition
          const timeSinceDestroy = Date.now() - brick.destroyedAt;
          const alpha = Math.max(0, 1 - timeSinceDestroy / 300);
          
          if (alpha > 0) {
            // Dégradé pour l'effet cassé
            const grad = ctx.createLinearGradient(x, y, x + size, y + size);
            grad.addColorStop(0, `rgba(40, 30, 20, ${alpha * 0.7})`);
            grad.addColorStop(1, `rgba(60, 40, 30, ${alpha * 0.9})`);
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, size, size);
            
            // Cracks/fissures diagonales
            ctx.strokeStyle = `rgba(150, 100, 50, ${alpha * 0.8})`;
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size, y + size);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(x + size, y);
            ctx.lineTo(x, y + size);
            ctx.stroke();
            
            // Cracks supplémentaires
            ctx.beginPath();
            ctx.moveTo(x + size/2, y);
            ctx.lineTo(x + size/2, y + size);
            ctx.stroke();
          }
        } else {
          // Brique intacte avec dégradé et texture 3D
          const gradientBrick = ctx.createLinearGradient(x, y, x + size, y + size);
          gradientBrick.addColorStop(0, '#C8662B');
          gradientBrick.addColorStop(0.5, '#A85515');
          gradientBrick.addColorStop(1, '#8B4513');
          
          ctx.fillStyle = gradientBrick;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
          ctx.shadowBlur = 3;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;
          ctx.fillRect(x, y, size, size);
          ctx.shadowColor = 'transparent';
          
          // Highlights (effet 3D)
          ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
          ctx.fillRect(x + 1, y + 1, size - 3, 2);
          
          // Bordure sombre
          ctx.strokeStyle = '#654321';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(x, y, size, size);
        }
      });
    }

    // Draw explosions with fire effect (BEFORE bombs so they appear on top)
    if (gameState.explosions && gameState.explosions.length > 0) {
      gameState.explosions.forEach(explosion => {
        const timeSinceExplosion = Date.now() - explosion.createdAt;
        const alpha = Math.max(0, 1 - timeSinceExplosion / 500);
        
        explosion.tiles.forEach((tile, index) => {
          const x = tile.x * TILE_SIZE;
          const y = tile.y * TILE_SIZE;
          
          // Centre de l'explosion (coeur du feu)
          if (index === 0) {
            // Cœur blanc/jaune pulsant du centre
            ctx.fillStyle = `rgba(255, 255, 150, ${alpha})`;
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            
            // Flammes jaunes du centre
            ctx.fillStyle = `rgba(255, 215, 0, ${alpha * 0.9})`;
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/3, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordure rouge du feu central
            ctx.strokeStyle = `rgba(255, 80, 0, ${alpha})`;
            ctx.lineWidth = 3;
            ctx.strokeRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
          } else {
            // Propagation en croix (+) avec effet de feu réaliste
            // Couche externe - Rouge vif (flamme externe)
            ctx.fillStyle = `rgba(255, 50, 0, ${alpha * 0.95})`;
            ctx.fillRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
            
            // Couche intermédiaire - Orange (flamme)
            ctx.fillStyle = `rgba(255, 120, 0, ${alpha * 0.85})`;
            ctx.fillRect(x + 4, y + 4, TILE_SIZE - 8, TILE_SIZE - 8);
            
            // Cœur des flammes - Jaune vif
            ctx.fillStyle = `rgba(255, 200, 0, ${alpha * 0.7})`;
            ctx.beginPath();
            ctx.arc(x + TILE_SIZE/2, y + TILE_SIZE/2, TILE_SIZE/4, 0, Math.PI * 2);
            ctx.fill();
            
            // Bordure extérieure rouge vif
            ctx.strokeStyle = `rgba(255, 30, 0, ${alpha})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x + 1, y + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          }
        });
      });
    }

    // Draw power-ups
    if (gameState.powerUps && gameState.powerUps.length > 0) {
      gameState.powerUps.forEach(powerUp => {
        const x = powerUp.x * TILE_SIZE + TILE_SIZE / 2;
        const y = powerUp.y * TILE_SIZE + TILE_SIZE / 2;
        
        // Fond blanc glow
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.arc(x, y, TILE_SIZE / 2 - 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Afficher le symbole du power-up
        ctx.font = `bold ${TILE_SIZE - 8}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#000';
        
        let symbol = '';
        if (powerUp.type === 'roller') {
          symbol = '🏎️'; // Roller
        } else if (powerUp.type === 'fire') {
          symbol = '🔥'; // Fire
        } else if (powerUp.type === 'bomb') {
          symbol = '💣'; // Bomb
        }
        
        ctx.fillText(symbol, x, y);
        
        // Bordure jaune/or pour faire ressortir
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(x, y, TILE_SIZE / 2 - 4, 0, Math.PI * 2);
        ctx.stroke();
      });
    }

    // Draw bombs avec meilleur design
    if (gameState.bombs && gameState.bombs.length > 0) {
      gameState.bombs.forEach(bomb => {
        const bombX = bomb.x * TILE_SIZE + TILE_SIZE / 2;
        const bombY = bomb.y * TILE_SIZE + TILE_SIZE / 2;
        const bombRadius = TILE_SIZE / 2 - 6;

        // Ombre de la bombe
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(bombX, bombY + bombRadius + 2, bombRadius * 1.2, bombRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.fill();

        // Dégradé pour la bombe 3D
        const bombGradient = ctx.createRadialGradient(bombX - 3, bombY - 3, 0, bombX, bombY, bombRadius);
        bombGradient.addColorStop(0, '#1a1a1a');
        bombGradient.addColorStop(0.6, '#000');
        bombGradient.addColorStop(1, '#333');
        ctx.fillStyle = bombGradient;
        ctx.beginPath();
        ctx.arc(bombX, bombY, bombRadius, 0, Math.PI * 2);
        ctx.fill();

        // Bordure brillante
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.beginPath();
        ctx.arc(bombX - 3, bombY - 3, bombRadius * 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Mèche (fuse) - meilleur rendu
        const fuseX = bombX;
        const fuseY = bombY - bombRadius;
        
        // Mèche ondulée
        ctx.strokeStyle = '#CD853F';
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(fuseX, bombY - bombRadius);
        const wave1 = Math.sin(Date.now() / 100) * 2;
        ctx.quadraticCurveTo(fuseX + 3 + wave1, fuseY - 5, fuseX, fuseY - 10);
        ctx.stroke();

        // Étincelle/flamme au bout de la mèche
        const flickerY = fuseY - 12 + Math.sin(Date.now() / 50) * 2;
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(fuseX, flickerY, 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(fuseX, flickerY, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Draw players avec animations de mouvement
    if (gameState.players && gameState.players.length > 0) {
      gameState.players.forEach(player => {
        if (player.alive) {
          const x = player.x * TILE_SIZE + TILE_SIZE / 2;
          const y = player.y * TILE_SIZE + TILE_SIZE / 2;
          const size = TILE_SIZE / 2.5;

          // Calculer la direction du mouvement
          const prevPos = playerPositionsRef.current[player.id] || { x: player.x, y: player.y };
          const dx = player.x - prevPos.x;
          const dy = player.y - prevPos.y;
          
          // Pour mon personnage, utiliser la dernière direction appuyée
          // Pour les autres, calculer à partir du mouvement
          let direction = 'idle';
          
          if (player.id === playerId) {
            // Utiliser la dernière direction que J'AI appuyée
            direction = lastDirectionRef.current[playerId] || 'idle';
          } else {
            // Pour les autres joueurs, calculer à partir du mouvement
            if (dx > 0) direction = 'right';
            else if (dx < 0) direction = 'left';
            else if (dy > 0) direction = 'down';
            else if (dy < 0) direction = 'up';
            else direction = lastDirectionRef.current[player.id] || 'idle';
          }

          // Sauvegarder la position
          playerPositionsRef.current[player.id] = { x: player.x, y: player.y };

          // Initialiser les angles si nécessaire
          if (!currentFacingAngleRef.current[player.id]) {
            currentFacingAngleRef.current[player.id] = directionToAngle(direction);
            targetFacingAngleRef.current[player.id] = directionToAngle(direction);
          }

          // Mettre à jour l'angle cible si la direction change
          const targetAngle = directionToAngle(direction);
          if (Math.abs(targetFacingAngleRef.current[player.id] - targetAngle) > 0.01) {
            targetFacingAngleRef.current[player.id] = targetAngle;
            turningRef.current[player.id] = true;
          }

          // Interpoler l'angle courant vers l'angle cible (vitesse de rotation)
          const turnSpeed = 0.15; // Vitesse de rotation (0-1, plus rapide = changement de direction plus lent)
          currentFacingAngleRef.current[player.id] = interpolateAngle(
            currentFacingAngleRef.current[player.id],
            targetFacingAngleRef.current[player.id],
            turnSpeed
          );

          // Vérifier si le tournage est terminé
          if (Math.abs(currentFacingAngleRef.current[player.id] - targetFacingAngleRef.current[player.id]) < 0.02) {
            turningRef.current[player.id] = false;
          }

          const currentAngle = currentFacingAngleRef.current[player.id];

          // Ajouter une traînée de mouvement si le joueur se déplace
          if (direction !== 'idle') {
            ctx.fillStyle = 'rgba(100, 100, 100, 0.1)';
            ctx.beginPath();
            ctx.ellipse(x - dx * 5, y - dy * 5, size * 1.3, size * 1.1, 0, 0, Math.PI * 2);
            ctx.fill();
          }

          // Ombre du personnage
          ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.beginPath();
          ctx.ellipse(x, y + size + 2, size * 1.2, size * 0.35, 0, 0, Math.PI * 2);
          ctx.fill();

          // Animation des jambes basée sur le temps
          const legAnimation = Math.sin(Date.now() / 150) * 0.15;
          const walkIntensity = direction === 'idle' ? 0 : 1;

          // Corps principal avec gradient
          const gradient = ctx.createLinearGradient(x - size, y - size, x + size, y + size);
          gradient.addColorStop(0, player.color);
          gradient.addColorStop(1, adjustBrightness(player.color, -30));
          ctx.fillStyle = gradient;
          
          // Rotation du corps selon l'angle courant
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(currentAngle);
          ctx.translate(-x, -y);

          const tilt = walkIntensity * 0.05; // Légère inclinaison lors de la marche
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(tilt * Math.sin(Date.now() / 150));
          ctx.translate(-x, -y);

          // Draw body (trapezoid style)
          ctx.beginPath();
          ctx.moveTo(x - size * 0.6, y - size * 0.2);
          ctx.lineTo(x + size * 0.6, y - size * 0.2);
          ctx.lineTo(x + size * 0.7, y + size * 0.6);
          ctx.lineTo(x - size * 0.7, y + size * 0.6);
          ctx.closePath();
          ctx.fill();

          // Bordure du corps
          ctx.strokeStyle = adjustBrightness(player.color, -50);
          ctx.lineWidth = 2;
          ctx.stroke();

          // Tête (cercle)
          ctx.fillStyle = adjustBrightness(player.color, 20);
          ctx.beginPath();
          ctx.arc(x, y - size * 0.5, size * 0.4, 0, Math.PI * 2);
          ctx.fill();

          // Yeux expressifs selon la direction
          ctx.fillStyle = '#FFF';
          const eyeSize = size * 0.12;
          const eyeDir = direction === 'right' ? 0.1 : direction === 'left' ? -0.1 : 0;
          
          ctx.beginPath();
          ctx.arc(x - size * 0.15 + eyeDir, y - size * 0.6, eyeSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + size * 0.15 + eyeDir, y - size * 0.6, eyeSize, 0, Math.PI * 2);
          ctx.fill();

          // Pupilles qui regardent dans la direction du mouvement
          ctx.fillStyle = '#000';
          const pupilSize = eyeSize * 0.6;
          const pupilDirX = direction === 'right' ? 0.08 : direction === 'left' ? -0.08 : 0;
          const pupilDirY = direction === 'down' ? 0.08 : direction === 'up' ? -0.08 : 0;
          
          ctx.beginPath();
          ctx.arc(x - size * 0.15 + eyeDir + pupilDirX, y - size * 0.6 + pupilDirY, pupilSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(x + size * 0.15 + eyeDir + pupilDirX, y - size * 0.6 + pupilDirY, pupilSize, 0, Math.PI * 2);
          ctx.fill();

          // Bras avec animation de balancement
          const armSwing = legAnimation * walkIntensity;
          ctx.restore();
          ctx.strokeStyle = adjustBrightness(player.color, 15);
          ctx.lineWidth = size * 0.3;
          ctx.lineCap = 'round';
          
          // Bras gauche
          ctx.beginPath();
          ctx.moveTo(x - size * 0.5, y);
          ctx.lineTo(x - size * 1.1, y - size * 0.3 + armSwing * size * 0.3);
          ctx.stroke();

          // Bras droit
          ctx.beginPath();
          ctx.moveTo(x + size * 0.5, y);
          ctx.lineTo(x + size * 1.1, y - size * 0.3 - armSwing * size * 0.3);
          ctx.stroke();

          // Jambes avec animation de marche
          ctx.lineWidth = size * 0.25;
          const legOffset = legAnimation * walkIntensity;
          
          // Jambe gauche
          ctx.beginPath();
          ctx.moveTo(x - size * 0.3, y + size * 0.7);
          ctx.lineTo(x - size * 0.4 + legOffset * size * 0.2, y + size * 1.3 + legOffset * size * 0.1);
          ctx.stroke();

          // Jambe droite (opposée)
          ctx.beginPath();
          ctx.moveTo(x + size * 0.3, y + size * 0.7);
          ctx.lineTo(x + size * 0.4 - legOffset * size * 0.2, y + size * 1.3 - legOffset * size * 0.1);
          ctx.stroke();

          // Draw nickname avec fond semi-transparent
          ctx.font = 'bold 11px Arial';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          const nickWidth = ctx.measureText(player.nickname).width;
          ctx.fillRect(
            player.x * TILE_SIZE + TILE_SIZE / 2 - nickWidth / 2 - 3,
            player.y * TILE_SIZE - 18,
            nickWidth + 6,
            13
          );
          ctx.fillStyle = '#fff';
          ctx.textAlign = 'center';
          ctx.fillText(
            player.nickname,
            player.x * TILE_SIZE + TILE_SIZE / 2,
            player.y * TILE_SIZE - 10
          );
        }
      });
    }
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      keysPressed.current[e.key] = true;

      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right'
      };

      if (keyMap[e.key]) {
        // Sauvegarder la dernière direction pour le joueur courant
        lastDirectionRef.current[playerId] = keyMap[e.key];
        // No need to send immediately, will be sent from animation loop
      }

      if (e.code === 'Space' && gameState?.gameId) {
        e.preventDefault();
        console.log(`💣 Placing bomb for gameId: ${gameState.gameId}`);
        socket.emit('placeBomb', { gameId: gameState.gameId });
      }
    };

    const handleKeyUp = (e) => {
      keysPressed.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, socket]);

  // Movement update loop - sends movement at fixed rate
  useEffect(() => {
    if (!gameState?.gameId || !socket) return;

    const movementInterval = setInterval(() => {
      const now = Date.now();
      const lastTime = lastMovementTimeRef.current;
      const threshold = movementThrottleRef.current;

      // Check if enough time has passed
      if (now - lastTime < threshold) return;

      // Get current pressed direction
      const keyMap = {
        ArrowUp: 'up',
        ArrowDown: 'down',
        ArrowLeft: 'left',
        ArrowRight: 'right',
        w: 'up',
        s: 'down',
        a: 'left',
        d: 'right'
      };

      let currentDirection = null;
      for (const [key, direction] of Object.entries(keyMap)) {
        if (keysPressed.current[key]) {
          currentDirection = direction;
          break;
        }
      }

      // Only send if there's an active direction
      if (currentDirection) {
        socket.emit('playerMove', {
          gameId: gameState.gameId,
          direction: currentDirection
        });
        lastMovementTimeRef.current = now;
      }
    }, 16); // Check every 16ms (60Hz)

    return () => clearInterval(movementInterval);
  }, [gameState, socket]);

  if (!gameState) return <div>Loading...</div>;

  return (
    <div className="game-wrapper">
      <canvas
        ref={canvasRef}
        style={{
          border: '3px solid #34495e',
          background: '#2c3e50',
          display: 'block',
          margin: '0 auto'
        }}
      />
    </div>
  );
}

export default GameCanvas;
