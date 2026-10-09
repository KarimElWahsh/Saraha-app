import helmet from "helmet";
import { connectDB } from "./DB/connection.js";
import { authRouter, messageRouter, userRouter } from "./Modules/index.js";
import { corsOptions } from "./Utils/cors/cors.utils.js";
import {
  globalErrorHandling,
  NotFoundException,
} from "./Utils/response/error.response.js";
import { successResponse } from "./Utils/response/success.response.js";
import cors from "cors";
import path from "node:path";
import { attachRouterWithLogger } from "./Utils/loggers/morgan.logger.js";
import morgan from "morgan";
import { customRateLimiter } from "./Middleware/rate-limit.middleware.js";
import { redisConnection } from "./DB/redis-connection.js";

export const bootstrap = async (app, express) => {
  app.use(
    express.json(),
    cors(corsOptions()),
    helmet(),
    morgan("dev"),
    customRateLimiter(),
  );
  await connectDB();
  await redisConnection();

  attachRouterWithLogger(app, "/api/v1/auth", authRouter, "access.log");
  app.use("/uploads", express.static(path.resolve("./src/uploads")));
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/message", messageRouter);
  app.use("/api/v1/user", userRouter);

  app.get("/", (req, res) => {
    // return res.status(200).json({ message: "Welcome to Home Page" });
    successResponse({ res, message: "Welcome Page" });
  });

  app.all("/*dummy", (req, res) => {
    NotFoundException("NOT FOUND HANDLER!");
  });
  app.use(globalErrorHandling);
};
