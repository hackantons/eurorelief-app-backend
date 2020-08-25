import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { ErrorReturn } from './types/express';
import { connectDB } from './db';
import { publicKey } from './routes/push';
import {
  userGet,
  userDelete,
  userGetAll,
  userCreate,
  userResetPassword,
  userUpdate,
  userLogout,
} from './routes/user';
import { addSubscription } from './routes/subscription';
import {
  addMessage,
  getMessagesByUser,
  setMessagesAsSeen,
} from './routes/message';
import { signIn, resolveCampID } from './routes/auth';

import { prepareRequest, authUser, authAdmin } from './middleware/authenticate';
import { resError } from './utils/express';

console.log("Juhuuu, I'm working");

const PORT = Number(process.env.PORT) || 8080;

const app: express.Application = express();
app.use(cors());
app.use(bodyParser.json());
app.use(prepareRequest);

/**
 * Auth
 */

app.post('/auth/signin/', signIn);
app.post('/auth/resolve-camp-id/', resolveCampID);

/**
 * Push
 */

app.get('/push/key/', publicKey);

/**
 * User
 */

app.get('/user/', authUser, userGet);
app.delete('/user/', authAdmin, userDelete);
app.get('/users/', authAdmin, userGetAll);
app.put('/user/', userCreate);
app.post('/user/', authUser, userUpdate);
app.post('/user/reset/', authAdmin, userResetPassword);
app.post('/user/logout/', authUser, userLogout);

/**
 * Subscriptions
 */

app.put('/subscription/', authUser, addSubscription);

/**
 * Messages
 */

app.put('/message/', authAdmin, addMessage);
app.get('/messages/', authUser, getMessagesByUser);
app.post('/messages/seen/', authUser, setMessagesAsSeen);

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
