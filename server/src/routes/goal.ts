import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";
import { goalSchema } from "../schemas/entries";
import * as svc from "../services/goalService";

export const goalRouter = Router();
goalRouter.use(requireAuth);

goalRouter.get("/", async (req, res) => {
  const goal = await svc.getGoal(req.userId as string);
  if (!goal) throw new AppError(404, "No goal set yet");
  res.status(200).json(goal);
});

goalRouter.put("/", validate(goalSchema), async (req, res) => {
  res.status(200).json(await svc.saveGoal(req.userId as string, req.body));
});