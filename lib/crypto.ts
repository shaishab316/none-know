import {
  randomBytes,
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv,
} from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const KEY_LEN = 32;
const IV_LEN = 12;
const SALT_LEN = 16;
const TAG_LEN = 16;
const PBKDF2_ITERATIONS = 210_000;
const PBKDF2_DIGEST = 'sha256';

function deriveKey(secret: string | Buffer, salt: Buffer): Buffer {
  return pbkdf2Sync(secret, salt, PBKDF2_ITERATIONS, KEY_LEN, PBKDF2_DIGEST);
}

export function encrypt(
  data: string | Buffer,
  secret: string | Buffer,
): Buffer {
  if (!secret || secret.length === 0) {
    throw new Error('Secret cannot be empty.');
  }

  const salt = randomBytes(SALT_LEN);
  const iv = randomBytes(IV_LEN);
  const key = deriveKey(secret, salt);

  const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LEN });
  const inputBuffer = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');

  const ciphertext = Buffer.concat([
    cipher.update(inputBuffer),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([salt, iv, tag, ciphertext]);
}

export function decrypt(
  encryptedData: Buffer,
  secret: string | Buffer,
): Buffer {
  if (!secret || secret.length === 0) {
    throw new Error('Secret cannot be empty.');
  }

  const minLength = SALT_LEN + IV_LEN + TAG_LEN;
  if (!Buffer.isBuffer(encryptedData) || encryptedData.length < minLength) {
    throw new Error('Invalid or corrupted payload.');
  }

  const salt = encryptedData.subarray(0, SALT_LEN);
  const iv = encryptedData.subarray(SALT_LEN, SALT_LEN + IV_LEN);
  const tag = encryptedData.subarray(SALT_LEN + IV_LEN, minLength);
  const ciphertext = encryptedData.subarray(minLength);

  const key = deriveKey(secret, salt);

  const decipher = createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: TAG_LEN,
  });
  decipher.setAuthTag(tag);

  try {
    return Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  } catch {
    throw new Error('Decryption failed.');
  }
}
