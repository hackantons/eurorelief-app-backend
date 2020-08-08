import jwt from 'jsonwebtoken';
import { createCipheriv, createDecipheriv, createHash } from 'crypto';
import { ErrorReturn } from '../types/express';

const key = createHash('sha256')
  .update(String(process.env.CRYPTO_KEY))
  .digest('base64')
  .substr(0, 32);

const iv = String(process.env.CRYPTO_IV);

export const encrypt = (text: string): string => {
  if (text === '') {
    return '';
  }
  const cipher = createCipheriv('aes-256-cbc', Buffer.from(key), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return encrypted.toString('hex');
};

export const decrypt = (text: string): string => {
  if (text === '') {
    return '';
  }
  const encryptedText = Buffer.from(text, 'hex');
  const decipher = createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
};

export const authJWT = {
  generate: (uuid: string, expires: number = 60 * 60 * 24): string =>
    jwt.sign({ uuid }, String(process.env.JWT_SECRET), {
      expiresIn: expires,
    }),
  verify: (token: string): string | false => {
    let decoded;
    try {
      decoded = Object(jwt.verify(token, String(process.env.JWT_SECRET)));
    } catch (err) {
      return false;
    }
    return decoded ? decrypt(String(decoded.uuid)) : '';
  },
};
