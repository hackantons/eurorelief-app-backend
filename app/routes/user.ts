import express from 'express';

import { Users } from '../database';
import { randomBytes } from 'crypto';
import { decrypt, encrypt, resError } from '../utils/auth';

export const userGet = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = await Users.get(String(res.locals.user));
    res.send(user);
  } catch (e) {
    next(resError[404]);
  }
};

export const userGetAll = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = await Users.get(String(res.locals.user));
    res.send(user);
  } catch (e) {
    next(resError[404]);
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
    next(resError[400]);
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
    delete req.body.password;
    delete req.body.uuid;
    // todo: send update to FM
    const updatedUser = await Users.update(res.locals.user, req.body);
    res.send(updatedUser);
  } catch (e) {
    next(resError[500]);
  }
};
