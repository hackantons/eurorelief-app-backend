import express from 'express';

import { Users } from '../database';
import { randomBytes } from 'crypto';
import { authJWT, resError } from '../utils/auth';

export const signIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.send({
    jwt: (await Users.checkCredentials(
      String(req.body.uuid),
      String(req.body.password)
    ))
      ? authJWT.generate(String(req.body.uuid), 60 * 60 * 24 * 365)
      : false,
  });
  return;
};

export const userGet = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.send((await Users.get(String(res.locals.user))) || next(resError[404]));
  return;
};

export const userCreate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const password = randomBytes(20).toString('hex');
    const user = await Users.add({
      uuid: req.body.uuid,
      password,
    });
    res.send({ password, ...user });
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
    const updatedUser = await Users.update(res.locals.user, req.body);
    res.send(updatedUser);
  } catch (e) {
    next(resError[500]);
  }
};
