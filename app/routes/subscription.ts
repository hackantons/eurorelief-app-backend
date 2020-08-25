import express from 'express';
import { Subscriptions } from '../database';
import { log } from '../utils/log';

export const addSubscription = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.send(await Subscriptions.add(res.locals.user, req.body));
  } catch (e) {
    log(e);
    next(e);
  }
};
