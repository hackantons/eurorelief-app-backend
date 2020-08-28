import express from 'express';
import { Messages, Subscriptions, Users } from '../database';
import { createPushNotification } from '../push';
import { returnError } from '../utils/express';
import { log } from '../utils/log';
import { PushLog } from '../types/types';
import { sendSMS } from '../utils/sms';

export const addMessage = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    if (!req.body.message || !req.body.title) {
      next(returnError(400, '"Message" or "Title" not set'));
    }

    let users = req.body.user;
    if (typeof users === 'string') {
      users = [users];
    }

    const send: Record<
      string,
      {
        user: string;
        success: boolean;
        log: PushLog | string;
      }
    > = {};

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      try {
        const subscriptions = await Subscriptions.getByUser(user);

        const pushes = await createPushNotification(
          req.body.title,
          req.body.message,
          subscriptions
        );

        const log: PushLog = pushes.map(push => ({
          type: 'push',
          success: push.statusCode < 300,
          raw: push,
        }));

        if (
          req.body.sms === true &&
          log.filter(entry => entry.success).length === 0
        ) {
          const { phone } = await Users.get(user);
          if (phone) {
            const sms = await sendSMS(phone, req.body.message);
            log.push({
              type: 'sms',
              success: sms.success,
              raw: sms.resp,
            });
          }
        }

        await Messages.add(
          req.body.user,
          req.body.message,
          req.body.title,
          log
        );

        send[user] = {
          user,
          success: log.filter(entry => entry.success).length !== 0,
          log,
        };
      } catch (e) {
        send[user] = {
          user,
          success: false,
          log: e.text || e.toString(),
        };
      }
    }

    res.send(send);
  } catch (e) {
    log(e);
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
    log(e);
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
    log(e);
    next(e);
  }
};
