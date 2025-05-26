import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { socket } from '../socket';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useTimer } from '../hooks/useTimer';
import Lobby from '../components/Lobby';

function Game() {
  const {
    username,
    lobbyCode,
    chunk,
    round,
    currentPlayerId,
    isGameStarted,
    setIsGameStarted
  } = useGame();

  const [word, setWord] = useState('');
  const [players, setPlayers] = useState([]);
  const myId = socket.id;

  useSocketEvents();
  const secondsLeft = useTimer(currentPlayerId === myId);

  useEffect(() => {
    socket.on('lobbyUpdate', (lobby) => {
      setPlayers(lobby.players || []);
    });

    return () => {
      socket.off('lobbyUpdate');
    };
  }, []);

  const startGame = () => {
    socket.emit('startGame', lobbyCode);
    setIsGameStarted(true);
  };

  const submit = () => {
    if (!word.trim()) return;
    socket.emit('submitWord', { lobbyCode, word });
    setWord('');
  };

  const isHost = players[0]?.id === myId;

  return (
    <div className="container">
      <h2>Лобі: {lobbyCode}</h2>
      {!isGameStarted ? (
        <Lobby players={players} isHost={isHost} onStart={startGame} />
      ) : (
        <>
          <h2>Раунд {round}</h2>
          <h3>Склад: <span style={{ color: '#4af' }}>{chunk}</span></h3>
          <p>⏱️ Час: {secondsLeft} сек.</p>
          <h4>
            {currentPlayerId === myId
              ? '🟢 Твій хід — введи слово:'
              : '🔴 Хід іншого гравця'}
          </h4>

          {currentPlayerId === myId && (
            <>
              <input
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Введи слово"
              />
              <button onClick={submit}>Відправити</button>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default Game;
