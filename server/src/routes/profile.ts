import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { AppError } from "../middleware/errorHandler";
import { profileSchema, forecastQuerySchema, suggestQuerySchema, weightSchema } from "../schemas/profile";
import * as svc from "../services/profileService";

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.get("/", async (req, res) => {
  const p = await svc.getProfile(req.userId as string);
  if (!p) throw new AppError(404, "No profile yet");
  res.status(200).json(p);
});

profileRouter.put("/", validate(profileSchema), async (req, res) => {
  res.status(200).json(await svc.saveProfile(req.userId as string, req.body));
});

profileRouter.patch("/weight", validate(weightSchema), async (req, res) => {
  const { weightKg, weightDate } = req.body;
  res.status(200).json(await svc.updateWeight(req.userId as string, weightKg, weightDate));
});

profileRouter.get("/forecast", async (req, res) => {
  const { today } = forecastQuerySchema.parse(req.query); // a ZodError becomes a 400
  res.status(200).json(await svc.forecast(req.userId as string, today));
});

profileRouter.get("/suggest", async (req, res) => {
  const { today, ...q } = suggestQuerySchema.parse(req.query);
  res.status(200).json(await svc.suggest(req.userId as string, today, q));
});