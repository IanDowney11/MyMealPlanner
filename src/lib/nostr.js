import { SimplePool, finalizeEvent, nip19 } from 'nostr-tools';

const DEFAULT_RELAYS = [
  'wss://relay.damus.io',
  'wss://nos.lol',
  'wss://relay.primal.net',
  'wss://purplepag.es'
];

const RELAY_STORAGE_KEY = 'nostr_relays';

let pool = null;

export function getPool() {
  if (!pool) {
    pool = new SimplePool();
  }
  return pool;
}

export function getRelays() {
  try {
    const stored = localStorage.getItem(RELAY_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Filter out known problematic relays
        const filtered = parsed.filter(r =>
          !r.includes('relay.nostr.band') && !r.includes('relay.snort.social')
        );
        return filtered.length > 0 ? filtered : DEFAULT_RELAYS;
      }
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_RELAYS;
}

export function setRelays(relays) {
  localStorage.setItem(RELAY_STORAGE_KEY, JSON.stringify(relays));
}

export function addRelay(url) {
  const relays = getRelays();
  if (!relays.includes(url)) {
    relays.push(url);
    setRelays(relays);
  }
  return relays;
}

export function removeRelay(url) {
  const relays = getRelays().filter(r => r !== url);
  setRelays(relays);
  return relays;
}

export function npubFromHex(hexPubkey) {
  return nip19.npubEncode(hexPubkey);
}

export function nsecFromHex(hexSeckey) {
  return nip19.nsecEncode(hexSeckey);
}

export function hexFromNpub(npub) {
  const { type, data } = nip19.decode(npub);
  if (type !== 'npub') throw new Error('Invalid npub');
  return data;
}

export function hexFromNsec(nsec) {
  const { type, data } = nip19.decode(nsec);
  if (type !== 'nsec') throw new Error('Invalid nsec');
  return data;
}

export function truncateNpub(npub) {
  if (!npub) return '';
  return npub.slice(0, 12) + '...' + npub.slice(-6);
}

export async function signEvent(eventTemplate, secretKey) {
  // If using NIP-07 extension
  if (!secretKey && window.nostr) {
    return await window.nostr.signEvent(eventTemplate);
  }

  if (!secretKey) {
    throw new Error('No secret key available and no NIP-07 extension found');
  }

  return finalizeEvent(eventTemplate, secretKey);
}

export async function testRelayConnectivity(relayUrl, timeoutMs = 5000) {
  return new Promise((resolve) => {
    let ws;
    const timer = setTimeout(() => {
      if (ws) ws.close();
      resolve({ url: relayUrl, ok: false, error: 'Timeout', latencyMs: null });
    }, timeoutMs);

    const start = Date.now();
    try {
      ws = new WebSocket(relayUrl);
      ws.onopen = () => {
        const latencyMs = Date.now() - start;
        clearTimeout(timer);
        ws.close();
        resolve({ url: relayUrl, ok: true, error: null, latencyMs });
      };
      ws.onerror = () => {
        clearTimeout(timer);
        ws.close();
        resolve({ url: relayUrl, ok: false, error: 'Connection failed', latencyMs: null });
      };
    } catch (err) {
      clearTimeout(timer);
      resolve({ url: relayUrl, ok: false, error: err.message, latencyMs: null });
    }
  });
}

export async function testAllRelays(timeoutMs = 5000) {
  const relays = getRelays();
  return Promise.all(relays.map(r => testRelayConnectivity(r, timeoutMs)));
}

export async function publishEvent(event) {
  const p = getPool();
  const relays = getRelays();
  const results = await Promise.allSettled(
    p.publish(relays, event)
  );
  return results;
}

export async function fetchEvents(filter, opts = {}) {
  const p = getPool();
  const relays = getRelays();
  return await p.querySync(relays, filter, opts);
}

export function subscribeToEvents(filter, onEvent, onEose) {
  const p = getPool();
  const relays = getRelays();
  const sub = p.subscribeMany(relays, [filter], {
    onevent: onEvent,
    oneose: onEose
  });
  return sub;
}
