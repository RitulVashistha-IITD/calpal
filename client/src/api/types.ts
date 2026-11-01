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