const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { getRandomChunk, isValidWord, isValidWord2 } = require('./game/gameLoop');
const generateLobbyCode = require('./utils/generateLobbyCode');

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
let turnTimers = {};

function getNextAliveIndex(players, startIdx) {
  for (let i = 0; i < players.length; i++) {
    const idx = (startIdx + i) % players.length;
    if (players[idx].alive) return idx;
  }
  return -1;
}

io.on('connection', (socket) => {
  console.log(`🔌 Підключено: ${socket.id}`);

  socket.on('createLobby', ({ username }, cb) => {
    const lobbyCode = generateLobbyCode();
    lobbies[lobbyCode] = {
      code: lobbyCode,
      players: [{ id: socket.id, username, hp: 3, alive: true }],
      host: socket.id,
      round: 0,
      started: false,
      usedWords: [],
      currentTurnIndex: 0,
      currentChunk: '',
      turnId: 0,
      turnStart: null
    };
    socket.join(lobbyCode);
    cb({ lobbyCode });
    io.to(lobbyCode).emit('lobbyUpdate', lobbies[lobbyCode]);
  });

  socket.on('joinLobby', ({ username, lobbyCode }, cb) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby) return cb({ error: 'Лобі не знайдено.' });
    if (lobby.started) return cb({ error: 'Гра вже почалась.' });

    lobby.players.push({ id: socket.id, username, hp: 3, alive: true });
    socket.join(lobbyCode);
    cb({ success: true });
    io.to(lobbyCode).emit('lobbyUpdate', lobby);
  });

socket.on('startGame', (lobbyCode) => {
  const lobby = lobbies[lobbyCode];
  if (lobby) {
    if (lobby.players.length < 2) {
      socket.emit('error', 'Потрібно мінімум 2 гравці для початку гри');
      return;
    }
    // Явне скидання стану при старті
    lobby.started = true;
    lobby.usedWords = [];
    lobby.round = 1;
    lobby.turnId = 0;
    lobby.currentTurnIndex = getNextAliveIndex(lobby.players, 0);

    io.to(lobbyCode).emit('gameStarted');
    nextTurn(lobbyCode);
  }
});

  socket.on('submitWord', async ({ lobbyCode, word }) => {
    const lobby = lobbies[lobbyCode];
    if (!lobby || !lobby.started) return;

    const currentPlayer = lobby.players[lobby.currentTurnIndex];
    const chunk = lobby.currentChunk;

    if (socket.id !== currentPlayer.id) return;

    console.log(`[${lobbyCode}] ${currentPlayer.username} ➜ ${word}`);

    if (!(await isValidWord(chunk, word, lobby.usedWords))) {
      socket.emit('invalidWord');
      return;
    }

    socket.emit('validWord');
    
    currentPlayer.responded = true;
    lobby.usedWords.push(word.toLowerCase());
    lobby.round++;
    lobby.currentTurnIndex = getNextAliveIndex(lobby.players, lobby.currentTurnIndex + 1);
    nextTurn(lobbyCode);
  });

  socket.on('leaveLobby', () => {
    for (const [code, lobby] of Object.entries(lobbies)) {
      const index = lobby.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        socket.leave(code);
        lobby.players.splice(index, 1);
        
        if (lobby.players.length === 0) {
          delete lobbies[code];
        } else if (socket.id === lobby.host) {
          lobby.host = lobby.players[0].id;
        }
        
        io.to(code).emit('lobbyUpdate', lobby);
        break;
      }
    }
  });

  socket.on('returnToLobby', () => {
    for (const [code, lobby] of Object.entries(lobbies)) {
      if (lobby.players.find(p => p.id === socket.id)) {
        socket.emit('lobbyUpdate', lobby);
        break;
      }
    }
  });

  socket.on('disconnect', () => {
    console.log(`❌ Відключено: ${socket.id}`);
    for (const [code, lobby] of Object.entries(lobbies)) {
      const index = lobby.players.findIndex(p => p.id === socket.id);
      if (index !== -1) {
        lobby.players.splice(index, 1);
        if (index < lobby.currentTurnIndex) {
          lobby.currentTurnIndex--;
        }
        if (lobby.players.length > 0 && lobby.currentTurnIndex >= lobby.players.length) {
          lobby.currentTurnIndex = getNextAliveIndex(lobby.players, 0);
        }
        io.to(code).emit('lobbyUpdate', lobby);
        checkGameEnd(code);
      }
    }
  });
});

function nextTurn(lobbyCode) {
  const lobby = lobbies[lobbyCode];
  if (!lobby) return;

  lobby.currentTurnIndex = getNextAliveIndex(lobby.players, lobby.currentTurnIndex);
  
  if (lobby.currentTurnIndex === -1) {
    
    lobby.started = false;
    lobby.usedWords = [];
    lobby.currentTurnIndex = 0;
    lobby.round = 0;
    lobby.turnId = 0;
    lobby.currentChunk = '';
    lobby.turnStart = null;

    lobby.players.forEach(player => {
      player.hp = 3;
      player.alive = true;
      player.responded = false;
    });

    if (turnTimers[lobbyCode]) clearTimeout(turnTimers[lobbyCode]);
    delete turnTimers[lobbyCode];


    io.to(lobbyCode).emit('lobbyUpdate', lobby);
    io.to(lobbyCode).emit('gameOver', null); 

    return;
  }

  const chunk = getRandomChunk();
  lobby.currentChunk = chunk;
  lobby.turnId = (lobby.turnId || 0) + 1;
  lobby.turnStart = Date.now();

  const currentPlayer = lobby.players[lobby.currentTurnIndex];
  currentPlayer.responded = false;

  io.to(lobbyCode).emit('turn', {
    playerId: currentPlayer.id,
    chunk,
    round: lobby.round,
    turnId: lobby.turnId,
    turnStart: lobby.turnStart
  });
  io.to(lobbyCode).emit('lobbyUpdate', lobby);

  if (turnTimers[lobbyCode]) clearTimeout(turnTimers[lobbyCode]);
  const thisTurnId = lobby.turnId;
  turnTimers[lobbyCode] = setTimeout(() => {
    if (!lobbies[lobbyCode] || lobbies[lobbyCode].turnId !== thisTurnId) return;
    const stillAlive = lobby.players[lobby.currentTurnIndex];
    if (stillAlive && !stillAlive.responded && stillAlive.alive) {
      stillAlive.hp -= 1;
      console.log(`[${lobbyCode}] ${stillAlive.username} пропустив хід — HP: ${stillAlive.hp}`);

      if (stillAlive.hp <= 0) {
        stillAlive.alive = false;
        io.to(lobbyCode).emit('playerEliminated', stillAlive.id);
      } else {
        io.to(lobbyCode).emit('playerDamaged', {
          id: stillAlive.id,
          hp: stillAlive.hp
        });
      }

      checkGameEnd(lobbyCode);
    }
  }, 10000);
}

function checkGameEnd(lobbyCode) {
  const lobby = lobbies[lobbyCode];
  if (!lobby) return;

  const alive = lobby.players.filter(p => p.alive);
  if (alive.length === 1) {
    io.to(lobbyCode).emit('gameOver', alive[0]);
    
    lobby.started = false;
    lobby.usedWords = [];
    lobby.currentTurnIndex = 0;
    lobby.round = 0;
    lobby.turnId = 0;
    lobby.currentChunk = '';
    lobby.turnStart = null;
    
    lobby.players.forEach(player => {
      player.hp = 3;
      player.alive = true;
      player.responded = false;
    });

    if (turnTimers[lobbyCode]) clearTimeout(turnTimers[lobbyCode]);
    delete turnTimers[lobbyCode];
    
    io.to(lobbyCode).emit('lobbyUpdate', lobby);
  } else {
    lobby.currentTurnIndex = getNextAliveIndex(lobby.players, lobby.currentTurnIndex + 1);
    nextTurn(lobbyCode);
  }
}

server.listen(PORT, () => {
  console.log(`🚀 AlphaKing сервер запущено на порті ${PORT}`);
});
