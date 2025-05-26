import { useEffect } from 'react';
import { socket } from '../socket';
import { useGame } from '../context/GameContext';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const useSocketEvents = () => {
  const {
    setChunk,
    setRound,
    setCurrentPlayerId
  } = useGame();
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('turn', ({ playerId, chunk, round }) => {
      setCurrentPlayerId(playerId);
      setChunk(chunk);
      setRound(round);
    });

    socket.on('invalidWord', () => {
      toast.error('❌ Неправильне слово!');
    });

      socket.on('validWord', () => {
    toast.success('✅ Слово прийнято!');
    });

    socket.on('playerEliminated', (id) => {
      if (id === socket.id) {
        toast.error('💀 Ти вибув!');
      } else {
        toast.warn('🔻 Суперник вибув!');
      }
    });

    return () => {
      socket.off('turn');
      socket.off('invalidWord');
      socket.off('playerEliminated');
      socket.off('gameOver');
      socket.off('validWord')
    };
  }, []);
};
