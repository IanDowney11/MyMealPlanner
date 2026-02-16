import { db } from '../lib/db';
import { getPool, getRelays, signEvent, fetchEvents, subscribeToEvents } from '../lib/nostr';
import { encryptObject, decryptObject } from '../lib/encryption';

const NOSTR_KIND = 30078; // NIP-78 application-specific data

// d-tag prefix for our app
const D_TAG_PREFIX = 'mmp';

// Map entity types to d-tag identifiers
function getDTag(entityType, entityId) {
  switch (entityType) {
    case 'meal':       return `${D_TAG_PREFIX}:meal:${entityId}`;
    case 'plan':       return `${D_TAG_PREFIX}:plan:${entityId}`;
    case 'snack':      return `${D_TAG_PREFIX}:snack:${entityId}`;
    case 'event':      return `${D_TAG_PREFIX}:event:${entityId}`;
    case 'shoplist':   return `${D_TAG_PREFIX}:shoplist:${entityId}`;
    case 'freqitems':  return `${D_TAG_PREFIX}:freqitems`;
    case 'settings':   return `${D_TAG_PREFIX}:settings`;
    default:           return `${D_TAG_PREFIX}:${entityType}:${entityId}`;
  }
}

// Debounce timer for auto-flush
let _flushTimer = null;
const FLUSH_DELAY_MS = 2000; // 2 seconds – batches rapid writes

// Queue a sync operation and auto-flush to relays after a short debounce.
export async function queueSync(entityType, entityId, action) {
  try {
    await db.syncQueue.add({
      entityType,
      entityId,
      action,
      createdAt: new Date().toISOString()
    });

    // Schedule auto-flush (debounced so rapid writes get batched)
    if (_flushTimer) clearTimeout(_flushTimer);
    _flushTimer = setTimeout(() => {
      _flushTimer = null;
      processSyncQueue().catch(err =>
        console.warn('Auto-sync failed:', err.message)
      );
    }, FLUSH_DELAY_MS);
  } catch (error) {
    console.error('Error queuing sync:', error);
  }
}

// Process all pending sync queue items
export async function processSyncQueue() {
  const authData = getAuthDataFromStorage();
  if (!authData) return;

  const items = await db.syncQueue.toArray();
  if (items.length === 0) return;

  for (const item of items) {
    try {
      await publishEntityToRelay(item.entityType, item.entityId, item.action, authData);
      await db.syncQueue.delete(item.id);
    } catch (error) {
      console.warn(`Failed to sync ${item.entityType}:${item.entityId}:`, error.message);
      // Leave in queue for retry
    }
  }
}

// Publish a single entity to NOSTR relays
async function publishEntityToRelay(entityType, entityId, action, authData) {
  const { secretKey, pubkey } = authData;

  let content;
  const dTag = getDTag(entityType, entityId);

  if (action === 'delete') {
    // For deletes, publish empty encrypted content to signal deletion
    content = encryptObject({ _deleted: true, _deletedAt: new Date().toISOString() }, secretKey);
  } else {
    // Fetch current entity data from Dexie
    const data = await getEntityData(entityType, entityId);
    if (!data) return; // Entity no longer exists locally

    content = encryptObject(data, secretKey);
  }

  const eventTemplate = {
    kind: NOSTR_KIND,
    created_at: Math.floor(Date.now() / 1000),
    tags: [['d', dTag]],
    content
  };

  const signedEvent = await signEvent(eventTemplate, secretKey);

  const pool = getPool();
  const relays = getRelays();
  const results = await Promise.allSettled(pool.publish(relays, signedEvent));

  // Ensure at least one relay accepted the event
  const successes = results.filter(r => r.status === 'fulfilled');
  if (successes.length === 0) {
    const errors = results.map(r => r.reason?.message || 'rejected').join(', ');
    throw new Error(`All relays rejected event: ${errors}`);
  }
  console.log(`Published ${entityType}:${entityId} to ${successes.length}/${relays.length} relays`);
}

// Fetch entity data from Dexie for publishing
async function getEntityData(entityType, entityId) {
  switch (entityType) {
    case 'meal':
      return await db.meals.get(entityId);
    case 'plan':
      return await db.mealPlans.get(entityId);
    case 'snack':
      return await db.snacks.get(entityId);
    case 'event':
      return await db.calendarEvents.get(entityId);
    case 'shoplist': {
      const list = await db.shoppingLists.get(entityId);
      if (!list) return null;
      const items = await db.shoppingListItems
        .where('shoppingListId').equals(entityId).toArray();
      return { ...list, items };
    }
    case 'freqitems': {
      const items = await db.frequentItems.toArray();
      return { items };
    }
    case 'settings': {
      const settings = await db.settings.toArray();
      return { settings };
    }
    default:
      return null;
  }
}

// Subscribe to relay updates for this pubkey
// callbacks: { onSyncStart, onSyncComplete, onIncomingEvent, onError }
export function subscribeToUpdates(pubkey, secretKey, callbacks = {}) {
  const { onSyncStart, onSyncComplete, onIncomingEvent, onError } = callbacks;

  // Flush any stale queue items (older than 7 days)
  cleanStaleSyncQueue().catch(err =>
    console.warn('Stale queue cleanup failed:', err.message)
  );

  // Process any pending queue items from previous sessions
  processSyncQueue().catch(err =>
    console.warn('Pending queue flush failed:', err.message)
  );

  // First, do a one-time fetch for initial sync
  if (onSyncStart) onSyncStart();
  initialSync(pubkey, secretKey, onIncomingEvent)
    .then(() => {
      if (onSyncComplete) onSyncComplete();
    })
    .catch(err => {
      console.warn('Initial sync failed:', err.message);
      if (onError) onError(err);
    });

  // Then subscribe for live updates
  return subscribeToEvents(
    { kinds: [NOSTR_KIND], authors: [pubkey] },
    async (event) => {
      try {
        await handleIncomingEvent(event, secretKey);
        if (onIncomingEvent) onIncomingEvent(event);
      } catch (err) {
        console.warn('Live event handling failed:', err.message);
        if (onError) onError(err);
      }
    },
    () => console.log('NOSTR sync: caught up with relays')
  );
}

// Clean up stale sync queue items (older than 7 days)
async function cleanStaleSyncQueue() {
  const STALE_DAYS = 7;
  const cutoff = new Date(Date.now() - STALE_DAYS * 24 * 60 * 60 * 1000).toISOString();
  const staleItems = await db.syncQueue.where('createdAt').below(cutoff).toArray();
  if (staleItems.length > 0) {
    await db.syncQueue.bulkDelete(staleItems.map(i => i.id));
    console.log(`Cleaned ${staleItems.length} stale sync queue items`);
  }
}

const LAST_SYNC_KEY = 'mmp_last_sync_timestamp';

// Initial sync: fetch all existing events from relays
async function initialSync(pubkey, secretKey, onIncomingEvent) {
  const lastSync = localStorage.getItem(LAST_SYNC_KEY);
  const filter = {
    kinds: [NOSTR_KIND],
    authors: [pubkey]
  };
  if (lastSync) {
    filter.since = parseInt(lastSync, 10);
  }

  const events = await fetchEvents(filter);

  // Deduplicate by d-tag, keeping newest
  const byDTag = new Map();
  for (const event of events) {
    const dTag = event.tags.find(t => t[0] === 'd')?.[1];
    if (!dTag || !dTag.startsWith(D_TAG_PREFIX)) continue;

    const existing = byDTag.get(dTag);
    if (!existing || event.created_at > existing.created_at) {
      byDTag.set(dTag, event);
    }
  }

  let newestTimestamp = lastSync ? parseInt(lastSync, 10) : 0;

  for (const [dTag, event] of byDTag) {
    try {
      await mergeEventIntoLocal(dTag, event, secretKey);
      if (onIncomingEvent) onIncomingEvent(event);
      if (event.created_at > newestTimestamp) {
        newestTimestamp = event.created_at;
      }
    } catch (err) {
      console.warn('Failed to merge event:', dTag, err.message);
    }
  }

  // Save the newest timestamp for incremental sync next time
  if (newestTimestamp > 0) {
    localStorage.setItem(LAST_SYNC_KEY, String(newestTimestamp));
  }
}

// Handle a live incoming event from relay subscription
async function handleIncomingEvent(event, secretKey) {
  const dTag = event.tags.find(t => t[0] === 'd')?.[1];
  if (!dTag || !dTag.startsWith(D_TAG_PREFIX)) return;

  try {
    await mergeEventIntoLocal(dTag, event, secretKey);
  } catch (err) {
    console.warn('Failed to handle incoming event:', dTag, err.message);
  }
}

// Merge a relay event into the local Dexie database (if newer)
async function mergeEventIntoLocal(dTag, event, secretKey) {
  let data;
  try {
    data = decryptObject(event.content, secretKey);
  } catch (err) {
    console.warn('Failed to decrypt event:', dTag);
    return;
  }

  // Check if this is a deletion marker
  if (data._deleted) {
    await deleteEntityLocally(dTag);
    return;
  }

  const parts = dTag.split(':');
  const type = parts[1]; // meal, plan, snack, event, shoplist, freqitems, settings

  switch (type) {
    case 'meal': {
      const existing = await db.meals.get(data.id);
      if (!existing || (data.updatedAt && data.updatedAt > (existing.updatedAt || ''))) {
        await db.meals.put(data);
      }
      break;
    }
    case 'plan': {
      const existing = await db.mealPlans.get(data.id);
      if (!existing || (data.updatedAt && data.updatedAt > (existing.updatedAt || ''))) {
        await db.mealPlans.put(data);
      }
      break;
    }
    case 'snack': {
      const existing = await db.snacks.get(data.id);
      if (!existing || (data.updatedAt && data.updatedAt > (existing.updatedAt || ''))) {
        await db.snacks.put(data);
      }
      break;
    }
    case 'event': {
      const existing = await db.calendarEvents.get(data.id);
      if (!existing || (data.updatedAt && data.updatedAt > (existing.updatedAt || ''))) {
        await db.calendarEvents.put(data);
      }
      break;
    }
    case 'shoplist': {
      const existing = await db.shoppingLists.get(data.id);
      if (!existing || (data.updatedAt && data.updatedAt > (existing.updatedAt || ''))) {
        // Merge list and its items
        const { items, ...listData } = data;
        await db.shoppingLists.put(listData);
        if (items && Array.isArray(items)) {
          // Clear existing items and replace
          await db.shoppingListItems.where('shoppingListId').equals(data.id).delete();
          await db.shoppingListItems.bulkPut(items);
        }
      }
      break;
    }
    case 'freqitems': {
      if (data.items && Array.isArray(data.items)) {
        await db.frequentItems.clear();
        await db.frequentItems.bulkPut(data.items);
      }
      break;
    }
    case 'settings': {
      if (data.settings && Array.isArray(data.settings)) {
        for (const setting of data.settings) {
          await db.settings.put(setting);
        }
      }
      break;
    }
  }
}

// Delete an entity locally based on its d-tag
async function deleteEntityLocally(dTag) {
  const parts = dTag.split(':');
  const type = parts[1];
  const id = parts[2];

  switch (type) {
    case 'meal':
      if (id) await db.meals.delete(id);
      break;
    case 'plan':
      if (id) await db.mealPlans.delete(id);
      break;
    case 'snack':
      if (id) await db.snacks.delete(id);
      break;
    case 'event':
      if (id) await db.calendarEvents.delete(id);
      break;
    case 'shoplist':
      if (id) {
        await db.shoppingListItems.where('shoppingListId').equals(id).delete();
        await db.shoppingLists.delete(id);
      }
      break;
  }
}

// Helper to get auth data from localStorage (used by sync functions)
function getAuthDataFromStorage() {
  try {
    const stored = localStorage.getItem('nostr_auth');
    if (!stored) return null;
    const parsed = JSON.parse(stored);

    if (parsed.method === 'nsec' && parsed.secretKeyHex) {
      const sk = Uint8Array.from(
        parsed.secretKeyHex.match(/.{1,2}/g).map(byte => parseInt(byte, 16))
      );
      return { secretKey: sk, pubkey: parsed.pubkey };
    }

    // Extension-based auth doesn't have a secret key for encryption
    // Sync requires the secret key for NIP-44 encryption
    if (parsed.method === 'extension') {
      return { secretKey: null, pubkey: parsed.pubkey };
    }

    return null;
  } catch (e) {
    return null;
  }
}
