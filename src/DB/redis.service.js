import { json } from "express";
import { redisClient } from "./redis-connection.js";

export const revokeTokenKeyPrefix = ({ userId }) => {
  return `user:revokeToken:${userId}`;
};

export const revokeTokenKey = ({ userId, jti }) => {
  return `${revokeTokenKeyPrefix({ userId })}:${jti}`;
};

export const set = async ({ key, value, ttl = null }) => {
  try {
    const data = typeof value != "string" ? JSON.stringify(value) : value;

    if (ttl) {
      return await redisClient.set(key, data, {
        expiration: { type: "EX", ttl: value },
      });
    } else {
      return await redisClient.set(key, data);
    }
  } catch (error) {
    console.error("Redis Set Error: ", error);
  }
};

export const get = async ({ key }) => {
  try {
    const data = await redisClient.get(key);
    return data;
  } catch (error) {
    console.error("Redis get Error: ", error);
  }
};

export const update = async ({ key, value, ttl = null }) => {
  try {
    const isExist = await redisClient.exists(key);
    if (!isExist) {
      return false;
    } else {
      const data = typeof value != "string" ? JSON.stringify(value) : value;

      if (ttl) {
        return await redisClient.set(key, data, {
          expiration: { type: "EX", ttl: value },
        });
      } else {
        return await redisClient.set(key, data);
      }
    }
  } catch (error) {
    console.error("Redis update Error: ", error);
  }
};

export const del = async ({ key }) => {
  try {
    const isExist = await redisClient.exists(key);
    if (!isExist) return false;
    return await redisClient.del(key);
  } catch (error) {
    console.error("Redis delete Error: ", error);
  }
};

export const expire = async ({ key, ttl }) => {
  try {
    const isExist = await redisClient.exists(key);
    if (!isExist) return false;
    return await redisClient.expire(key, ttl);
  } catch (error) {
    console.error("Redis expire Error: ", error);
  }
};

export const ttl = async ({ key }) => {
  try {
    const isExist = await redisClient.exists(key);
    if (!isExist) return false;
    return await redisClient.ttl(key);
  } catch (error) {
    console.error("Redis TTL Error: ", error);
  }
};

export const keys = async ({ pattern }) => {
  try {
    return await redisClient.keys(pattern);
  } catch (error) {
    console.error("Redis keys Error: ", error);
  }
};
