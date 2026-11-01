import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  JWT_SECRET: z.string().min(32),
  // Optional, so the app still boots without it; the calorie lookup just reports "not set up"
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
});

// Crash at startup if config is wrong, instead of failing mysteriously later.
export const env = schema.parse(process.env);