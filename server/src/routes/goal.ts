import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { goalSchema } from "../schemas/entries";
import * as ctrl from "../controllers/entryController";

export const goalRouter = Router();
goalRouter.use(requireAuth);
goalRouter.get("/", ctrl.getGoal);
goalRouter.put("/", validate(goalSchema), ctrl.putGoal);