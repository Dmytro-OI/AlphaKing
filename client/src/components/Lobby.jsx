import React from 'react';

function Lobby({ players, isHost, onStart }) {
  return (
    <div>
      <h3>Гравці:</h3>
      <ul>
        {players.map((p) => (
          <li key={p.id}>🧑 {p.username}</li>
        ))}
      </ul>
      {isHost && <button onClick={onStart}>▶️ Почати гру</button>}
    </div>
  );
}

export default Lobby;
