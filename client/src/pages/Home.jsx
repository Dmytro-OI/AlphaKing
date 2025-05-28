import React, { useState } from 'react';
import { socket } from '../socket';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { toast } from 'react-toastify';
import RulesModal from '../components/RulesModal';
import '../styles.css'; // Додаємо імпорт стилів

function Home() {
  console.log('Home component rendering');
  
  const [usernameInput, setUsernameInput] = useState('');
  const [inputLobbyCode, setInputLobbyCode] = useState(''); // локальний код для поля вводу
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  const { setUsername, setLobbyCode } = useGame(); // глобальні сеттери з контексту
  const navigate = useNavigate();

  const createLobby = () => {
    console.log('Creating lobby with username:', usernameInput);
    if (!usernameInput.trim()) {
      toast.warning("Введи ім'я", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
      });
      return;
    }
    socket.emit('createLobby', { username: usernameInput }, ({ lobbyCode }) => {
      console.log('Lobby created with code:', lobbyCode);
      setUsername(usernameInput);
      setLobbyCode(lobbyCode);
      localStorage.setItem('username', usernameInput);
      localStorage.setItem('lobbyCode', lobbyCode);
      navigate('/game');
    });
  };

  const joinLobby = () => {
    console.log('Joining lobby:', { username: usernameInput, code: inputLobbyCode });
    if (!usernameInput.trim() || !inputLobbyCode.trim()) {
      toast.warning("Введи ім'я і код лобі", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: false,
        pauseOnHover: false,
        draggable: false,
      });
      return;
    }
    socket.emit('joinLobby', { username: usernameInput, lobbyCode: inputLobbyCode }, (res) => {
      if (res.error) {
        console.error('Error joining lobby:', res.error);
        toast.error(res.error, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: false,
          pauseOnHover: false,
          draggable: false,
        });
        return;
      }
      console.log('Successfully joined lobby');
      setUsername(usernameInput);
      setLobbyCode(inputLobbyCode);
      localStorage.setItem('username', usernameInput);
      localStorage.setItem('lobbyCode', inputLobbyCode);
      navigate('/game');
    });
  };

  return (
    <div className="home-page">
      {/* Background Logo Handled by CSS */}

      <button 
        className="rules-button" 
        onClick={() => setIsRulesOpen(true)}
        title="Правила гри"
      >
        📖
      </button>

      <RulesModal 
        isOpen={isRulesOpen} 
        onClose={() => setIsRulesOpen(false)} 
      />

      <div className="container">
        <h1>AlphaKing 👑</h1>
        <input
          placeholder="Твоє ім'я"
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
    </div>
  );
}

export default Home;
