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
  const [players, setPlayers] = useState([]);
  const [winner, setWinner] = useState(null);
  const [eliminatedPlayers, setEliminatedPlayers] = useState([]); // eliminated players list

  return (
    <GameContext.Provider value={{
      username,
      lobbyCode,
      chunk,
      round,
      currentPlayerId,
      isGameStarted,
      hp,
      players,
      winner,
      eliminatedPlayers,
      setUsername,
      setLobbyCode,
      setChunk,
      setRound,
      setCurrentPlayerId,
      setIsGameStarted,
      setHp,
      setPlayers,
      setWinner,
      setEliminatedPlayers,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
