import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const profileSchema = z.object({
  heightCm: z.number().min(100).max(250),
  weightKg: z.number().min(30).max(300),
  targetWeightKg: z.number().min(30).max(300).optional(),
  age: z.number().int().min(18).max(90),
  sex: z.enum(["male", "female", "other"]),
  activity: z.enum(["sedentary", "light", "moderate"]),
  weightDate: date,
});

// The client sends its own local "today", so the server's timezone never matters
export const forecastQuerySchema = z.object({ today: date });

export type ProfileInput = z.infer<typeof profileSchema>;