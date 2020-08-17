import express from 'express';

import { Users } from '../database';
import { randomBytes } from 'crypto';
import { decrypt, encrypt } from '../utils/crypto';
import { resolveId } from '../utils/filemaker';
import { returnError } from '../utils/express';

export const userGet = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = await Users.get(String(res.locals.user));
    res.send(user);
  } catch (e) {
    next(e);
  }
};

export const userDelete = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = await Users.delete(String(res.locals.user));
    res.send(user);
  } catch (e) {
    next(e);
  }
};

export const userGetAll = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = await Users.getAll();
    res.send(user);
  } catch (e) {
    next(e);
  }
};

export const userCreate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const password = randomBytes(20).toString('hex');
    const user = await Users.add({
      uuid: decrypt(req.body.uuid),
      password,
    });
    res.send({
      user: encrypt(user.uuid),
      password,
    });
  } catch (e) {
    next(e);
  }
};

export const userResetPassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const updatedUser = await Users.update(req.body.uuid, {
    password: '',
  });
  res.send({ reset: !!updatedUser });
};

export const userUpdate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const regnumber = req.body.regnumber;
    const uuid = resolveId(regnumber);
    if (uuid !== res.locals.user) {
      next(returnError(403, 'invalid registration number'));
    }
    delete req.body.password;
    delete req.body.uuid;
    delete req.body.regnumber;
    // todo: send update to FM
    const updatedUser = await Users.update(res.locals.user, req.body);
    res.send(updatedUser);
  } catch (e) {
    next(e);
  }
};
