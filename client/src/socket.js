import { io } from "socket.io-client";

export const socket = io("https://alphaking.onrender.com", {
  transports: ["websocket"]
});
