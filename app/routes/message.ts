import express from 'express';
import { Messages, Subscriptions } from '../database';
import { createPushNotification } from '../push';
import { returnError } from '../utils/express';

export const addMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.body.message || !req.body.title) {
      next(returnError(400, '"Message" or "Title" not set'));
    }
    /**
     * todo:
     * - get user push subscriptions and try
     * - if fails, get user phone and try
     * - log output in message
     */
    const subscriptions = await Subscriptions.getByUser(req.body.user);

    const push = await createPushNotification(
      req.body.title,
      req.body.message,
      subscriptions
    );

    res.send(
      await Messages.add(req.body.user, req.body.message, req.body.title)
    );
  } catch (e) {
    next(e);
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
    next(e);
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
    next(e);
  }
};
