import * as nip44 from 'nostr-tools/nip44';
import { getPublicKey } from 'nostr-tools/pure';

const MAX_CHUNK = 60000; // NIP-44 limit is 65535 bytes; leave headroom

function getConvKey(secretKey) {
  const pubkey = getPublicKey(secretKey);
  return nip44.v2.utils.getConversationKey(secretKey, pubkey);
}

// Encrypt data to self (secretKey -> own pubkey)
export function encryptToSelf(plaintext, secretKey) {
  const conversationKey = getConvKey(secretKey);

  if (plaintext.length <= MAX_CHUNK) {
    return nip44.v2.encrypt(plaintext, conversationKey);
  }

  // Chunk large plaintext
  const chunks = [];
  for (let i = 0; i < plaintext.length; i += MAX_CHUNK) {
    chunks.push(nip44.v2.encrypt(plaintext.slice(i, i + MAX_CHUNK), conversationKey));
  }
  return JSON.stringify({ _chunks: chunks });
}

// Decrypt data from self
export function decryptFromSelf(ciphertext, secretKey) {
  const conversationKey = getConvKey(secretKey);

  // Check for chunked format
  if (ciphertext.startsWith('{"_chunks":')) {
    try {
      const { _chunks } = JSON.parse(ciphertext);
      return _chunks.map(chunk => nip44.v2.decrypt(chunk, conversationKey)).join('');
    } catch (e) {
      // Fall through to single decrypt
    }
  }

  return nip44.v2.decrypt(ciphertext, conversationKey);
}

// Encrypt a JSON-serializable object
export function encryptObject(obj, secretKey) {
  const plaintext = JSON.stringify(obj);
  return encryptToSelf(plaintext, secretKey);
}

// Decrypt back to a JSON object
export function decryptObject(ciphertext, secretKey) {
  const plaintext = decryptFromSelf(ciphertext, secretKey);
  return JSON.parse(plaintext);
}
