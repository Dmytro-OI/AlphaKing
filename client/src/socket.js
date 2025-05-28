import { io } from "socket.io-client";

export const socket = io("https://alphaking.onrender.com", {
  transports: ["websocket"]
});

// const socket = io("http://localhost:5000", {
//   transports: ["websocket"]
// });

socket.on('connect', () => {
  console.log('Socket connected with ID:', socket.id);
});

socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

export { socket };
