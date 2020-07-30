import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

import { ErrorReturn } from './utils/types';
import { connectDB } from './models';
import { getPublicKey } from './routes/getPublicKey';

const PORT = Number(process.env.PORT) || 8080;

const app: express.Application = express();
app.use(cors());
app.use(bodyParser.json());

app.get(
  '/',
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    res.send({ it: 'works good' });
  }
);
app.get('/key/', getPublicKey);

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
