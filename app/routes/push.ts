import express from 'express';
import { urlBase64ToUint8Array } from '../utils/push';

export const publicKey = (req: express.Request, res: express.Response) => {
  res.send(urlBase64ToUint8Array(String(process.env.VAPID_PUBLIC_KEY)));
};
