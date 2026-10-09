import { createClient } from "redis";
import { REDIS_URI } from "../../config/config.service.js";
import chalk from "chalk";

export const redisClient = createClient({
  url: REDIS_URI,
});

export const redisConnection = async () => {
  try {
    await redisClient.connect();
    console.log(chalk.green("Redis connected Successfully "));
  } catch (error) {
    console.log(chalk.red("Redis connected Failed : "), error);
  }
};
