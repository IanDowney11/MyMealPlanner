import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './NostrAuthContext';
import { subscribeToUpdates, processSyncQueue } from '../services/syncService';

const SyncContext = createContext();

export function useSyncStatus() {
  return useContext(SyncContext);
}

export function SyncProvider({ children }) {
  const { user, secretKey } = useAuth();
  const [syncStatus, setSyncStatus] = useState('idle'); // idle | syncing | synced | error
  const [dataVersion, setDataVersion] = useState(0);
  const subRef = useRef(null);
  const syncedTimerRef = useRef(null);

  const canSync = user?.pubkey && secretKey;

  const startSync = useCallback(() => {
    if (!canSync) return;

    // Clean up previous subscription
    if (subRef.current) {
      subRef.current.close();
      subRef.current = null;
    }

    const sub = subscribeToUpdates(user.pubkey, secretKey, {
      onSyncStart: () => setSyncStatus('syncing'),
      onSyncComplete: () => {
        setSyncStatus('synced');
        // Reset to idle after 3 seconds
        if (syncedTimerRef.current) clearTimeout(syncedTimerRef.current);
        syncedTimerRef.current = setTimeout(() => setSyncStatus('idle'), 3000);
      },
      onIncomingEvent: () => {
        setDataVersion(v => v + 1);
      },
      onError: (err) => {
        console.error('Sync error:', err);
        setSyncStatus('error');
      }
    });

    subRef.current = sub;
  }, [canSync, user?.pubkey, secretKey]);

  // Start sync when user logs in with nsec
  useEffect(() => {
    if (canSync) {
      startSync();
    } else {
      setSyncStatus('idle');
    }

    return () => {
      if (subRef.current) {
        subRef.current.close();
        subRef.current = null;
      }
      if (syncedTimerRef.current) {
        clearTimeout(syncedTimerRef.current);
      }
    };
  }, [canSync, startSync]);

  // Re-sync when browser comes back online
  useEffect(() => {
    const handleOnline = () => {
      if (canSync) {
        console.log('Back online — re-syncing');
        // Flush any pending queue items accumulated while offline
        processSyncQueue().catch(err =>
          console.warn('Online queue flush failed:', err.message)
        );
        startSync();
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [canSync, startSync]);

  const retry = useCallback(() => {
    if (canSync) {
      startSync();
    }
  }, [canSync, startSync]);

  const value = {
    syncStatus,
    dataVersion,
    retry
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}
