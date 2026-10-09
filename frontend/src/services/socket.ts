import { io, Socket } from 'socket.io-client';

const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = rawApiUrl.replace(/\/api\/?$/, '');

let socket: Socket | null = null;

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    socket.on('connect', () => {
      console.log(`⚡ Connected to EzzyGo Socket Server [ID: ${socket?.id}] at ${SOCKET_URL}`);
    });

    socket.on('connect_error', (err) => {
      console.warn('⚠️ Socket connection warning:', err.message);
    });

    socket.on('disconnect', (reason) => {
      console.log('🔌 Disconnected from Socket Server:', reason);
    });
  }
  return socket;
};
