import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import notifee, { AndroidImportance } from '@notifee/react-native';

const NUDGE_CHANNEL_ID = 'loop_nudges_channel';
const MISSED_CHANNEL_ID = 'loop_missed_channel';

/**
 * Initializes FCM push listeners, registers token with backend, and displays local heads-up alerts
 */
export async function initializePushNotifications(apiBaseUrl: string = 'http://10.0.2.2:4000/api/v1', token?: string): Promise<void> {
  try {
    // 1. Request notification permissions (Android 13+ & iOS)
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (!enabled) {
      console.log('Push notification permission denied by user');
      return;
    }

    // 2. Setup Android high-importance notification channels
    await notifee.createChannel({
      id: NUDGE_CHANNEL_ID,
      name: 'Loop Nudges & Gentle Reminders',
      importance: AndroidImportance.HIGH,
      sound: 'default'
    });

    await notifee.createChannel({
      id: MISSED_CHANNEL_ID,
      name: 'Missed Medicine & Overdue Alerts',
      importance: AndroidImportance.HIGH,
      sound: 'default'
    });

    // 3. Obtain FCM device token
    const fcmToken = await messaging().getToken();
    console.log('FCM Device Token retrieved:', fcmToken ? `${fcmToken.slice(0, 10)}...` : 'none');

    // 4. Register token with backend if authenticated
    if (token && fcmToken) {
      await fetch(`${apiBaseUrl}/users/push-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ token: fcmToken, platform: 'mobile' })
      }).catch(err => console.warn('Could not register FCM token with server:', err));
    }

    // 5. Handle foreground push notifications
    messaging().onMessage(async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
      console.log('Foreground push notification received:', remoteMessage);

      const title = remoteMessage.notification?.title || remoteMessage.data?.title || 'Loop Reminder';
      const body = remoteMessage.notification?.body || remoteMessage.data?.message || 'Check your loop for updates';
      const channelId = remoteMessage.data?.type === 'missed' ? MISSED_CHANNEL_ID : NUDGE_CHANNEL_ID;

      await notifee.displayNotification({
        title,
        body,
        android: {
          channelId,
          pressAction: { id: 'default' }
        }
      });
    });

    // 6. Handle token refresh
    messaging().onTokenRefresh(async (newToken) => {
      if (token) {
        await fetch(`${apiBaseUrl}/users/push-token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ token: newToken, platform: 'mobile' })
        }).catch(console.warn);
      }
    });
  } catch (err) {
    console.warn('Push notification initialization warning:', err);
  }
}

/**
 * Background notification handler for when app is killed or in background
 */
export async function setupBackgroundNotificationHandler(): Promise<void> {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log('Background FCM message handled:', remoteMessage);
  });
}
