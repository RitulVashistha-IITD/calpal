import { Router } from "express";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { profileSchema, forecastQuerySchema } from "../schemas/profile";
import * as svc from "../services/profileService";

export const profileRouter = Router();
profileRouter.use(requireAuth);

profileRouter.put("/", validate(profileSchema), async (req, res) => {
  res.status(200).json(await svc.saveProfile(req.userId as string, req.body));
});

profileRouter.get("/forecast", async (req, res) => {
  const { today } = forecastQuerySchema.parse(req.query); // a ZodError becomes a 400
  res.status(200).json(await svc.forecast(req.userId as string, today));
});