import { RedisArgument, type RedisClientType, SetOptions } from 'redis';

import { RedisKeys } from './redis.keys';
import { Types } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { User } from '../../../DB/models/user.model';
@Injectable()
export class RedisService extends RedisKeys {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: RedisClientType) {
    super();
  }
  setValue = async (
    key: RedisArgument,
    value: unknown,
    options?: SetOptions,
  ): Promise<string | null> => {
    try {
      const newValue =
        typeof value === 'string' ? value : JSON.stringify(value);

      return await this.redis.set(key, newValue, options);
    } catch (e) {
      console.log({ message: 'cannot set a value', error: e });

      throw e;
    }
  };
  getValue = async (
    key: RedisArgument,
  ): Promise<string | User | null | number> => {
    try {
      const result = await this.redis.get(key);
      try {
        return result ? JSON.parse(result) : null;
      } catch {
        return result;
      }
    } catch (e) {
      console.log({ message: 'cannot get a value', error: e });
      throw e;
    }
  };
  getTtl = async (key: RedisArgument) => {
    try {
      return await this.redis.ttl(key);
    } catch (e) {
      console.log({ message: 'cannot getTtl value', error: e });
      throw e;
    }
  };
  inc = async (key: RedisArgument): Promise<number> => {
    try {
      return await this.redis.incr(key);
    } catch (e) {
      console.log({ message: 'cannot increment value', error: e });
      throw e;
    }
  };
  deleteKeys = async (keys: string[]) => {
    try {
      if (!keys.length) return;
      return await this.redis.del(keys);
    } catch (e) {
      console.log({ message: 'cannot delete keys', error: e });
      throw e;
    }
  };
  getKeys = async (pattern: RedisArgument): Promise<string[]> => {
    try {
      return await this.redis.keys(pattern);
    } catch (e) {
      console.log({ message: 'cannot get keys', error: e });
      throw e;
    }
  };
  addFCM = async (userId: Types.ObjectId, FCMToken: string) => {
    return await this.redis.sAdd(this.fcmKey(userId), FCMToken);
  };
  removeFCM = async (userId: Types.ObjectId, FCMToken: string) => {
    return await this.redis.sRem(this.fcmKey(userId), FCMToken);
  };
  getFCMs = async (userId: Types.ObjectId) => {
    return await this.redis.sMembers(this.fcmKey(userId));
  };
  hasFCM = async (userId: Types.ObjectId) => {
    return await this.redis.sCard(this.fcmKey(userId));
  };
  removeFCMUser = async (userId: Types.ObjectId) => {
    return await this.redis.del(this.fcmKey(userId));
  };
  addSocket = async (userId: Types.ObjectId, socketToken: string) => {
    return await this.redis.sAdd(this.socketKey(userId), socketToken);
  };
  removeSocket = async (userId: Types.ObjectId, socketToken: string) => {
    return await this.redis.sRem(this.socketKey(userId), socketToken);
  };
  getSockets = async (userId: Types.ObjectId) => {
    return await this.redis.sMembers(this.socketKey(userId));
  };
  hasSocket = async (userId: Types.ObjectId) => {
    return await this.redis.sCard(this.socketKey(userId));
  };
  removeSocketUser = async (userId: Types.ObjectId) => {
    return await this.redis.del(this.socketKey(userId));
  };
}
