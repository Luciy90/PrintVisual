import { Router } from "express";
import { validate } from "../middleware/validate.js";
import { NetworkScanSchema, RecoverPlanSchema } from "../schemas.js";
import { buildRecoveryPlan, scanNetwork } from "../services/networkScanner.js";
export const networkRouter = Router();
networkRouter.post("/scan", validate("body", NetworkScanSchema), async (req, res, next) => {
    try {
        const devices = await scanNetwork(req.body);
        res.json({ devices });
    }
    catch (error) {
        next(error);
    }
});
networkRouter.post("/recovery-plan", validate("body", RecoverPlanSchema), async (req, res, next) => {
    try {
        res.json(await buildRecoveryPlan(req.body));
    }
    catch (error) {
        next(error);
    }
});
