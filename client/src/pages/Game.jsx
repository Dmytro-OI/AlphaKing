import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { socket } from '../socket';
import { useSocketEvents } from '../hooks/useSocketEvents';
import { useTimer } from '../hooks/useTimer';
import Lobby from '../components/Lobby';
import WordInput from '../components/WordInput';
import WinnerScreen from '../components/WinnerScreen';
import PlayersCircle from '../components/PlayersCircle';
import { toast } from 'react-toastify';

function Game() {
  const navigate = useNavigate();

  const {
    username,
    lobbyCode,
    setLobbyCode,
    chunk,
    round,
    currentPlayerId,
    isGameStarted,
    setIsGameStarted,
    setChunk,
    setRound,
    setCurrentPlayerId,
    players,
    setPlayers,
    winner,
    setWinner,
    eliminatedPlayers,
    setEliminatedPlayers
  } = useGame();

  const [mySocketId, setMySocketId] = useState('');
  const [word, setWord] = useState('');
  const [hp, setHp] = useState(3);
  const [turnStart, setTurnStart] = useState(Date.now());
  const [chunkAnim, setChunkAnim] = useState(false);
  const [hpAnim, setHpAnim] = useState(false);
  const [gameOverCountdown, setGameOverCountdown] = useState(null);
  const [playerOutId, setPlayerOutId] = useState(null);
  const prevHp = useRef(hp);

  useEffect(() => {
    const onGameOver = (winnerObj) => {
      setWinner(winnerObj);
      setGameOverCountdown(3);
    };
    socket.on('gameOver', onGameOver);
    return () => socket.off('gameOver', onGameOver);
  }, [setWinner]);


  useSocketEvents({
    setPlayers,
    setLobbyCode,
    setIsGameStarted,
    setHp,
    setChunk,
    setRound,
    setCurrentPlayerId,
    setTurnStart,
    setEliminatedPlayers
  });

  useEffect(() => {
    if (socket.connected) {
      setMySocketId(socket.id);
    } else {
      socket.on('connect', () => setMySocketId(socket.id));
    }
  }, []);

  useEffect(() => {
    if (isGameStarted) {
      setEliminatedPlayers([]);
      setHp(3); 
    }
  }, [isGameStarted, setEliminatedPlayers, setHp]);

  useEffect(() => {
    if (gameOverCountdown === null) return;

    if (gameOverCountdown === 0) {
      setWinner(null);
      setGameOverCountdown(null);
      return;
    }

    const timer = setTimeout(() => setGameOverCountdown(gameOverCountdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [gameOverCountdown, setWinner]);

  const isHost = players.length > 0 && players[0].id === mySocketId;
  const isEliminated = eliminatedPlayers.includes(mySocketId);
  const isMyTurn = currentPlayerId === mySocketId && !isEliminated;
  const secondsLeft = useTimer(isMyTurn, 10, turnStart);

  useEffect(() => {
    console.log('secondsLeft in Game.jsx:', secondsLeft);
  }, [secondsLeft]);

  useEffect(() => {
    if (chunk) {
      setChunkAnim(true);
      const timer = setTimeout(() => setChunkAnim(false), 500);
      return () => clearTimeout(timer);
    }
  }, [chunk]);

  useEffect(() => {
    if (hp < prevHp.current) {
      setHpAnim(true);
      const timer = setTimeout(() => setHpAnim(false), 500);
      return () => clearTimeout(timer);
    }
    prevHp.current = hp;
  }, [hp]);

  useEffect(() => {
    if (hp === 0) {
      socket.emit('playerEliminated', mySocketId);
    }
  }, [hp, mySocketId]);

  const handleWordSubmit = () => {
    if (!word.trim()) {
      toast.warn('Введи слово!');
      return;
    }
    socket.emit('submitWord', { lobbyCode, word });
    setWord('');
  };

  if (winner) {
    return (
      <WinnerScreen
        winnerName={winner.id === mySocketId ? 'Ти' : winner.username}
        countdown={gameOverCountdown}
      />
    );
  }

  if (!isGameStarted) {
    return (
      <div className="game-page-wrapper">
        <div className="container">
          <h2>Лобі: <span>{lobbyCode || '...'}</span></h2>
          <Lobby
            players={players}
            isHost={isHost}
            onStart={() => socket.emit('startGame', lobbyCode)}
          />
          <p>Очікуємо початку гри...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="game-page-wrapper">
      <div className="container">
        <h2>Раунд {round}</h2>
        <h3 className="chunk-display">
          Склад: <span className={`chunk-anim${chunkAnim ? ' animate' : ''}`}>{chunk}</span>
        </h3>
        <PlayersCircle
          players={players}
          currentPlayerId={currentPlayerId}
          eliminatedPlayers={eliminatedPlayers}
        />
        <h4>
          <span className={`hp-anim${hpAnim ? ' shake' : ''}`}>❤️ Твоє HP: {hp}</span>
        </h4>
        <div className="timer-bar-wrap">
          <div className="timer-bar" style={{ width: `${(secondsLeft / 10) * 100}%` }} />
        </div>
        <p>⏱️ Час: {secondsLeft} сек.</p>
        <h4>
          {isMyTurn ? '🟢 Твій хід — введи слово:' : '🔴 Хід іншого гравця'}
        </h4>
        {isMyTurn && (
          <WordInput
            word={word}
            setWord={setWord}
            onSubmit={handleWordSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default Game;
