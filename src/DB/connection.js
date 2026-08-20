import mongoose from "mongoose";
import { DB_URI } from "../../config/config.service.js";
import chalk from "chalk";

export const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(chalk.green("MongoDB connected Successfully "));
  } catch (error) {
    console.log(chalk.red("MongoDB connected Failed"));
  }
};
