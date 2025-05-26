import React, { useEffect, useState } from 'react';
import socket from '../socket';

function Game({ lobbyCode, username }) {
  const [chunk, setChunk] = useState('');
  const [word, setWord] = useState('');
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [myId, setMyId] = useState(socket.id);
  const [status, setStatus] = useState('Очікуємо...');

  useEffect(() => {
    socket.on('turn', ({ playerId, chunk, round }) => {
      setCurrentPlayerId(playerId);
      setChunk(chunk);
      setStatus(playerId === socket.id ? 'Твій хід!' : 'Хід іншого гравця...');
    });

    socket.on('invalidWord', () => {
      alert('Недійсне слово!');
    });

    socket.on('playerEliminated', (id) => {
      if (id === socket.id) setStatus('Ти програв 💀');
    });

    socket.on('gameOver', (winner) => {
      if (winner.id === socket.id) alert('Ти переміг! 👑');
      else alert(`Переможець: ${winner.username}`);
    });
  }, []);

  const submit = () => {
    socket.emit('submitWord', { lobbyCode, word });
    setWord('');
  };

  return (
    <div>
      <h2>Склад: {chunk}</h2>
      <p>{status}</p>
      {currentPlayerId === socket.id && (
        <>
          <input value={word} onChange={e => setWord(e.target.value)} />
          <button onClick={submit}>Відправити</button>
        </>
      )}
    </div>
  );
}

export default Game;
