import Dexie from 'dexie';
import * as nip44 from 'nostr-tools/nip44';
import { getPublicKey } from 'nostr-tools/pure';

const SCHEMA = {
  meals:              'id, title, rating, lastEaten, *tags, updatedAt',
  mealPlans:          'id, date, weekKey, updatedAt',
  snacks:             'id, title, updatedAt',
  calendarEvents:     'id, type, date, updatedAt',
  shoppingLists:      'id, name, updatedAt',
  shoppingListItems:  'id, shoppingListId, isCompleted',
  frequentItems:      'id, &itemNameLower',
  settings:           'key',
  syncQueue:          '++id, entityType, entityId, action, createdAt'
};

// Tables excluded from encryption (internal operational data)
const SKIP_TABLES = new Set(['syncQueue']);

let currentDb = null;
let _secretKey = null;
let _conversationKey = null;

function getConvKey() {
  if (!_conversationKey && _secretKey) {
    const pubkey = getPublicKey(_secretKey);
    _conversationKey = nip44.v2.utils.getConversationKey(_secretKey, pubkey);
  }
  return _conversationKey;
}

function encryptRecord(tableName, obj) {
  const convKey = getConvKey();
  if (!convKey) return obj;

  const plain = {};
  const toEncrypt = { ...obj };

  // Primary key stays unencrypted
  if ('id' in obj) {
    plain.id = obj.id;
    delete toEncrypt.id;
  }
  if (tableName === 'settings' && 'key' in obj) {
    plain.key = obj.key;
    delete toEncrypt.key;
  }

  // Foreign keys needed for indexed queries stay unencrypted
  if (tableName === 'shoppingListItems' && 'shoppingListId' in obj) {
    plain.shoppingListId = obj.shoppingListId;
    delete toEncrypt.shoppingListId;
  }

  const plaintext = JSON.stringify(toEncrypt);
  const MAX_CHUNK = 60000; // NIP-44 limit is 65535 bytes; leave headroom

  if (plaintext.length <= MAX_CHUNK) {
    plain._enc = nip44.v2.encrypt(plaintext, convKey);
  } else {
    // Chunk large records (e.g. meals with base64 images)
    const chunks = [];
    for (let i = 0; i < plaintext.length; i += MAX_CHUNK) {
      chunks.push(nip44.v2.encrypt(plaintext.slice(i, i + MAX_CHUNK), convKey));
    }
    plain._chunks = chunks;
  }

  return plain;
}

function decryptRecord(obj) {
  if (!obj || (!obj._enc && !obj._chunks)) return obj; // unencrypted legacy data - passthrough
  const convKey = getConvKey();
  if (!convKey) return obj;

  try {
    let plaintext;
    if (obj._chunks) {
      plaintext = obj._chunks.map(chunk => nip44.v2.decrypt(chunk, convKey)).join('');
    } else {
      plaintext = nip44.v2.decrypt(obj._enc, convKey);
    }
    const decrypted = JSON.parse(plaintext);
    const { _enc, _chunks, ...rest } = obj;
    return { ...rest, ...decrypted };
  } catch (e) {
    console.error('Failed to decrypt record:', e);
    const { _enc, _chunks, ...rest } = obj;
    return rest;
  }
}

function wrapCursor(cursor) {
  if (!cursor) return null;
  return new Proxy(cursor, {
    get(target, prop) {
      if (prop === 'value') {
        return target.value ? decryptRecord(target.value) : target.value;
      }
      if (prop === 'next') {
        return function () {
          return target.next().then(c => wrapCursor(c));
        };
      }
      const val = target[prop];
      return typeof val === 'function' ? val.bind(target) : val;
    }
  });
}

function createEncryptionMiddleware() {
  return {
    stack: 'dbcore',
    name: 'encryption',
    create(downlevelDatabase) {
      return {
        ...downlevelDatabase,
        table(tableName) {
          const downlevelTable = downlevelDatabase.table(tableName);

          if (SKIP_TABLES.has(tableName)) {
            return downlevelTable;
          }

          return {
            ...downlevelTable,

            mutate(req) {
              if (req.type === 'add' || req.type === 'put') {
                return downlevelTable.mutate({
                  ...req,
                  values: req.values.map(val => encryptRecord(tableName, val))
                });
              }
              return downlevelTable.mutate(req);
            },

            get(req) {
              return downlevelTable.get(req).then(val =>
                val ? decryptRecord(val) : val
              );
            },

            getMany(req) {
              return downlevelTable.getMany(req).then(results =>
                results.map(val => val ? decryptRecord(val) : val)
              );
            },

            query(req) {
              return downlevelTable.query(req).then(result => {
                if (!req.values) return result; // keys-only query
                return {
                  ...result,
                  result: result.result.map(val =>
                    typeof val === 'object' && val !== null ? decryptRecord(val) : val
                  )
                };
              });
            },

            openCursor(req) {
              return downlevelTable.openCursor(req).then(cursor => wrapCursor(cursor));
            }
          };
        }
      };
    }
  };
}

// Proxy forwards all property access to the current user's Dexie instance.
// This lets services keep using `import { db }` unchanged.
export const db = new Proxy({}, {
  get(_target, prop) {
    if (prop === 'then') return undefined; // prevent Promise-detection treating db as thenable
    if (!currentDb) throw new Error('Database not initialized. Please sign in.');
    return currentDb[prop];
  }
});

export function openUserDb(pubkey, secretKey) {
  if (currentDb) {
    currentDb.close();
  }

  _secretKey = secretKey || null;
  _conversationKey = null;

  const shortKey = pubkey.slice(0, 16);
  currentDb = new Dexie(`MyMealPlanner_${shortKey}`);

  if (_secretKey) {
    currentDb.use(createEncryptionMiddleware());
  }

  currentDb.version(1).stores(SCHEMA);
  return currentDb;
}

export function closeUserDb() {
  if (currentDb) {
    currentDb.close();
    currentDb = null;
  }
  _secretKey = null;
  _conversationKey = null;
}
