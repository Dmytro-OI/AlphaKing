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
    setLobbyCode,
    chunk,
    round,
    currentPlayerId,
    isGameStarted,
    setIsGameStarted
  } = useGame();

  const [word, setWord] = useState('');
  const [players, setPlayers] = useState([]);
  const [mySocketId, setMySocketId] = useState('');

  useSocketEvents();
  const secondsLeft = useTimer(currentPlayerId === mySocketId);

  // 🔌 Отримати свій socket.id гарантовано
  useEffect(() => {
    if (socket.connected) {
      setMySocketId(socket.id);
    } else {
      socket.on('connect', () => {
        setMySocketId(socket.id);
      });
    }
  }, []);

  // 📡 Отримання гравців
  useEffect(() => {
    socket.on('lobbyUpdate', (lobby) => {
      setPlayers(lobby.players || []);
    });

    socket.on('gameStarted', () => {
      console.log('🎮 Гра почалась!');
      setIsGameStarted(true);
    });

    return () => {
      socket.off('lobbyUpdate');
      socket.off('gameStarted');
    };
  }, []);

  // ▶️ Почати гру (хост)
  const startGame = () => {
    socket.emit('startGame', lobbyCode);
  };

  const submit = () => {
    if (!word.trim()) return;
    socket.emit('submitWord', { lobbyCode, word });
    setWord('');
  };

  const isHost = players[0]?.id === mySocketId;

  // 🎯 Якщо гра ще не почалась
  if (!isGameStarted) {
    return (
      <div className="container">
        <h2>Лобі: {lobbyCode}</h2>
        <Lobby players={players} isHost={isHost} onStart={startGame} />
        <p>Очікуємо початку гри...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Раунд {round}</h2>
      <h3>Склад: <span style={{ color: '#4af' }}>{chunk}</span></h3>
      <p>⏱️ Час: {secondsLeft} сек.</p>
      <h4>
        {currentPlayerId === mySocketId
          ? '🟢 Твій хід — введи слово:'
          : '🔴 Хід іншого гравця'}
      </h4>

      {currentPlayerId === mySocketId && (
        <>
          <input
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="Введи слово"
          />
          <button onClick={submit}>Відправити</button>
        </>
      )}
    </div>
  );
}

export default Game;
