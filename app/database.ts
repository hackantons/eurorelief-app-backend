import { v4 as uuidv4 } from 'uuid';
import models from './models';
import { User, Subscription, Message, MessageDB } from './types/types';
import { md5 } from './utils/cryto';

export const Users = {
  add: async ({ uuid, password }: User): Promise<User | Error> => {
    if (!uuid || !password) {
      throw new Error('invalid_data');
    }

    let user = await models.User.findOne({ uuid });
    if (user) {
      if (user.password !== '') {
        throw new Error('already_set');
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
  update: async (
    uuid: string,
    userObject: Partial<User>
  ): Promise<User | Error> => {
    let user = await models.User.findOne({ uuid });
    if (!user) {
      return new Error('not_found');
    }

    await models.User.updateOne({ _id: user._id }, userObject);
    return await Users.get(uuid);
  },
  get: async (uuid: string): Promise<User | Error> => {
    const user = await models.User.findOne({ uuid });
    return user
      ? {
          uuid: user.uuid,
          phone: user.phone,
        }
      : new Error('User not found');
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
  add: async (uuid: string, subscription: Subscription) => {
    const user = await models.User.findOne({ uuid });
    if (!user) {
      throw new Error('invalid_user');
    }
    await models.Subscriptions.create({
      ...subscription,
      user: user._id,
    });
    return models.Subscriptions.findOne({
      endpoint: subscription.endpoint,
    });
  },
};

export const Messages = {
  add: async (uuid: string, msg: string) => {
    const user = await models.User.findOne({ uuid });
    if (!user) {
      throw new Error('invalid_user');
    }
    const id = uuidv4();

    await models.Messages.create({
      uuid: id,
      message: msg,
      sent: new Date().toISOString(),
      sentVia: 'push',
      seen: '',
      user: user._id,
    });
    return models.Messages.findOne({
      uuid: id,
    });
  },
  getByUser: async (uuid: string): Promise<Array<MessageDB> | Error> => {
    const user = await models.User.findOne({ uuid });
    if (!user) {
      throw new Error('user_not_found');
    }
    return models.Messages.find({ user: user._id });
  },
};
