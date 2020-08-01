import express from 'express';
import { Messages } from '../database';
import { resError } from '../utils/auth';

export const addMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.send(await Messages.add(req.body.user, req.body.message));
  } catch (e) {
    console.log(e.toString());
    next(resError[400]);
  }
};

export const getMessagesByUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.send(await Messages.getByUser(res.locals.user));
  } catch (e) {
    next(resError[400]);
  }
};
