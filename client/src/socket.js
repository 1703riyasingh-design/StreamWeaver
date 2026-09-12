import { io } from 'socket.io-client';

const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

const socket = io(SOCKET_URL, {
  autoConnect: true,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  transports: ['websocket', 'polling'],
});

socket.on('connect', () => {
  if (import.meta.env.DEV) {
    console.log('Socket connected:', socket.id);
  }
});

socket.on('disconnect', () => {
  if (import.meta.env.DEV) {
    console.log('Socket disconnected');
  }
});

socket.on('connect_error', (error) => {
  if (import.meta.env.DEV) {
    console.error('Socket connection error:', error.message);
  }
});

export default socket;