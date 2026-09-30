import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AccessibilityProvider } from './src/context/AccessibilityContext';
import { ConnectivityProvider } from './src/context/ConnectivityContext';
import { OfflineStatusBar } from './src/components/OfflineStatusBar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { setupNotificationChannels } from './src/services/notifications';
import { initializePushNotifications } from './src/services/pushNotifications';
import { connectSocket } from './src/services/socket';

export default function App(): React.JSX.Element {
  useEffect(() => {
    // Setup notification channels and establish real-time socket connection
    setupNotificationChannels().catch(console.warn);
    initializePushNotifications().catch(console.warn);
    // Uses demo JWT token for local testing
    connectSocket('demo_mobile_token_eleanor');
  }, []);

  return (
    <SafeAreaProvider>
      <AccessibilityProvider>
        <ConnectivityProvider>
          <OfflineStatusBar />
          <AppNavigator />
        </ConnectivityProvider>
      </AccessibilityProvider>
    </SafeAreaProvider>
  );
}
