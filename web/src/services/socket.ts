import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getWebSocket(token?: string): Socket {
  if (!socket) {
    const wsUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
    socket = io(`${wsUrl}/loops`, {
      auth: { token: token || localStorage.getItem('loop_token') || 'demo_token' },
      transports: ['websocket'],
      reconnection: true
    });

    socket.on('connect', () => {
      console.log('Web socket connected to /loops');
    });

    socket.on('connect_error', (err) => {
      console.warn('Socket error on web:', err.message);
    });
  }
  return socket;
}
