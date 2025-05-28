import { useEffect } from 'react';
import { socket } from '../socket';
import { toast } from 'react-toastify';

export const useSocketEvents = ({ setPlayers, setLobbyCode, setIsGameStarted, setHp, setChunk, setRound, setCurrentPlayerId, setTurnStart, setEliminatedPlayers }) => {
  console.log('useSocketEvents hook initializing');
  
  useEffect(() => {
    console.log('Setting up socket event listeners');
    
    const handleLobbyUpdate = (lobby) => {
      try {
        console.log('Received lobbyUpdate:', lobby);
        if (!lobby) return;
        
        // Завжди оновлюємо список гравців, навіть якщо він пустий
        setPlayers(lobby.players || []);
        
        // Оновлюємо код лобі, якщо він є
        if (lobby.code) {
          setLobbyCode(lobby.code);
        }
        
        // Оновлюємо HP поточного гравця
        const me = lobby.players?.find(p => p.id === socket.id);
        if (me) {
          setHp(me.hp);
        }

        // Додатково логуємо для дебагу
        console.log('Updated players state:', lobby.players);
      } catch (error) {
        console.error('Error in handleLobbyUpdate:', error);
      }
    };

      const handleGameStarted = () => {
        setIsGameStarted(true);
        setHp(3);
        setEliminatedPlayers([]);  // Скидаємо вибутих гравців при старті
        toast.info('🎮 Гра почалась!', {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
        });
      };

    const handleTurn = ({ playerId, chunk, round, turnStart }) => {
      try {
        console.log('Turn update:', { playerId, chunk, round, turnStart });
        if (!playerId || !chunk) return;
        
        setCurrentPlayerId(playerId);
        setChunk(chunk);
        setRound(round);
        setTurnStart(turnStart || Date.now());
      } catch (error) {
        console.error('Error in handleTurn:', error);
      }
    };

    const handleInvalidWord = () => {
      try {
        console.log('Invalid word submitted');
      } catch (error) {
        console.error('Error in handleInvalidWord:', error);
      }
    };

    const handleValidWord = () => {
      try {
        console.log('Valid word submitted');
      } catch (error) {
        console.error('Error in handleValidWord:', error);
      }
    };

    const handlePlayerDamaged = ({ id, hp }) => {
      try {
        console.log('Player damaged:', { id, hp });
        if (id === socket.id) {
          setHp(hp);
          toast.warning(`💔 -1 HP! Залишилось: ${hp}`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
          });

          // Якщо HP 0, вибиваємо гравця
          if (hp === 0) {
            socket.emit('playerEliminated', id);  // Надсилаємо подію вибування
          }
        }
      } catch (error) {
        console.error('Error in handlePlayerDamaged:', error);
      }
    };

    const handlePlayerEliminated = (id) => {
      try {
        console.log('Player eliminated:', id);
        setEliminatedPlayers(prev => [...prev, id]);
        if (id === socket.id) {
          toast.error('💀 Ти вибув!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
          });
        } else {
          toast.warning('🔻 Суперник вибув!', {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
          });
        }
      } catch (error) {
        console.error('Error in handlePlayerEliminated:', error);
      }
    };

    const handleGameOver = (winner) => {
      try {
        console.log('Game over:', winner);
        if (winner.id === socket.id) {
          toast.success('👑 Ти переміг!', {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
          });
        } else {
          toast.info(`👑 Переміг: ${winner.username}`, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: true,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: false,
          });
        }
        
        // Reset game state but keep lobby
        setIsGameStarted(false);
        setChunk('');
        setRound(0);
        setCurrentPlayerId('');
        setHp(3);
      } catch (error) {
        console.error('Error in handleGameOver:', error);
      }
    };

    const handleError = (message) => {
      toast.error(message);
    };

    // Підключаємо обробники подій
    socket.on('lobbyUpdate', handleLobbyUpdate);
    socket.on('gameStarted', handleGameStarted);
    socket.on('turn', handleTurn);
    socket.on('invalidWord', handleInvalidWord);
    socket.on('validWord', handleValidWord);
    socket.on('playerDamaged', handlePlayerDamaged);
    socket.on('playerEliminated', handlePlayerEliminated);
    socket.on('gameOver', handleGameOver);
    socket.on('error', handleError);

    // Очищення при розмонтуванні
    return () => {
      console.log('Cleaning up socket event listeners');
      socket.off('lobbyUpdate', handleLobbyUpdate);
      socket.off('gameStarted', handleGameStarted);
      socket.off('turn', handleTurn);
      socket.off('invalidWord', handleInvalidWord);
      socket.off('validWord', handleValidWord);
      socket.off('playerDamaged', handlePlayerDamaged);
      socket.off('playerEliminated', handlePlayerEliminated);
      socket.off('gameOver', handleGameOver);
      socket.off('error', handleError);
    };
  }, [setPlayers, setLobbyCode, setIsGameStarted, setHp, setChunk, setRound, setCurrentPlayerId, setTurnStart, setEliminatedPlayers]);
};
