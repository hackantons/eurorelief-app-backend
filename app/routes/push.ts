import express from 'express';
import { urlBase64ToUint8Array } from '../utils/push';
import { log } from '../utils/log';
import { returnError } from '../utils/express';

export const publicKey = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.send(urlBase64ToUint8Array(String(process.env.VAPID_PUBLIC_KEY)));
  } catch (e) {
    log(e);
    next(returnError(500));
  }
};
