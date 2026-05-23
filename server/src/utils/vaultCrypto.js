import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const SALT_KEY = process.env.VAULT_SALT_KEY || process.env.JWT_SECRET || 'change-me-use-env-var';

async function deriveKey(password) {
  const salt = crypto.scryptSync(SALT_KEY, 'vault-salt-v1', 32);
  return crypto.scryptSync(password, salt, 32);
}

export async function encrypt(plaintext, masterKey) {
  const key = await deriveKey(masterKey);
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return { encrypted, iv: iv.toString('hex'), authTag };
}

export async function decrypt(encryptedHex, ivHex, authTagHex, masterKey) {
  const key = await deriveKey(masterKey);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
