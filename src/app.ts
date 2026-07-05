import fs from "node:fs";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { paths } from "./config.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";

export function createApp(): express.Express {
  const app = express();

  app.disable("x-powered-by");
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false
  }));
  app.use(cors());
  app.use(express.json({ limit: "2mb" }));
  app.use(morgan("dev"));

  app.use("/api", apiRouter);
  app.use(express.static(paths.publicDir, {
    index: false,
    maxAge: "1h"
  }));

  app.get("/", (_req, res, next) => {
    sendClient(res, next);
  });

  app.get("/index.html", (_req, res, next) => {
    sendClient(res, next);
  });

  const legacyFileName = paths.legacyClientFile.split(/[\\/]/).pop() ?? "";
  app.get(`/${encodeURIComponent(legacyFileName)}`, (_req, res, next) => {
    sendClient(res, next);
  });

  app.get(`/${legacyFileName}`, (_req, res, next) => {
    sendClient(res, next);
  });

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

function sendClient(res: express.Response, next: express.NextFunction): void {
  if (!fs.existsSync(paths.clientIndexFile)) {
    next(new Error(`Client file not found: ${paths.clientIndexFile}`));
    return;
  }
  res.sendFile(paths.clientIndexFile);
}
