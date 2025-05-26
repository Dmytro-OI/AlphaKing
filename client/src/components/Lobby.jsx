import React from 'react';

function Lobby({ players = [], isHost, onStart }) {
  return (
    <div className="lobby">
      <h3>Гравці:</h3>
      <ul className="player-list">
        {players.map((p, index) => (
          <li key={p.id}>
            🧑 {p.username}
            {index === 0 && <span className="host-badge"> (Хост)</span>}
          </li>
        ))}
      </ul>

      {isHost && (
        <button onClick={onStart} className="start-button">
          ▶️ Почати гру
        </button>
      )}
    </div>
  );
}

export default Lobby;
