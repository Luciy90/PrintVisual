import { Router } from "express";
import { healthRouter } from "./health.js";
import { networkRouter } from "./network.js";
import { printersRouter } from "./printers.js";
import { settingsRouter } from "./settings.js";

export const apiRouter = Router();

apiRouter.use("/health", healthRouter);
apiRouter.use("/settings", settingsRouter);
apiRouter.use("/printers", printersRouter);
apiRouter.use("/network", networkRouter);
