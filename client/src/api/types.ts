export type EntryType = "meal" | "treat" | "workout";
export type Entry = { _id: string; type: EntryType; name: string; calories: number; date: string; notes?: string };
export type Goal = { type: "lose" | "maintain" | "gain"; dailyCalorieBudget: number; targetDate?: string; eventLabel?: string };
export type Stats = { date: string; budget: number | null; eaten: number; burned: number; remaining: number | null };
export type EntryListData = { items: Entry[]; total: number; page: number; limit: number; pages: number };

// Local date as YYYY-MM-DD (the server stores dates as plain strings, so there are no timezone surprises)
export const today = () => new Date().toLocaleDateString("en-CA");
export type Food = { _id: string; userId: string | null; name: string; calories: number; joy: number };
export type Pick = { id: string; name: string; count: number; calories: number; joy: number };
export type OptimizeResult = { budget: number; picks: Pick[]; totalCalories: number; totalJoy: number };

export type Profile = {
  heightCm: number;
  weightKg: number;
  weightDate: string;
  targetWeightKg: number | null;
  age: number;
  sex: "male" | "female" | "other";
  activity: "sedentary" | "light" | "moderate";
};
export type Scenario = {
  avgIntake: number;
  avgBurned: number;
  dailyNet: number;
  weeklyKg: number;
  projectedKg: number | null;
  daysToTarget: number | null;
};
export type Forecast = {
  ready: boolean;
  reason?: "no_profile" | "few_days";
  profile: Profile | null;
  loggedDays: number;
  daysLeft: number | null;
  eventLabel?: string | null;
  budget?: number | null;
  maintenance?: number;
  recent?: Scenario;
  onBudget?: Scenario | null;
  warnings: string[];
  goalType?: "lose" | "maintain" | "gain" | null;
  targetDate?: string | null;
  recommendation?: Recommendation;
};
export type Recommendation = {
  budget: number;
  maintenance: number;
  direction: "lose" | "maintain" | "gain";
  weeklyKg: number;
  projectedKg: number | null;
  daysToTarget: number | null;
  notes: string[];
};