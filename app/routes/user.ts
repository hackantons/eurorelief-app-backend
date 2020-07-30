import express from 'express';
import {
  forbiddenObject,
  authenticate,
  authenticateClient,
  authenticateUser,
  authenticateMaster,
} from '../utils/auth';
import { Users } from '../database';

export const userGet = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const uuid = authenticateUser(req.headers, req.params.uuid);
  if (!uuid) {
    next(forbiddenObject);
  }

  const user = await Users.get(String(uuid));
  if (!user) {
    next({
      status: 404,
      code: 'not_found',
      text: 'This user does not exist',
    });
  }
  res.send(user);
};

export const userPut = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!authenticateClient(req.headers)) {
    next(forbiddenObject);
  }
  const user = await Users.add(req.body);
  if (!user) {
    next({
      status: 400,
      code: 'already_exists',
      text: 'This user already exists',
    });
  }
  res.send(user);
};

export const userUpdate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const uuid = authenticateUser(req.headers, req.params.userID);
  if (!uuid) {
    next(forbiddenObject);
  }

  const user = await Users.update(String(uuid), req.body);
  if (!user) {
    next({
      status: 400,
      code: 'update_failed',
      text:
        'User could not be updated. Either the user does not exist or the email is already in use',
    });
  }
  res.send(user);
};

export const userDelete = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (!authenticateMaster(req.headers)) {
    next(forbiddenObject);
  }
  const user = await Users.delete(String(req.params.uuid));
  res.send({ deleted: user });
};

export const userJwtValidate = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const auth = authenticate(req.headers);
  res.send({ user: auth === 'master' ? false : auth });
};
