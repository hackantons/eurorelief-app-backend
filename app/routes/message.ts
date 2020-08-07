import express from 'express';
import { Messages, Subscriptions } from '../database';
import { resError } from '../utils/auth';
import { createPushNotification } from '../push';

export const addMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    /**
     * todo:
     * - get user push subscriptions and try
     * - if fails, get user phone and try
     * - log output in message
     */
    const subscriptions = await Subscriptions.getByUser(req.body.user);

    const push = await createPushNotification(
      'Eurorelief Push',
      req.body.message,
      subscriptions
    );

    res.send(
      await Messages.add(req.body.user, req.body.message, req.body.title)
    );
  } catch (e) {
    next(resError[400]);
  }
};

export const getMessagesByUser = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    res.send(await Messages.getByUser(res.locals.user));
  } catch (e) {
    next(resError[400]);
  }
};

export const setMessagesAsSeen = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    let messageIDs = req.body.messages;
    const userMessages = await Messages.getByUser(res.locals.user);
    const userMessageIDs = userMessages.map(message => message.uuid);
    messageIDs = messageIDs.filter(
      (id: string) => userMessageIDs.indexOf(id) !== -1
    );

    await Promise.all(
      messageIDs.map(async (id: string) => {
        const message = await Messages.get(id);
        if (!message.seen) {
          return await Messages.update(id, { seen: new Date().toISOString() });
        }
        return true;
      })
    );
    res.send(await Messages.getByUser(res.locals.user));
  } catch (e) {
    next(resError[400]);
  }
};
