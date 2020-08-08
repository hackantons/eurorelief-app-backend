import { v4 as uuidv4 } from 'uuid';
import models from './db';
import { User, Subscription, Message } from './types/types';
import { md5 } from './utils/crypto';
import { returnError } from './utils/express';

export const Users = {
  add: async ({ uuid, password }: User): Promise<User> => {
    if (!uuid || !password) {
      throw returnError(400, 'no uuid or no password set');
    }

    let user = await models.User.findOne({ uuid });
    if (user) {
      if (user.password !== '') {
        throw returnError(400, 'User already created');
      }
      await models.User.updateOne(
        { _id: user._id },
        {
          uuid,
          password: md5(password),
        }
      );
    } else {
      await models.User.create({
        uuid,
        password: md5(password),
      });
    }

    return await Users.get(uuid);
  },
  update: async (uuid: string, userObject: Partial<User>): Promise<User> => {
    let user = await models.User.findOne({ uuid });
    if (!user) {
      throw returnError(400, 'User does not exist');
    }

    await models.User.updateOne({ _id: user._id }, userObject);
    return await Users.get(uuid);
  },
  get: async (uuid: string): Promise<User> => {
    const user = await models.User.findOne({ uuid });
    if (!user) {
      throw returnError(404, 'User not found');
    }
    return {
      uuid: user.uuid,
      phone: user.phone,
    };
  },
  getAll: async (): Promise<Array<User>> => {
    const users = await models.User.find({});
    if (!users) {
      throw returnError(404, 'User not found');
    }
    return users.map(user => ({
      uuid: user.uuid,
      phone: user.phone,
    }));
  },
  delete: async (uuid: string): Promise<{ deleted: number }> => {
    const deleted = await models.User.deleteOne({ uuid });
    if (!deleted) {
      throw returnError(404, 'User not found');
    }
    return {
      deleted: deleted.deletedCount || 0,
    };
  },
  checkCredentials: async (
    uuid: string,
    password: string
  ): Promise<boolean> => {
    const user = await models.User.findOne({ uuid });
    return user ? md5(password) === user.password : false;
  },
};

export const Subscriptions = {
  add: async (
    uuid: string,
    subscription: Subscription
  ): Promise<Subscription> => {
    const user = await models.User.findOne({ uuid });
    if (!user) {
      throw returnError(400, 'User does not exist');
    }
    await models.Subscriptions.create({
      ...subscription,
      user: user._id,
    });
    const sub = await models.Subscriptions.findOne({
      endpoint: subscription.endpoint,
    });
    if (!sub) {
      throw returnError(500, 'Subscription could not be created');
    }
    return {
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
      user: sub.user,
    };
  },
  getByUser: async (uuid: string): Promise<Array<Subscription>> => {
    const user = await models.User.findOne({ uuid });
    if (!user) {
      throw returnError(400, 'User does not exist');
    }

    const subscriptions = await models.Subscriptions.find({ user: user._id });
    if (!subscriptions) {
      return [];
    }

    return subscriptions.map(sub => ({
      endpoint: sub.endpoint,
      p256dh: sub.p256dh,
      auth: sub.auth,
    }));
  },
};

export const Messages = {
  add: async (uuid: string, msg: string, title: string) => {
    const user = await models.User.findOne({ uuid });
    if (!user) {
      throw returnError(400, 'User does not exist');
    }
    const id = uuidv4();

    await models.Messages.create({
      uuid: id,
      message: msg,
      title,
      sent: new Date().toISOString(),
      sentVia: 'push',
      seen: '',
      user: user._id,
    });
    return await Messages.get(id);
  },
  get: async (uuid: string) => {
    const msg = await models.Messages.findOne({ uuid });
    if (!msg) {
      throw returnError(404, 'Message does not exist');
    }

    return {
      uuid: msg.uuid,
      message: msg.message,
      title: msg.title,
      sent: msg.sent,
      sentVia: msg.sentVia,
      seen: msg.seen,
    };
  },
  getByUser: async (userUuid: string): Promise<Array<Message>> => {
    const user = await models.User.findOne({ uuid: userUuid });
    if (!user) {
      throw returnError(400, 'User does not exist');
    }

    const messages = await models.Messages.find({ user: user._id }).sort(
      '-sent'
    );
    if (!messages) {
      return [];
    }

    return await Promise.all(messages.map(msg => Messages.get(msg.uuid)));
  },
  update: async (
    uuid: string,
    messageObject: Partial<Message>
  ): Promise<Message> => {
    await models.Messages.updateOne({ uuid }, messageObject);
    return await Messages.get(uuid);
  },
};
