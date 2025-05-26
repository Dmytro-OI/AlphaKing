import React, { useState } from 'react';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';

function Home() {
  const [usernameInput, setUsernameInput] = useState('');
  const [inputLobbyCode, setInputLobbyCode] = useState(''); // локальний код для поля вводу

  const { setUsername, setLobbyCode } = useGame(); // глобальні сеттери з контексту
  const navigate = useNavigate();

  const createLobby = () => {
    if (!usernameInput.trim()) return alert('Введи ім’я');
    socket.emit('createLobby', { username: usernameInput }, ({ lobbyCode }) => {
      setUsername(usernameInput);
      setLobbyCode(lobbyCode);
      localStorage.setItem('username', usernameInput);
      localStorage.setItem('lobbyCode', lobbyCode);
      navigate('/game');
    });
  };

  const joinLobby = () => {
    if (!usernameInput.trim() || !inputLobbyCode.trim()) return alert('Введи ім’я і код лобі');
    socket.emit('joinLobby', { username: usernameInput, lobbyCode: inputLobbyCode }, (res) => {
      if (res.error) return alert(res.error);
      setUsername(usernameInput);
      setLobbyCode(inputLobbyCode);
      localStorage.setItem('username', usernameInput);
      localStorage.setItem('lobbyCode', inputLobbyCode);
      navigate('/game');
    });
  };

  return (
    <div className="container">
      <h1>AlphaKing 👑</h1>
      <input
        placeholder="Твоє ім’я"
        value={usernameInput}
        onChange={(e) => setUsernameInput(e.target.value)}
      />
      <button onClick={createLobby}>Створити лобі</button>

      <input
        placeholder="Код лобі"
        value={inputLobbyCode}
        onChange={(e) => setInputLobbyCode(e.target.value.toUpperCase())}
      />
      <button onClick={joinLobby}>Приєднатись</button>
    </div>
  );
}

export default Home;
