import { useEffect } from 'react';
import { socket } from '../socket';
import { useGame } from '../context/GameContext';
import { useNavigate } from 'react-router-dom';

export const useSocketEvents = () => {
  const {
    setChunk, setRound, setCurrentPlayerId, setIsGameStarted
  } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('gameStarted', () => {
      console.log('🎮 Гра почалась!');
      setIsGameStarted(true);
    });

    socket.on('turn', ({ playerId, chunk, round }) => {
      console.log('🔁 Новий хід:', chunk);
      setCurrentPlayerId(playerId);
      setChunk(chunk);
      setRound(round);
    });

    socket.on('invalidWord', () => {
      alert('❌ Слово неправильне!');
    });

    socket.on('playerEliminated', (id) => {
      if (id === socket.id) alert('💀 Ти вибув з гри');
    });

    socket.on('gameOver', (winner) => {
      if (winner?.id === socket.id) {
        alert('👑 Ти переміг!');
      } else if (!winner) {
        alert('Гра завершена. Усі вибули!');
      } else {
        alert(`Переміг: ${winner.username}`);
      }
      navigate('/');
    });

    return () => {
      socket.off('gameStarted');
      socket.off('turn');
      socket.off('invalidWord');
      socket.off('playerEliminated');
      socket.off('gameOver');
    };
  }, []);
};
