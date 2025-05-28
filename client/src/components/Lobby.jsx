import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../socket';

function Lobby({ players = [], isHost, isGameStarted, onStart }) {
  const navigate = useNavigate();

  // Додаємо логування для відстеження оновлень
  useEffect(() => {
    console.log('Lobby players updated:', players);
  }, [players]);

  const handleLeave = () => {
    socket.emit('leaveLobby');
    navigate('/');
  };

  const handleStartGame = () => {
    onStart();
  };

  // Запитуємо оновлення стану лобі при монтуванні
  useEffect(() => {
    socket.emit('returnToLobby');
  }, []);

  return (
    <div className="lobby">
      <h3>Гравці ({players.length}):</h3>
      <ul className="player-list">
        {players.map((p, index) => (
          <li key={p.id} className="player-item">
            🧑 {p.username}
            {index === 0 && <span className="host-badge"> (Хост)</span>}
          </li>
        ))}
      </ul>

      <div className="lobby-buttons">
        {isHost && !isGameStarted && (
          <button onClick={handleStartGame} className="start-button">
            ▶️ Почати гру
          </button>
        )}
        {isHost && isGameStarted && (
          <button onClick={handleStartGame} className="start-button">
            ▶️ Почати нову гру
          </button>
        )}
        <button onClick={handleLeave} className="leave-button">
          ↩️ Вийти з лобі
        </button>
      </div>
    </div>
  );
}

export default Lobby;
