import express from 'express';
import { Users } from '../database';
import { authJWT } from '../utils/auth';
import { resolveId } from '../utils/filemaker';
import { decrypt, encrypt } from '../utils/crypto';
import { returnError } from '../utils/express';
import { log } from '../utils/log';

export const signIn = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.send({
      jwt: (await Users.checkCredentials(
        decrypt(String(req.body.uuid)),
        String(req.body.password)
      ))
        ? authJWT.generate(String(req.body.uuid), 60 * 60 * 24 * 30)
        : false,
    });
  } catch (e) {
    log(e);
    next(returnError(500));
  }
};

export const resolveCampID = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const uuid = await resolveId(req.body.id);
    if (!uuid) {
      next(returnError(404, 'Number could not be resolved'));
      return;
    }
    res.send({
      uuid: encrypt(uuid),
    });
  } catch (e) {
    log(e);
    next(returnError(500));
  }
};
