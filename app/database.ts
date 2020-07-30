import models from './models';
import { randomBytes } from 'crypto';
import { User } from './types/types';
import { generateToken } from './utils/auth';

export const Users = {
  add: async ({ uuid = '', phone = '' }: User): Promise<User | Error> => {
    if (phone === '' || uuid === '') {
      return new Error('Invalid data');
    }

    let user = await models.User.findOne({ uuid });
    if (user) {
      return new Error('User already set');
    }

    await models.User.create({
      uuid,
      phone,
    });
    return await Users.get(uuid);
  },
  update: async (uuid: string, userObject: User): Promise<User | Error> => {
    //userObject = normalizeUser(userObject);
    let user = await models.User.findOne({ uuid });
    if (!user) {
      return new Error('User not found');
    }

    await models.User.updateOne({ _id: user._id }, userObject);
    return await Users.get(uuid);
  },
  delete: async (uuid: string): Promise<boolean> => {
    const deleted = await models.User.deleteOne({ uuid });
    return deleted.deletedCount === 1;
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
  getAll: async (): Promise<Array<User>> =>
    (await models.User.find({})).map(user => ({
      uuid: user.uuid,
      phone: user.phone,
    })),
  generateJWT: async (uuid: string): Promise<string | Error> =>
    (await models.User.findOne({ uuid }))
      ? generateToken(uuid, 60 * 60 * 24 * 265)
      : new Error('User not found'),
};

export const Subscriptions = {
  getAll: () => {},
};
