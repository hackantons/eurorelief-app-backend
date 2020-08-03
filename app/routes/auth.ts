import express from 'express';
import { Users } from '../database';
import { authJWT, decrypt, encrypt } from '../utils/auth';

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
      ? authJWT.generate(String(req.body.uuid), 60 * 60 * 24 * 365)
      : false,
  });
  return;
};

export const resolveCampID = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // this is only a mock until the Filemaker API is ready
  res.send({
    uuid: encrypt(req.body.id),
  });
};
