import jwt from 'jsonwebtoken';
import { decrypt } from './crypto';

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
