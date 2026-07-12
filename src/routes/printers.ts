import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { HttpError } from "../middleware/errorHandler.js";
import { MacLookupBodySchema, MacLookupQuerySchema, PrinterProbeQuerySchema, PrinterStatusQuerySchema } from "../schemas.js";
import { fetchPrinterMac, fetchPrinterStatus, probePrinterReachability } from "../services/printerService.js";

export const printersRouter = Router();

printersRouter.get("/probe", validate("query", PrinterProbeQuerySchema), async (req, res, next) => {
  try {
    const reachable = await probePrinterReachability(
      String(req.query.address),
      Number(req.query.timeoutMs)
    );
    res.json({ reachable });
  } catch (error) {
    next(error);
  }
});

printersRouter.get("/status", validate("query", PrinterStatusQuerySchema), async (req, res, next) => {
  try {
    const result = await fetchPrinterStatus(String(req.query.address), Number(req.query.timeoutMs));
    if (result.ok) {
      res.json(result.data);
      return;
    }

    const statusCode = result.reason === "invalid_address" ? 400 : result.reason === "timeout" ? 504 : 502;
    next(new HttpError(statusCode, "Unable to read printer status", { reason: result.reason }));
  } catch (error) {
    next(error);
  }
});

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
