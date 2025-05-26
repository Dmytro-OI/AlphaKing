// server/index.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getRandomChunk, isValidWord } = require('./game/gameLoop');

const app = express();
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = 5000;

// =====================
// Game State Handling
// =====================
let lobbies = {};

function generateLobbyCode() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
  console.log(`🔌 New connection: ${socket.id}`);

  socket.on('createLobby', ({ username }, cb) => {
    const lobbyCode = generateLobbyCode();
    lobbies[lobbyCode] = {
      players: [{ id: socket.id, username, alive: true }],
      host: socket.id,
      round: 0,
      started: false
    };
    socket.join(lobbyCode);
    cb({ lobbyCode });
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });

  socket.on('joinLobby', ({ username, lobbyCode }, cb) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return cb({ error: 'Лобі не знайдено.' });
    if (lobby.started) return cb({ error: 'Гра вже почалась.' });

    lobby.players.push({ id: socket.id, username, alive: true });
    socket.join(lobbyCode);
    io.to(lobbyCode).emit('lobbyUpdate', lobby);
    cb({ success: true });
  });

  socket.on('startGame', (lobbyCode) => {
    const lobby = lobbies[lobbyCode];
    if (lobby) {
      lobby.started = true;
      io.to(lobbyCode).emit('gameStarted');
      // TODO: Додати gameLoop
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    for (const [code, lobby] of Object.entries(lobbies)) {
      const playerIndex = lobby.players.findIndex(p => p.id === socket.id);
      if (playerIndex !== -1) {
        lobby.players.splice(playerIndex, 1);
        io.to(code).emit('lobbyUpdate', lobby);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
});
socket.on('submitWord', ({ lobbyCode, word }) => {
  const lobby = lobbies[lobbyCode];
  if (!lobby || !lobby.started) return;

  const currentPlayer = lobby.players[lobby.currentTurnIndex];
  const chunk = lobby.currentChunk;

  if (socket.id !== currentPlayer.id) return;

  if (!isValidWord(chunk, word, lobby.usedWords)) {
    socket.emit('invalidWord');
    return;
  }

  lobby.usedWords.push(word.toLowerCase());
  lobby.currentTurnIndex = (lobby.currentTurnIndex + 1) % lobby.players.length;
  lobby.round++;
  nextTurn(lobbyCode);
});

function nextTurn(lobbyCode) {
  const lobby = lobbies[lobbyCode];
  if (!lobby) return;

  const chunk = getRandomChunk();
  lobby.currentChunk = chunk;

  const nextPlayer = lobby.players[lobby.currentTurnIndex];
  io.to(lobbyCode).emit('turn', {
    playerId: nextPlayer.id,
    chunk,
    round: lobby.round
  });

  setTimeout(() => {
    const activePlayer = lobby.players[lobby.currentTurnIndex];
    if (activePlayer && !activePlayer.responded) {
      activePlayer.alive = false;
      lobby.currentTurnIndex = (lobby.currentTurnIndex + 1) % lobby.players.length;
      io.to(lobbyCode).emit('playerEliminated', activePlayer.id);
      checkGameEnd(lobbyCode);
    }
  }, 10000);
}

function checkGameEnd(lobbyCode) {
  const lobby = lobbies[lobbyCode];
  const alivePlayers = lobby.players.filter(p => p.alive);
  if (alivePlayers.length === 1) {
    io.to(lobbyCode).emit('gameOver', alivePlayers[0]);
    delete lobbies[lobbyCode];
  } else {
    nextTurn(lobbyCode);
  }
}