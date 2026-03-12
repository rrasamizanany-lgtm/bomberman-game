import React from 'react';
import GameCanvas from './GameCanvas';
import '../App.css';

function GameScreen({ socket, gameState, playerId }) {
  const [timeLeft, setTimeLeft] = React.useState(null);

  React.useEffect(() => {
    if (gameState?.gameStatus !== 'waiting') return;

    // Calculate time left based on number of players
    const playerCount = gameState.players?.length || 0;
    let totalTime = playerCount >= 2 ? 10 : 15; // seconds
    let timeRemaining = totalTime;

    const interval = setInterval(() => {
      timeRemaining--;
      setTimeLeft(timeRemaining);
      
      if (timeRemaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState?.gameStatus, gameState?.players?.length]);
  if (!gameState) {
    return (
      <div className="container">
        <h1>⏳ Waiting for game...</h1>
      </div>
    );
  }

  console.log('🎮 GameScreen rendered with playerId:', playerId);
  console.log('👥 Players in gameState:', gameState.players.length, gameState.players.map(p => ({ id: p.id, nickname: p.nickname, x: p.x, y: p.y })));

  const currentPlayer = gameState.players.find(p => p.id === playerId);
  const winner = gameState.winner;

  // Show waiting info when game hasn't started yet
  if (gameState.gameStatus === 'waiting') {
    const playerCount = gameState.players.length || 0;
    const maxPlayers = 6;
    const progressPercent = (playerCount / maxPlayers) * 100;
    
    return (
      <div className="app">
        <div className="game-container">
          <div className="waiting-screen">
            <h2>⏳ Game Starting Soon...</h2>
            <img 
              src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='40' fill='none' stroke='%23667eea' stroke-width='4'/%3E%3Ctext x='50' y='60' text-anchor='middle' font-size='30' fill='%23667eea'%3E💣%3C/text%3E%3C/svg%3E"
              alt="Bomberman"
              style={{ width: '100px', height: '100px', margin: '20px 0' }}
            />
            <p>Players connected: {playerCount}/6</p>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
            </div>
            <div className="players-list-waiting">
              {gameState.players.map(p => (
                <div key={p.id} className="player-waiting-item">
                  <div style={{ backgroundColor: p.color }} className="color-dot"></div>
                  <span>{p.nickname}{p.id === playerId ? ' (You)' : ''}</span>
                </div>
              ))}
            </div>
            <div className="countdown">
              {timeLeft !== null && timeLeft > 0 ? (
                <>
                  <p style={{ fontSize: '24px', fontWeight: 'bold', margin: '20px 0' }}>⏱️ {timeLeft}s</p>
                  <p style={{ fontSize: '12px', color: '#ccc' }}>Game starts in {timeLeft} second{timeLeft !== 1 ? 's' : ''}</p>
                </>
              ) : (
                <p style={{ fontSize: '12px', color: '#999', marginTop: '20px' }}>Starting game...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="game-container">
        <GameCanvas gameState={gameState} socket={socket} playerId={playerId} />
        
        <div className="game-info">
          <h3>Game Status</h3>
          
          <div className="info-section">
            <div style={{ fontSize: '14px', color: '#666' }}>
              Status: <strong>{gameState.gameStatus === 'waiting' ? '⏳ Waiting' : gameState.gameStatus === 'playing' ? '▶️ Playing' : '🏁 Finished'}</strong>
            </div>
            {gameState.gameStatus === 'playing' && currentPlayer && (
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                Bombs: {currentPlayer.maxBombs - currentPlayer.activeBombs}/{currentPlayer.maxBombs}
              </div>
            )}
          </div>

          <div className="info-section">
            <h4 style={{ color: '#333', marginBottom: '10px' }}>Players ({gameState.players.length})</h4>
            {gameState.players.map(player => (
              <div key={player.id} className="player-info">
                <div 
                  className="player-color" 
                  style={{ backgroundColor: player.color }}
                />
                <span style={{ flex: 1 }}>{player.nickname}</span>
                {player.id === playerId && <span style={{ fontSize: '12px', color: '#667eea', fontWeight: 'bold' }}> (You)</span>}
                <span className={`status-badge ${player.alive ? 'alive' : 'dead'}`}>
                  {player.alive ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>

          {winner && (
            <div className="winner-message">
              🎉 Winner: {winner.nickname} 🎉
            </div>
          )}

          <div className="controls">
            <h4 style={{ marginBottom: '10px' }}>Controls</h4>
            <p>↑ ↓ ← → : Move</p>
            <p>SPACE : Place Bomb</p>
            <p>Max 6 players per game</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default GameScreen;
