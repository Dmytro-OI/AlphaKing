import { io } from 'socket.io-client';
const socket = io('https://alpha-king-server.onrender.com'); // 👉 замінити на реальний URL
export default socket;
