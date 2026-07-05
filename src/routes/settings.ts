import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { AppSettingsSchema } from "../schemas.js";
import { settingsStore } from "../services/settingsStore.js";

export const settingsRouter = Router();

settingsRouter.get("/", async (_req, res, next) => {
  try {
    res.json(await settingsStore.read());
  } catch (error) {
    next(error);
  }
});

settingsRouter.put("/", validate("body", AppSettingsSchema), async (req, res, next) => {
  try {
    res.json(await settingsStore.write(req.body));
  } catch (error) {
    next(error);
  }
});

settingsRouter.patch("/", validate("body", AppSettingsSchema), async (req, res, next) => {
  try {
    res.json(await settingsStore.merge(req.body));
  } catch (error) {
    next(error);
  }
});
