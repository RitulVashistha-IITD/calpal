import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import * as ctrl from "../controllers/entryController";

export const statsRouter = Router();
statsRouter.use(requireAuth);
statsRouter.get("/daily", ctrl.stats);