import React, { useState } from 'react';
import '../App.css';

function JoinScreen({ onJoin, error }) {
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onJoin(nickname);
  };

  return (
    <div className="container">
      <h1>💣 BOMBERMAN 💣</h1>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input
            type="text"
            placeholder="Enter your nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            maxLength="20"
          />
        </div>
        <button type="submit">Join Game</button>
      </form>
      {error && <div className="error">{error}</div>}
      <div className="status">
        <p>Waiting for other players to join...</p>
        <p style={{ fontSize: '14px', marginTop: '10px' }}>Max 6 players per game</p>
      </div>
    </div>
  );
}

export default JoinScreen;
