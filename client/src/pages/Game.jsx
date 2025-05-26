import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { socket } from '../socket';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useTimer } from '../hooks/useTimer';
import Lobby from '../components/Lobby';
import { toast } from 'react-toastify';

function Game() {
  const {
    username,
    lobbyCode,
    setLobbyCode,
    chunk,
    round,
    currentPlayerId,
    isGameStarted,
    setIsGameStarted,
    hp,
    setHp,
    setChunk,
    setRound,
    setCurrentPlayerId
  } = useGame();

  const [players, setPlayers] = useState([]);
  const [mySocketId, setMySocketId] = useState('');
  const [word, setWord] = useState('');

  const secondsLeft = useTimer(currentPlayerId === mySocketId);

  // DEBUG
  console.log('🧠 [useGame]', {
    username,
    lobbyCode,
    chunk,
    round,
    currentPlayerId,
    isGameStarted,
    hp
  });

  useSocketEvents();

  useEffect(() => {
    if (socket.connected) {
      setMySocketId(socket.id);
      console.log(`✅ Socket connected: ${socket.id}`);
    } else {
      socket.on('connect', () => {
        setMySocketId(socket.id);
        console.log(`🔌 Socket connected later: ${socket.id}`);
      });
    }
  }, []);

  useEffect(() => {
    socket.on('lobbyUpdate', (lobby) => {
      console.log('📡 [lobbyUpdate]', lobby);
      setPlayers(lobby.players || []);
      if (lobby.code) setLobbyCode(lobby.code);
    });

    socket.on('gameStarted', () => {
      console.log('🎮 [Game Started]');
      setIsGameStarted(true);
      setHp(3);
    });

    socket.on('playerDamaged', ({ id, hp }) => {
      console.log('⚠️ [playerDamaged]', id, hp);
      if (id === socket.id) {
        setHp(hp);
        toast.warn(`💔 -1 HP! Залишилось: ${hp}`);
      }
    });

    socket.on('playerEliminated', (id) => {
      console.log('☠️ [playerEliminated]', id);
      if (id === socket.id) {
        toast.error('💀 Ти вибув!');
      } else {
        toast.warn('🔻 Гравець вибув!');
      }
    });

    socket.on('gameOver', (winner) => {
      console.log('🏁 [Game Over]', winner);
      if (!winner) toast.info('Гру завершено — всі вибули!');
      else if (winner.id === socket.id) toast.success('👑 Ти переміг!');
      else toast.info(`👑 Переміг: ${winner.username}`);

      // Reset state
      localStorage.removeItem('lobbyCode');
      localStorage.removeItem('username');
      setLobbyCode('');
      setIsGameStarted(false);
      setChunk('');
      setRound(0);
      setCurrentPlayerId('');
      setHp(3);

      // reconnect
      socket.disconnect();
      socket.connect();
    });

    return () => {
      socket.off('lobbyUpdate');
      socket.off('gameStarted');
      socket.off('playerDamaged');
      socket.off('playerEliminated');
      socket.off('gameOver');
    };
  }, []);

  const submit = () => {
    if (!word.trim()) return;
    console.log(`📤 [submitWord] "${word}"`);
    socket.emit('submitWord', { lobbyCode, word });
    setWord('');
  };

  const startGame = () => {
    console.log('🚀 [startGame]');
    socket.emit('startGame', lobbyCode);
  };

  const isHost = players.length > 0 && players[0].id === mySocketId;

  if (!isGameStarted) {
    return (
      <div className="container">
        <h2>Лобі: <span>{lobbyCode || '...'}</span></h2>
        <Lobby players={players} isHost={isHost} onStart={startGame} />
        <p>Очікуємо початку гри...</p>
      </div>
    );
  }

  const isMyTurn = currentPlayerId === mySocketId;

  return (
    <div className="container">
      <h2>Раунд {round}</h2>
      <h3>Склад: <span style={{ color: '#4af' }}>{chunk}</span></h3>
      <h4>❤️ Твоє HP: {hp}</h4>
      <p>⏱️ Час: {secondsLeft} сек.</p>
      <h4>
        {isMyTurn
          ? '🟢 Твій хід — введи слово:'
          : '🔴 Хід іншого гравця'}
      </h4>

    {isMyTurn && (
    <>
        {console.log('⌨️ Input rendered for:', username, 'Socket:', mySocketId)}
        <input
        value={word}
        onChange={(e) => {
            setWord(e.target.value);
            console.log('✏️ Введено:', e.target.value);
        }}
        placeholder="Введи слово"
        onKeyDown={(e) => {
            if (e.key === 'Enter') {
            console.log('⏎ Enter натиснуто — слово відправляється:', word);
            submit();
            }
        }}
        />
        <button
        onClick={() => {
            console.log('📤 Надіслано через кнопку:', word);
            submit();
        }}
        >
        Надіслати
        </button>
    </>
    )}

    </div>
  );
}

export default Game;
