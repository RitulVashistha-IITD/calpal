import { z } from "zod";

const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD");

export const createEntrySchema = z.object({
  type: z.enum(["meal", "treat", "workout"]),
  name: z.string().trim().min(1).max(100),
  calories: z.number().int().min(1).max(10000),
  date,
  notes: z.string().trim().max(300).optional(),
});
export const updateEntrySchema = createEntrySchema.partial();

export const listQuerySchema = z.object({
  type: z.enum(["meal", "treat", "workout"]).optional(),
  from: date.optional(),
  to: date.optional(),
  q: z.string().trim().max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
});

export const goalSchema = z.object({
  type: z.enum(["lose", "maintain", "gain"]),
  dailyCalorieBudget: z.number().int().min(800).max(10000),
  targetDate: date.optional(),
  eventLabel: z.string().trim().max(50).optional(),
});

export const dateQuerySchema = z.object({ date });

export type CreateEntryInput = z.infer<typeof createEntrySchema>;
export type ListQuery = z.infer<typeof listQuerySchema>;