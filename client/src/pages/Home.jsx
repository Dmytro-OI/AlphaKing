import React, { useState } from 'react';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';

function Home() {
  const [username, setUsername] = useState('');
  const [lobbyCode, setLobbyCode] = useState('');
  const navigate = useNavigate();

  const createLobby = () => {
    socket.emit('createLobby', { username }, ({ lobbyCode }) => {
      setLobbyCode(lobbyCode);
      localStorage.setItem('username', username);
      localStorage.setItem('lobbyCode', lobbyCode);
      navigate('/game');
    });
  };

  const joinLobby = () => {
    socket.emit('joinLobby', { username, lobbyCode }, (res) => {
      if (res.error) return alert(res.error);
      setLobbyCode(lobbyCode);
      localStorage.setItem('username', username);
      localStorage.setItem('lobbyCode', lobbyCode);
      navigate('/game');
    });
  };

  return (
    <div className="container">
      <h1>AlphaKing 👑</h1>
      <input placeholder="Твоє ім’я" onChange={(e) => setUsername(e.target.value)} />
      <button onClick={createLobby}>Створити лобі</button>
      <input placeholder="Код лобі" onChange={(e) => setLobbyCode(e.target.value.toUpperCase())} />
      <button onClick={joinLobby}>Приєднатись</button>
    </div>
  );
}

export default Home;
