import crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'internx_github_token_encryption_key_32_bytes_long_keys'; // Must be 32 bytes
const IV_LENGTH = 16; // AES block size is 16 bytes

export function encrypt(text) {
  if (!text) return null;
  
  // Format key to 32 bytes
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  // Return initialization vector and ciphertext combined
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(text) {
  if (!text) return null;
  
  const textParts = text.split(':');
  if (textParts.length < 2) return null;
  
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32).slice(0, 32));
  
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
