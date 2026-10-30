import { z } from "zod";

export const createFoodSchema = z.object({
  name: z.string().trim().min(1).max(60),
  calories: z.number().int().min(1).max(3000),
  joy: z.number().int().min(1).max(10),
});

export const optimizeSchema = z.object({
  budget: z.number().int().min(1).max(3000),
  maxPerItem: z.number().int().min(1).max(3).default(2),
  foodIds: z.array(z.string()).max(200).optional(),
});

export type CreateFoodInput = z.infer<typeof createFoodSchema>;
export type OptimizeInput = z.infer<typeof optimizeSchema>;