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
  const isProduction = process.env.NODE_ENV === "production";

  app.disable("x-powered-by");
  // Local mode loads third-party UI assets and direct cross-origin camera streams.
  // CSP is therefore disabled until those assets are bundled or explicitly allowlisted;
  // COEP and CORP stay disabled because cameras commonly omit compatible response headers.
  // Before exposing the app beyond localhost, add authentication, restrict CORS, serve over
  // HTTPS, define a strict CSP, and enable COEP/CORP only after camera compatibility testing.
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
    maxAge: isProduction ? "1h" : 0,
    setHeaders: response => {
      if (!isProduction) response.setHeader("Cache-Control", "no-store");
    }
  }));

  app.get("/", (_req, res, next) => {
    sendClient(res, next);
  });

  app.get("/index.html", (_req, res, next) => {
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
