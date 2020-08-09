import jwt from 'jsonwebtoken';
import Cryptr from 'cryptr';

const cryptr = new Cryptr(String(process.env.CRYPTO_KEY));

export const encrypt = (text: string): string => cryptr.encrypt(text);

export const decrypt = (text: string): string => cryptr.decrypt(text);

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
