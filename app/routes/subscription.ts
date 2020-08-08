import express from 'express';
import { Subscriptions } from '../database';

export const addSubscription = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.send(await Subscriptions.add(res.locals.user, req.body));
  } catch (e) {
    next(e);
  }
};
