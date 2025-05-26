import React, { useState } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

function App() {
  const [username, setUsername] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const [joinedLobby, setJoinedLobby] = useState(false);
  const [isHost, setIsHost] = useState(false);
  const [lobbyState, setLobbyState] = useState(null);

  const createLobby = () => {
    socket.emit('createLobby', { username }, ({ lobbyCode }) => {
      setLobbyCode(lobbyCode);
      setJoinedLobby(true);
      setIsHost(true);
    });
  };

  const joinLobby = () => {
    socket.emit('joinLobby', { username, lobbyCode }, (res) => {
      if (res.error) return alert(res.error);
      setJoinedLobby(true);
    });
  };

  socket.on('lobbyUpdate', (lobby) => {
    setLobbyState(lobby);
  });

  socket.on('gameStarted', () => {
    alert('Гра почалась!');
  });

  return (
    <div style={{ padding: 40 }}>
      {!joinedLobby ? (
        <>
          <input placeholder="Ім'я" onChange={(e) => setUsername(e.target.value)} />
          <br />
          <button onClick={createLobby}>Створити Лобі</button>
          <br />
          <input placeholder="Код Лобі" onChange={(e) => setLobbyCode(e.target.value.toUpperCase())} />
          <button onClick={joinLobby}>Приєднатись</button>
        </>
      ) : (
        <div>
          <h2>Лобі: {lobbyCode}</h2>
          <ul>
            {lobbyState?.players.map((p) => (
              <li key={p.id}>{p.username}</li>
            ))}
          </ul>
          {isHost && <button onClick={() => socket.emit('startGame', lobbyCode)}>Почати гру</button>}
        </div>
      )}
    </div>
  );
}

export default App;
