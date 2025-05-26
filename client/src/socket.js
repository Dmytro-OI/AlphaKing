import { io } from "socket.io-client";
const socket = io("https://alphaking.onrender.com"); // ← ось сюди
export default socket;
