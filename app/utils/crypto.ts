import { createHmac } from 'crypto';
import Cryptr from 'cryptr';

const cryptr = new Cryptr(String(process.env.CRYPTO_KEY));

export const encrypt = (text: string): string => cryptr.encrypt(text);

export const decrypt = (text: string): string => cryptr.decrypt(text);

export const sha256 = (string: string): string =>
  createHmac('sha256', String(process.env.CRYPTO_SHA_KEY))
    .update(string)
    .digest('hex');
