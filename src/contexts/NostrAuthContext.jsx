import React, { createContext, useContext, useEffect, useState } from 'react';
import { generateSecretKey, getPublicKey } from 'nostr-tools/pure';
import { npubFromHex, nsecFromHex, hexFromNsec, truncateNpub } from '../lib/nostr';
import { openUserDb, closeUserDb } from '../lib/db';

const NostrAuthContext = createContext();

const STORAGE_KEY = 'nostr_auth';

export function useAuth() {
  return useContext(NostrAuthContext);
}

function loadStoredAuth() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.pubkey) return parsed;
    }
  } catch (e) {
    // ignore
  }
  return null;
}

function saveAuth(authData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(authData));
}

function clearAuth() {
  localStorage.removeItem(STORAGE_KEY);
}

export function NostrAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [secretKey, setSecretKey] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    restoreSession();
  }, []);

  const restoreSession = async () => {
    try {
      const stored = loadStoredAuth();
      if (!stored) {
        setLoading(false);
        return;
      }

      if (stored.method === 'extension') {
        // Re-verify NIP-07 extension is available
        if (window.nostr) {
          try {
            const pubkey = await window.nostr.getPublicKey();
            const npub = npubFromHex(pubkey);
            openUserDb(pubkey, null);
            setUser({
              pubkey,
              npub,
              displayName: stored.displayName || truncateNpub(npub)
            });
          } catch (e) {
            console.error('Failed to restore NIP-07 session:', e);
            clearAuth();
          }
        } else {
          // Extension not available, clear
          clearAuth();
        }
      } else if (stored.method === 'nsec' && stored.secretKeyHex) {
        const sk = Uint8Array.from(
          stored.secretKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
        );
        const pubkey = getPublicKey(sk);
        const npub = npubFromHex(pubkey);
        openUserDb(pubkey, sk);
        setSecretKey(sk);
        setUser({
          pubkey,
          npub,
          displayName: stored.displayName || truncateNpub(npub)
        });
      }
    } catch (e) {
      console.error('Error restoring session:', e);
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const loginWithExtension = async () => {
    if (!window.nostr) {
      throw new Error('No NIP-07 extension found. Install nos2x, Alby, or similar.');
    }

    const pubkey = await window.nostr.getPublicKey();
    const npub = npubFromHex(pubkey);

    const userData = {
      pubkey,
      npub,
      displayName: truncateNpub(npub)
    };

    openUserDb(pubkey, null); // No secret key for extension - no local encryption
    setUser(userData);
    setSecretKey(null); // Extension handles signing
    saveAuth({ method: 'extension', pubkey, displayName: userData.displayName });

    return userData;
  };

  const loginWithNsec = async (nsecInput) => {
    let sk;
    if (nsecInput.startsWith('nsec1')) {
      // hexFromNsec returns Uint8Array from nip19.decode
      sk = hexFromNsec(nsecInput);
    } else {
      throw new Error('Invalid nsec format. Must start with nsec1');
    }

    const pubkey = getPublicKey(sk);
    const npub = npubFromHex(pubkey);

    const userData = {
      pubkey,
      npub,
      displayName: truncateNpub(npub)
    };

    openUserDb(pubkey, sk);
    setUser(userData);
    setSecretKey(sk);

    // Store hex representation of secret key
    const secretKeyHex = Array.from(sk).map(b => b.toString(16).padStart(2, '0')).join('');
    saveAuth({ method: 'nsec', pubkey, secretKeyHex, displayName: userData.displayName });

    return userData;
  };

  const generateNewKeys = async () => {
    const sk = generateSecretKey();
    const pubkey = getPublicKey(sk);
    const npub = npubFromHex(pubkey);
    const nsec = nsecFromHex(sk);

    // Return keys without logging in - caller should show nsec to user first,
    // then call confirmGeneratedKeys to complete login
    return { pubkey, npub, nsec, _sk: sk, displayName: truncateNpub(npub) };
  };

  const confirmGeneratedKeys = (keys) => {
    const { pubkey, npub, displayName, _sk: sk } = keys;

    openUserDb(pubkey, sk);
    const userData = { pubkey, npub, displayName };
    setUser(userData);
    setSecretKey(sk);

    const secretKeyHex = Array.from(sk).map(b => b.toString(16).padStart(2, '0')).join('');
    saveAuth({ method: 'nsec', pubkey, secretKeyHex, displayName });

    return userData;
  };

  const signOut = async () => {
    closeUserDb();
    setUser(null);
    setSecretKey(null);
    clearAuth();
  };

  const value = {
    user,
    pubkey: user?.pubkey || null,
    secretKey,
    loginWithExtension,
    loginWithNsec,
    generateNewKeys,
    confirmGeneratedKeys,
    signOut,
    loading
  };

  return (
    <NostrAuthContext.Provider value={value}>
      {!loading && children}
    </NostrAuthContext.Provider>
  );
}
