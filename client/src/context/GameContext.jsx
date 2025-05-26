import React, { createContext, useContext, useState } from 'react';

const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [lobbyCode, setLobbyCode] = useState(localStorage.getItem('lobbyCode') || '');
  const [chunk, setChunk] = useState('');
  const [round, setRound] = useState(0);
  const [currentPlayerId, setCurrentPlayerId] = useState('');
  const [isGameStarted, setIsGameStarted] = useState(false);

  return (
    <GameContext.Provider value={{
      username,
      lobbyCode,
      chunk,
      round,
      currentPlayerId,
      isGameStarted,
      setUsername,
      setLobbyCode,
      setChunk,
      setRound,
      setCurrentPlayerId,
      setIsGameStarted
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => useContext(GameContext);
