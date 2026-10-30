import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { createFoodSchema, optimizeSchema } from "../schemas/foods";
import * as ctrl from "../controllers/foodController";

export const foodsRouter = Router();
foodsRouter.use(requireAuth);
foodsRouter.get("/", ctrl.list);
foodsRouter.post("/", validate(createFoodSchema), ctrl.create);

export const optimizerRouter = Router();
optimizerRouter.use(requireAuth);
optimizerRouter.post("/treats", validate(optimizeSchema), ctrl.optimize);