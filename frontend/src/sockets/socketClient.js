import { io } from 'socket.io-client';

let socket = null;

export function getSocket(token) {
  if (socket) return socket;
  socket = io(import.meta.env.VITE_SOCKET_URL, {
    auth: { token: `Bearer ${token}` },
    autoConnect: true,
    reconnection: true,
  });
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
