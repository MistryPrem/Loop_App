import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineQueue, getOfflineQueue } from '../services/offlineQueue';

interface ConnectivityContextType {
  isConnected: boolean;
  pendingCount: number;
  syncNow: () => Promise<void>;
  statusText: string;
}

const ConnectivityContext = createContext<ConnectivityContextType | null>(null);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [pendingCount, setPendingCount] = useState<number>(0);

  const refreshPending = async () => {
    const queue = await getOfflineQueue();
    setPendingCount(queue.length);
  };

  useEffect(() => {
    refreshPending();

    const unsubscribe = NetInfo.addEventListener(state => {
      const online = Boolean(state.isConnected && state.isInternetReachable !== false);
      setIsConnected(online);

      if (online) {
        // Trigger auto-sync on reconnect
        syncOfflineQueue()
          .then(() => refreshPending())
          .catch(console.warn);
      }
    });

    return () => unsubscribe();
  }, []);

  const syncNow = async () => {
    await syncOfflineQueue();
    await refreshPending();
  };

  const statusText = !isConnected
    ? 'Offline — your check-in is saved and will send automatically when connected.'
    : pendingCount > 0
    ? `Syncing ${pendingCount} pending item${pendingCount > 1 ? 's' : ''}...`
    : 'Online';

  return (
    <ConnectivityContext.Provider
      value={{
        isConnected,
        pendingCount,
        syncNow,
        statusText
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = (): ConnectivityContextType => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
