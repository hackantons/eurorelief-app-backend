import express from 'express';
import { authJWT, decrypt, resError } from '../utils/auth';

const ADMIN_USER = 'admin';

const isAdmin = (key: string): boolean => key === process.env.ADMIN_KEY;

export const prepareRequest = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.locals.auth = null;
  res.locals.user = null;
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (isAdmin(token)) {
    res.locals.auth = ADMIN_USER;
    res.locals.user = req.query.user;
  } else {
    const user = authJWT.verify(token);
    res.locals.auth = user || null;
    res.locals.user = user || null;
  }
  next();
};

export const authUser = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!res.locals.user) {
    next(resError[404]);
  } else if (
    !res.locals.auth ||
    (res.locals.auth !== ADMIN_USER && res.locals.user !== res.locals.auth)
  ) {
    next(resError[403]);
  } else {
    next();
  }

  return;
};

export const authAdmin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (res.locals.auth !== ADMIN_USER) {
    next(resError[403]);
  } else {
    next();
  }

  return;
};
