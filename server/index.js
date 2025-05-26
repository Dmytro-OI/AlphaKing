const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getRandomChunk, isValidWord } = require('./game/gameLoop');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
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
      started: false,
      usedWords: [],
      currentTurnIndex: 0,
      currentChunk: ''
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
      lobby.usedWords = [];
      lobby.currentTurnIndex = 0;
      lobby.round = 0;
      nextTurn(lobbyCode);
      io.to(lobbyCode).emit('gameStarted');
    }
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

    currentPlayer.responded = true;
    lobby.usedWords.push(word.toLowerCase());
    lobby.currentTurnIndex = (lobby.currentTurnIndex + 1) % lobby.players.length;
    lobby.round++;
    nextTurn(lobbyCode);
  });

  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    for (const [code, lobby] of Object.entries(lobbies)) {
      const index = lobby.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        lobby.players.splice(index, 1);
        io.to(code).emit('lobbyUpdate', lobby);
        checkGameEnd(code);
      }
    }
  });
});

function nextTurn(lobbyCode) {
  const lobby = lobbies[lobbyCode];
  if (!lobby) return;

  const chunk = getRandomChunk();
  lobby.currentChunk = chunk;

  // Пропустити мертвих гравців
  while (!lobby.players[lobby.currentTurnIndex].alive) {
    lobby.currentTurnIndex = (lobby.currentTurnIndex + 1) % lobby.players.length;
  }

  const currentPlayer = lobby.players[lobby.currentTurnIndex];
  currentPlayer.responded = false;

  io.to(lobbyCode).emit('turn', {
    playerId: currentPlayer.id,
    chunk,
    round: lobby.round
  });

  // Таймер відповіді
  setTimeout(() => {
    if (!currentPlayer.responded) {
      currentPlayer.alive = false;
      io.to(lobbyCode).emit('playerEliminated', currentPlayer.id);
      checkGameEnd(lobbyCode);
    }
  }, 10000); // 10 секунд
}

function checkGameEnd(lobbyCode) {
  const lobby = lobbies[lobbyCode];
  if (!lobby) return;

  const alive = lobby.players.filter(p => p.alive);
  if (alive.length <= 1) {
    io.to(lobbyCode).emit('gameOver', alive[0] || null);
    delete lobbies[lobbyCode];
  } else {
    lobby.currentTurnIndex = (lobby.currentTurnIndex + 1) % lobby.players.length;
    nextTurn(lobbyCode);
  }
}

server.listen(PORT, () => {
  console.log(`🚀 Socket server running on port ${PORT}`);
});
