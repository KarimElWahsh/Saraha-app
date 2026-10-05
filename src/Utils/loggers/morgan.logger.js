import morgan from "morgan";
import fs from "node:fs";
import path from "node:path";

const __dirname = path.resolve();

export function attachRouterWithLogger(app, routerPath, router, logFileName) {
  const logStream = fs.createWriteStream(
    path.resolve(__dirname, "./src/logs", logFileName),
    { flags: "a" },
  );

  app.use(routerPath, morgan("combined", { stream: logStream }), router);

  app.use(routerPath, morgan("dev"), router);
}
