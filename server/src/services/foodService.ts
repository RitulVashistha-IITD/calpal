import { FoodItem } from "../models/FoodItem";
import { AppError } from "../middleware/errorHandler";
import { bestCombo } from "./knapsack";
import { CreateFoodInput, OptimizeInput } from "../schemas/foods";

export const listFoods = (userId: string) =>
  FoodItem.find({ $or: [{ userId: null }, { userId }] }).sort({ name: 1 });

export const createFood = (userId: string, input: CreateFoodInput) =>
  FoodItem.create({ ...input, userId });

export async function optimize(userId: string, input: OptimizeInput) {
  const foods = await listFoods(userId);
  const allowed = input.foodIds ? new Set(input.foodIds) : null;
  const items = foods
    .filter((f) => !allowed || allowed.has(f.id))
    .map((f) => ({ id: f.id, name: f.name, calories: f.calories, joy: f.joy }));
  if (items.length === 0) throw new AppError(400, "No foods to choose from");
  return { budget: input.budget, ...bestCombo(items, input.budget, input.maxPerItem) };
}