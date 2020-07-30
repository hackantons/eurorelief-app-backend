import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { ErrorReturn } from './types/express';
import { connectDB } from './models';
import { getPublicKey } from './routes/getPublicKey';
import {
  userDelete,
  userGet,
  userJwtValidate,
  userPut,
  userUpdate,
} from './routes/user';

const PORT = Number(process.env.PORT) || 8080;

const app: express.Application = express();
app.use(cors());
app.use(bodyParser.json());

/**
 * Push
 */

app.get('/key/', getPublicKey);

/**
 * Users
 */

app.get('/user/:uuid', userGet);
app.put('/user/', userPut);
app.put('/user/:userID', userUpdate);
app.delete('/user/:userID', userDelete);
app.get('/user/jwt/validate/', userJwtValidate);

/**
 * General error handling
 */

app.all(
  '*',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    next({
      status: 400,
      code: 'invalid_request',
      text: 'Invalid request',
    });
  }
);

app.use(
  (
    err: express.Errback,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const defaultError: ErrorReturn = {
      status: 500,
      code: 'error',
      text: 'An error occured',
      trace: '',
    };

    const error: ErrorReturn = {
      ...defaultError,
      ...err,
    };

    res.status(error.status).send({
      code: error.code,
      error: error.text,
      data: {
        status: error.status,
        trace: error.trace,
      },
    });
  }
);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`APP listening to ${PORT}!`));
});
