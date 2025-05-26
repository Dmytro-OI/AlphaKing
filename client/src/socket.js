import { io } from "socket.io-client";

// export const socket = io("https://alphaking.onrender.com", {
//   transports: ["websocket"]
// });

export const socket = io("http://localhost:5000", {
  transports: ["websocket"]
});
