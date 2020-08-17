import express from 'express';
import { Users } from '../database';
import { authJWT } from '../utils/auth';
import { resolveId } from '../utils/filemaker';
import { decrypt, encrypt } from '../utils/crypto';

export const signIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  res.send({
    jwt: (await Users.checkCredentials(
      decrypt(String(req.body.uuid)),
      String(req.body.password)
    ))
      ? authJWT.generate(String(req.body.uuid), 60 * 60 * 24 * 30)
      : false,
  });
  return;
};

export const resolveCampID = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const uuid = resolveId(req.body.id);
    res.send({
      uuid: encrypt(uuid),
    });
  } catch (e) {
    next();
  }
};
