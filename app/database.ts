import models from './models';
import { User } from './types/types';
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
  getAll: () => {},
};
