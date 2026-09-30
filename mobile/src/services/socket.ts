import { io, Socket } from 'socket.io-client';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';

let socketInstance: Socket | null = null;

export function connectSocket(token: string, serverUrl: string = 'http://10.0.2.2:4000'): Socket {
  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  socketInstance = io(`${serverUrl}/loops`, {
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000
  });

  socketInstance.on('connect', () => {
    console.log('Mobile socket connected to /loops');
  });

  socketInstance.on('connect_error', (err) => {
    console.warn('Socket connection error:', err.message);
  });

  return socketInstance;
}

export function getSocket(): Socket | null {
  return socketInstance;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
