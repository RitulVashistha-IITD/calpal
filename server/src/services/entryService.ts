import { isValidObjectId } from "mongoose";
import { Entry } from "../models/Entry";
import { Goal } from "../models/Goal";
import { AppError } from "../middleware/errorHandler";
import { CreateEntryInput, ListQuery } from "../schemas/entries";

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function assertId(id: string) {
  if (!isValidObjectId(id)) throw new AppError(404, "Entry not found");
}

export async function listEntries(userId: string, query: ListQuery) {
  const filter: Record<string, unknown> = { userId }; // ALWAYS scope by user
  if (query.type) filter.type = query.type;
  if (query.from || query.to) {
    filter.date = {
      ...(query.from && { $gte: query.from }),
      ...(query.to && { $lte: query.to }),
    };
  }
  if (query.q) filter.name = { $regex: escapeRegex(query.q), $options: "i" };

  const [items, total] = await Promise.all([
    Entry.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip((query.page - 1) * query.limit)
      .limit(query.limit),
    Entry.countDocuments(filter),
  ]);
  return { items, total, page: query.page, limit: query.limit, pages: Math.ceil(total / query.limit) };
}

export const createEntry = (userId: string, input: CreateEntryInput) =>
  Entry.create({ ...input, userId });

export async function updateEntry(userId: string, id: string, input: Partial<CreateEntryInput>) {
  assertId(id);
  const entry = await Entry.findOneAndUpdate({ _id: id, userId }, input, {
    new: true,
    runValidators: true,
  });
  if (!entry) throw new AppError(404, "Entry not found");
  return entry;
}

export async function deleteEntry(userId: string, id: string) {
  assertId(id);
  const result = await Entry.deleteOne({ _id: id, userId });
  if (result.deletedCount === 0) throw new AppError(404, "Entry not found");
}

export async function dailyStats(userId: string, date: string) {
  const [entries, goal] = await Promise.all([
    Entry.find({ userId, date }),
    Goal.findOne({ userId }),
  ]);
  let eaten = 0;
  let burned = 0;
  for (const e of entries) {
    if (e.type === "workout") burned += e.calories;
    else eaten += e.calories;
  }
  const budget = goal?.dailyCalorieBudget ?? null;
  return { date, budget, eaten, burned, remaining: budget === null ? null : budget - eaten + burned };
}

export const getGoal = (userId: string) => Goal.findOne({ userId });

export const saveGoal = (userId: string, input: object) =>
  Goal.findOneAndUpdate({ userId }, { ...input, userId }, { new: true, upsert: true, runValidators: true });