/**
 * Client-side (browser-only) encryption helpers for zero-knowledge sharing.
 *
 * The `key` returned by `encryptForSharing` is the only thing that can decrypt
 * the payload. It is created in the browser and must never be sent to the
 * server: the server only ever receives and stores the cipher text below.
 */

const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 256;
const IV_LENGTH = 12;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export type EncryptedPayload = {
  /** Base64url of `iv || ciphertext+tag` — safe to send to the server. */
  cipher: string;
  /** Base64url of the raw AES-256 key — never leaves the browser. */
  key: string;
};

/**
 * Generates a random AES-256-GCM key in the browser, encrypts `plaintext`
 * with it, and returns the cipher text plus the key that decrypts it.
 */
export async function encryptForSharing(
  plaintext: string,
): Promise<EncryptedPayload> {
  const key = await crypto.subtle.generateKey(
    { name: ALGORITHM, length: KEY_LENGTH },
    true,
    ['encrypt', 'decrypt'],
  );

  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const plaintextBytes = new TextEncoder().encode(plaintext);
  const cipherBuffer = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv },
    key,
    plaintextBytes,
  );

  const cipherBytes = new Uint8Array(cipherBuffer);
  const payload = new Uint8Array(iv.length + cipherBytes.length);
  payload.set(iv, 0);
  payload.set(cipherBytes, iv.length);

  const rawKey = new Uint8Array(await crypto.subtle.exportKey('raw', key));

  return {
    cipher: bytesToBase64Url(payload),
    key: bytesToBase64Url(rawKey),
  };
}

/**
 * Decrypts a payload produced by `encryptForSharing` using the key from the
 * share link. Throws if the key is wrong or the payload was tampered with.
 */
export async function decryptFromSharing(
  cipher: string,
  keyString: string,
): Promise<string> {
  const payload = base64UrlToBytes(cipher);

  if (payload.length <= IV_LENGTH) {
    throw new Error('Invalid or corrupted payload.');
  }

  const rawKey = base64UrlToBytes(keyString);
  if (rawKey.length !== KEY_LENGTH / 8) {
    throw new Error('Invalid decryption key.');
  }

  const iv = payload.slice(0, IV_LENGTH);
  const cipherBytes = payload.slice(IV_LENGTH);

  const key = await crypto.subtle.importKey(
    'raw',
    rawKey,
    { name: ALGORITHM },
    false,
    ['decrypt'],
  );

  const plainBuffer = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv },
    key,
    cipherBytes,
  );

  return new TextDecoder().decode(plainBuffer);
}
