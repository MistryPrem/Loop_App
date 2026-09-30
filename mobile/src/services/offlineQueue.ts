import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { getSocket } from './socket';
import { SOCKET_EVENTS } from '@loop/shared/socketEvents';
import { CheckInCreatePayload } from '@loop/shared/socketEvents';

const OFFLINE_QUEUE_KEY = '@loop_offline_checkins_queue';
const CACHED_ITEMS_KEY = '@loop_cached_today_items';

export interface QueuedCheckIn {
  id: string; // Local unique ID
  payload: CheckInCreatePayload;
  createdAt: string; // ISO timestamp
}

/**
 * Checks whether device is currently online
 */
export async function isOnline(): Promise<boolean> {
  const state = await NetInfo.fetch();
  return Boolean(state.isConnected && state.isInternetReachable !== false);
}

/**
 * Caches today's items locally for instant offline rendering
 */
export async function cacheTodayItems(items: any[]): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHED_ITEMS_KEY, JSON.stringify(items));
  } catch (err) {
    console.warn('Failed to cache today items:', err);
  }
}

/**
 * Retrieves locally cached items
 */
export async function getCachedTodayItems(): Promise<any[]> {
  try {
    const raw = await AsyncStorage.getItem(CACHED_ITEMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('Failed to retrieve cached items:', err);
    return [];
  }
}

/**
 * Queues a check-in locally when offline
 */
export async function enqueueOfflineCheckIn(payload: CheckInCreatePayload): Promise<QueuedCheckIn> {
  const queue = await getOfflineQueue();
  const queuedItem: QueuedCheckIn = {
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    payload,
    createdAt: new Date().toISOString()
  };

  queue.push(queuedItem);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return queuedItem;
}

/**
 * Retrieves all pending offline check-ins
 */
export async function getOfflineQueue(): Promise<QueuedCheckIn[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Removes a synced item from the offline queue
 */
export async function dequeueOfflineCheckIn(id: string): Promise<void> {
  const queue = await getOfflineQueue();
  const filtered = queue.filter(item => item.id !== id);
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
}

/**
 * Syncs all pending check-ins when reconnected
 */
export async function syncOfflineQueue(apiBaseUrl: string = 'http://10.0.2.2:4000/api/v1', token?: string): Promise<{ synced: number; remaining: number }> {
  const online = await isOnline();
  if (!online) {
    return { synced: 0, remaining: (await getOfflineQueue()).length };
  }

  const queue = await getOfflineQueue();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  let syncedCount = 0;
  const socket = getSocket();

  for (const item of queue) {
    try {
      if (socket && socket.connected) {
        // Real-time socket sync
        await new Promise((resolve, reject) => {
          socket.emit(SOCKET_EVENTS.CLIENT_CHECKIN_CREATE, item.payload, (response: any) => {
            if (response && response.success) {
              resolve(response);
            } else {
              reject(new Error(response?.message || 'Socket sync rejected'));
            }
          });
        });
      } else if (token) {
        // REST fallback sync
        const res = await fetch(`${apiBaseUrl}/checkins`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(item.payload)
        });
        if (!res.ok) throw new Error('REST sync failed');
      }

      await dequeueOfflineCheckIn(item.id);
      syncedCount++;
    } catch (err) {
      console.warn(`Sync failed for item ${item.id}, will retry on next connect:`, err);
    }
  }

  const remaining = (await getOfflineQueue()).length;
  return { synced: syncedCount, remaining };
}
