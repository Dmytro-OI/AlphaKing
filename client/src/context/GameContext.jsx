import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [lobbyCode, setLobbyCode] = useState(localStorage.getItem('lobbyCode') || '');
  const [chunk, setChunk] = useState('');
  const [round, setRound] = useState(0);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [hp, setHp] = useState(3);

  return (
    <GameContext.Provider value={{
      username,
      lobbyCode,
      chunk,
      round,
      currentPlayerId,
      isGameStarted,
      hp,
      setUsername,
      setLobbyCode,
      setChunk,
      setRound,
      setCurrentPlayerId,
      setIsGameStarted,
      setHp
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
