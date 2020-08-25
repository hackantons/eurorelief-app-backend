import express from 'express';

import { Users } from '../database';
import { randomBytes } from 'crypto';
import { decrypt, encrypt } from '../utils/crypto';
import { resolveId, setPhoneNumberAdded } from '../utils/filemaker';
import { returnError } from '../utils/express';
import { isValidPhoneNumber } from '../utils/numverify';
import { log } from '../utils/log';

export const userGet = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const user = await Users.get(String(res.locals.user));
    if ('uuid' in user) {
      user.uuid = encrypt(user.uuid);
    }
    res.send(user);
  } catch (e) {
    log(e);
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
    log(e);
    next(e);
  }
};

export const userGetAll = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let users = await Users.getAll();
    users = users.map(user => {
      if ('uuid' in user) {
        user.uuid = encrypt(user.uuid);
      }
      return user;
    });
    res.send(users);
  } catch (e) {
    log(e);
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
    log(e);
    next(e);
  }
};

export const userResetPassword = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const updatedUser = await Users.update(req.body.uuid, {
      password: '',
    });
    res.send({ reset: !!updatedUser });
  } catch (e) {
    log(e);
    next(e);
  }
};

export const userUpdate = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const regnumber = req.body.regnumber;
    const uuid = await resolveId(regnumber);
    if (uuid !== res.locals.user) {
      next(returnError(403, 'invalid registration number'));
    }
    delete req.body.password;
    delete req.body.uuid;
    delete req.body.regnumber;

    if ('phone' in req.body) {
      const phone = req.body.phone.replace(/\s/g, '');
      if (phone !== '' && !(await isValidPhoneNumber(phone))) {
        next(returnError(418, 'Invalid Phone Number'));
        return;
      }
      await setPhoneNumberAdded(uuid, phone !== '');
      req.body.phone = phone;
    }

    const updatedUser = await Users.update(res.locals.user, req.body);
    res.send(updatedUser);
  } catch (e) {
    log(e);
    next(e);
  }
};
