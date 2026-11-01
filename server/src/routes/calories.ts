import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";
import { estimateCalories } from "../services/calorieService";

const querySchema = z.object({
  q: z.string().trim().min(2).max(60),
  type: z.enum(["meal", "treat", "workout"]).default("meal"),
});

// Stricter than the general limiter: every call here spends your free Gemini quota
const caloriesLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 15,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many lookups. Try again in a minute." },
});

export const caloriesRouter = Router();
caloriesRouter.use(requireAuth, caloriesLimiter);
caloriesRouter.get("/", async (req, res) => {
  const { q, type } = querySchema.parse(req.query); // a ZodError becomes a 400 in errorHandler
  res.status(200).json(await estimateCalories(q, type));
});