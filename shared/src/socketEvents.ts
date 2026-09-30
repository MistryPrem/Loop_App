/**
 * Socket.io Event Contracts for /loops namespace.
 * Single source of truth for real-time payloads.
 */
import { CheckInStatus } from './types/index.js';

export interface CheckInNewPayload {
  id: string;
  loopId: string;
  itemId: string;
  userId: string;
  userName: string;
  itemTitle: string;
  status: CheckInStatus;
  timestamp: string;
  proofAttachment?: {
    type: 'photo' | 'voice_note';
    url: string;
  };
}

export interface NudgeSentPayload {
  id: string;
  loopId: string;
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  itemId?: string;
  itemTitle?: string;
  message: string;
  timestamp: string;
}

export interface MemberMissedPayload {
  loopId: string;
  itemId: string;
  itemTitle: string;
  userId: string;
  userName: string;
  scheduledTime: string;
  deadlineTime: string;
  timestamp: string;
}

export interface LoopUpdatedPayload {
  loopId: string;
  action: 'member_joined' | 'member_left' | 'settings_changed' | 'item_updated';
  updatedBy: string;
  timestamp: string;
}

export interface PresenceUpdatePayload {
  loopId: string;
  onlineUserIds: string[];
}

export interface CheckInCreatePayload {
  loopId: string;
  itemId: string;
  status: CheckInStatus;
  notes?: string;
  proofAttachment?: {
    type: 'photo' | 'voice_note';
    url: string;
  };
}

export interface NudgeSendPayload {
  loopId: string;
  toUserId: string;
  itemId?: string;
  message: string;
}

export const SOCKET_EVENTS = {
  // Client to Server
  CLIENT_CHECKIN_CREATE: 'checkin:create',
  CLIENT_NUDGE_SEND: 'nudge:send',
  CLIENT_LOOP_JOIN: 'loop:join',
  CLIENT_LOOP_LEAVE: 'loop:leave',

  // Server to Client
  SERVER_CHECKIN_NEW: 'checkin:new',
  SERVER_NUDGE_SENT: 'nudge:sent',
  SERVER_MEMBER_MISSED: 'member:missed',
  SERVER_LOOP_UPDATED: 'loop:updated',
  SERVER_PRESENCE_UPDATE: 'presence:update'
} as const;
