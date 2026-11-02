// frontend/src/services/socket.js
import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false, // Lo conectamos manualmente tras verificar sesión
});