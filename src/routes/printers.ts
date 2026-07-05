import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { MacLookupBodySchema, MacLookupQuerySchema } from "../schemas.js";
import { fetchPrinterMac } from "../services/printerService.js";

export const printersRouter = Router();

printersRouter.get("/mac", validate("query", MacLookupQuerySchema), async (req, res, next) => {
  try {
    const result = await fetchPrinterMac(String(req.query.address));
    res.json({ found: Boolean(result), ...result });
  } catch (error) {
    next(error);
  }
});

printersRouter.post("/mac", validate("body", MacLookupBodySchema), async (req, res, next) => {
  try {
    const { address, timeoutMs } = req.body;
    const result = await fetchPrinterMac(address, timeoutMs);
    res.json({ found: Boolean(result), ...result });
  } catch (error) {
    next(error);
  }
});
