import { jest, describe, test, expect, beforeAll, afterAll } from '@jest/globals';
import http from 'node:http';
import { io as Client } from 'socket.io-client';
import { createApp } from '../src/app.js';
import { initializeSocketServer } from '../src/socket/index.js';
import { signAccessToken } from '../src/utils/jwt.js';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';
import { User } from '../src/models/User.js';
import { Loop } from '../src/models/Loop.js';
import { LoopItem } from '../src/models/LoopItem.js';
import { CheckIn } from '../src/models/CheckIn.js';

describe('Socket.io Real-time Layer (/loops namespace)', () => {
  let server;
  let clientSocket;
  let port;

  const mockUser = {
    _id: '64b0f0000000000000000001',
    name: 'Eleanor Vance',
    email: 'eleanor@example.com',
    preferences: { simpleMode: true }
  };

  const mockLoop = {
    _id: '64b0f0000000000000000010',
    members: [{ userId: mockUser._id, role: 'patient' }]
  };

  const mockItem = {
    _id: '64b0f0000000000000000100',
    title: 'Blood Pressure Med'
  };

  let userFindSpy, loopFindSpy, loopFindByIdSpy, itemFindByIdSpy, checkInCreateSpy;

  beforeAll((done) => {
    // Spies on models
    userFindSpy = jest.spyOn(User, 'findById').mockReturnValue({
      select: jest.fn().mockResolvedValue(mockUser)
    });

    loopFindSpy = jest.spyOn(Loop, 'find').mockReturnValue({
      select: jest.fn().mockResolvedValue([{ _id: mockLoop._id }])
    });

    loopFindByIdSpy = jest.spyOn(Loop, 'findById').mockResolvedValue(mockLoop);
    itemFindByIdSpy = jest.spyOn(LoopItem, 'findById').mockResolvedValue(mockItem);

    checkInCreateSpy = jest.spyOn(CheckIn, 'create').mockImplementation((doc) => Promise.resolve({
      ...doc,
      _id: '64b0f0000000000000000999',
      timestamp: new Date(),
      toJSON: () => ({ ...doc, id: '64b0f0000000000000000999' })
    }));

    const app = createApp();
    server = http.createServer(app);
    initializeSocketServer(server);

    server.listen(0, () => {
      port = server.address().port;
      done();
    });
  });

  afterAll((done) => {
    if (clientSocket && clientSocket.connected) {
      clientSocket.disconnect();
    }
    userFindSpy.mockRestore();
    loopFindSpy.mockRestore();
    loopFindByIdSpy.mockRestore();
    itemFindByIdSpy.mockRestore();
    checkInCreateSpy.mockRestore();
    server.close(done);
  });

  test('Rejects unauthenticated socket handshake', (done) => {
    const unauthSocket = Client(`http://localhost:${port}/loops`, {
      transports: ['websocket'],
      autoConnect: true
    });

    unauthSocket.on('connect_error', (err) => {
      expect(err.message).toBe('Authentication required for real-time access.');
      unauthSocket.close();
      done();
    });
  });

  test('Authenticates with JWT and auto-joins loop rooms with presence update', (done) => {
    const token = signAccessToken({ userId: mockUser._id });

    clientSocket = Client(`http://localhost:${port}/loops`, {
      auth: { token },
      transports: ['websocket']
    });

    clientSocket.on(SOCKET_EVENTS.SERVER_PRESENCE_UPDATE, (data) => {
      expect(data.loopId).toBe(mockLoop._id);
      expect(data.onlineUserIds).toContain(mockUser._id);
      done();
    });
  });

  test('Handles checkin:create and broadcasts checkin:new to room', (done) => {
    const testPayload = {
      loopId: mockLoop._id,
      itemId: mockItem._id,
      status: 'taken'
    };

    clientSocket.once(SOCKET_EVENTS.SERVER_CHECKIN_NEW, (broadcast) => {
      expect(broadcast.loopId).toBe(testPayload.loopId);
      expect(broadcast.status).toBe('taken');
      expect(broadcast.userName).toBe('Eleanor Vance');
      expect(broadcast.itemTitle).toBe('Blood Pressure Med');
      done();
    });

    clientSocket.emit(SOCKET_EVENTS.CLIENT_CHECKIN_CREATE, testPayload, (ack) => {
      expect(ack.success).toBe(true);
      expect(ack.data.checkIn.canUndoUntil).toBeDefined();
    });
  });
});
