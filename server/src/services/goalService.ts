import { Goal } from "../models/Goal";
import { Profile } from "../models/Profile";

type GoalInput = {
  type: "lose" | "maintain" | "gain";
  dailyCalorieBudget: number;
  targetWeightKg?: number;
  targetDate?: string;
  eventLabel?: string;
};

export async function getGoal(userId: string) {
  const goal = await Goal.findOne({ userId });
  if (!goal) return null;
  const out = goal.toObject();
  // Older accounts kept the target weight with the body stats; show it until the goal is saved again
  if (out.targetWeightKg === undefined || out.targetWeightKg === null) {
    const p = await Profile.findOne({ userId }).select("targetWeightKg");
    if (p?.targetWeightKg) out.targetWeightKg = p.targetWeightKg;
  }
  return out;
}

export async function saveGoal(userId: string, input: GoalInput) {
  const { type, dailyCalorieBudget, targetWeightKg, targetDate, eventLabel } = input;
  const set: Record<string, unknown> = { userId, type, dailyCalorieBudget };
  const unset: Record<string, 1> = {};

  // Optional fields: a missing value means "clear it", which a plain update can't do
  if (targetWeightKg !== undefined) set.targetWeightKg = targetWeightKg;
  else unset.targetWeightKg = 1;
  if (targetDate !== undefined) set.targetDate = targetDate;
  else unset.targetDate = 1;
  if (eventLabel) set.eventLabel = eventLabel;
  else unset.eventLabel = 1;

  const goal = await Goal.findOneAndUpdate(
    { userId },
    { $set: set, $unset: unset },
    { new: true, upsert: true, runValidators: true }
  );
  // The target now lives on the goal, so drop the old copy on the body stats
  await Profile.updateOne({ userId }, { $unset: { targetWeightKg: 1 } });
  return goal;
}