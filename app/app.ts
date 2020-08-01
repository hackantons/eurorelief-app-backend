import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { ErrorReturn } from './types/express';
import { connectDB } from './models';
import { publicKey } from './routes/push';
import {
  signIn,
  userGet,
  userCreate,
  userResetPassword,
  userUpdate,
} from './routes/user';
import { prepareRequest, authUser, authAdmin } from './middleware/authenticate';
import { resError } from './utils/auth';

const PORT = Number(process.env.PORT) || 8080;

const app: express.Application = express();
app.use(cors());
app.use(bodyParser.json());
app.use(prepareRequest);

/**
 * Auth
 */

app.get('/signin/', signIn);

/**
 * Push
 */

app.get('/push/key/', publicKey);

/**
 * User
 */

app.get('/user/', userGet);
app.put('/user/', userCreate);
app.post('/user/update/', authUser, userUpdate);
app.post('/user/reset/', authAdmin, userResetPassword);

/**
 * Subscriptions
 */

// put a subscription to a uuid
app.put('/subscription/', () => {});

/**
 * Messages
 */

// put a message to a uuid
app.put('/message/', () => {});

/**
 * General error handling
 */

app.all(
  '*',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    next(resError[400]);
  }
);

app.use(
  (
    err: express.Errback,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const defaultError: ErrorReturn = resError[500];

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
