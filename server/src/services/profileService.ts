import { Entry } from "../models/Entry";
import { Goal } from "../models/Goal";
import { Profile } from "../models/Profile";
import { ProfileInput } from "../schemas/profile";

const KCAL_PER_KG = 7700;
// Lifestyle factors that EXCLUDE the workouts the user logs (those are added separately)
const FACTOR = { sedentary: 1.2, light: 1.375, moderate: 1.55 } as const;
const SEX_OFFSET = { male: 5, female: -161, other: -78 } as const;

type Body = {
  heightCm: number;
  age: number;
  sex: keyof typeof SEX_OFFSET;
  activity: keyof typeof FACTOR;
};

const round1 = (n: number) => Math.round(n * 10) / 10;
const ms = (d: string) => new Date(d + "T00:00:00").getTime();
const diffDays = (from: string, to: string) =>
  Math.round((ms(to) - ms(from)) / 86400000);
function addDays(d: string, n: number) {
  const x = new Date(d + "T00:00:00");
  x.setDate(x.getDate() + n);
  return x.toLocaleDateString("en-CA");
}

// Mifflin-St Jeor resting burn, then the lifestyle factor
const bmr = (kg: number, b: Body) =>
  10 * kg + 6.25 * b.heightCm - 5 * b.age + SEX_OFFSET[b.sex];
const maintenance = (kg: number, b: Body) => bmr(kg, b) * FACTOR[b.activity];

function simulate(
  startKg: number,
  b: Body,
  intake: number,
  burn: number,
  days: number,
) {
  let kg = startKg;
  for (let i = 0; i < days; i++)
    kg += (intake - (maintenance(kg, b) + burn)) / KCAL_PER_KG;
  return kg;
}

function daysToReach(
  startKg: number,
  targetKg: number,
  b: Body,
  intake: number,
  burn: number,
) {
  if (startKg === targetKg) return 0;
  const down = targetKg < startKg;
  let kg = startKg;
  for (let i = 1; i <= 730; i++) {
    kg += (intake - (maintenance(kg, b) + burn)) / KCAL_PER_KG;
    if (down ? kg <= targetKg : kg >= targetKg) return i;
  }
  return null; // not within two years at this pace
}

function scenario(
  kg: number,
  b: Body,
  intake: number,
  burn: number,
  daysLeft: number | null,
  targetKg: number | null,
) {
  const dailyNet = intake - (maintenance(kg, b) + burn);
  return {
    avgIntake: Math.round(intake),
    avgBurned: Math.round(burn),
    dailyNet: Math.round(dailyNet),
    weeklyKg: round1((dailyNet * 7) / KCAL_PER_KG),
    projectedKg:
      daysLeft === null
        ? null
        : round1(simulate(kg, b, intake, burn, daysLeft)),
    daysToTarget:
      targetKg === null ? null : daysToReach(kg, targetKg, b, intake, burn),
  };
}

const MIN_INTAKE = { male: 1500, female: 1200, other: 1350 } as const;

function recommend(
  kg: number,
  b: Body,
  targetKg: number | null,
  daysLeft: number | null,
  goalType: "lose" | "maintain" | "gain" | null,
) {
  const maint = maintenance(kg, b);
  const notes: string[] = [];
  const bmi = (w: number) => w / (b.heightCm / 100) ** 2;

  let direction: "lose" | "maintain" | "gain" =
    targetKg !== null
      ? Math.abs(targetKg - kg) < 0.5
        ? "maintain"
        : targetKg < kg
          ? "lose"
          : "gain"
      : (goalType ?? "maintain");

  if (direction === "lose" && bmi(kg) < 18.5) {
    direction = "maintain";
    notes.push(
      "Your current weight is already in the underweight range, so I'm suggesting a maintenance budget instead of a deficit. Please talk to a doctor before trying to lose weight.",
    );
  }
  if (targetKg !== null && bmi(targetKg) < 18.5) {
    notes.push(
      "Your target weight is below the healthy BMI range (18.5 and up). Consider a higher target.",
    );
  }

  if (direction === "maintain") {
    const budget = Math.round(maint / 10) * 10;
    return {
      budget,
      maintenance: Math.round(maint),
      direction,
      weeklyKg: 0,
      projectedKg:
        daysLeft === null ? null : round1(simulate(kg, b, budget, 0, daysLeft)),
      daysToTarget: null as number | null,
      notes,
    };
  }

  const maxWeekly = direction === "lose" ? Math.min(1, kg * 0.01) : 0.5;
  let weekly = direction === "lose" ? 0.5 : 0.25;
  if (targetKg !== null && daysLeft !== null && daysLeft > 0) {
    const needed = (Math.abs(targetKg - kg) / daysLeft) * 7;
    weekly = Math.min(needed, maxWeekly);
    if (needed > maxWeekly) {
      notes.push(
        `Reaching ${targetKg} kg by your date needs about ${round1(needed)} kg a week, faster than the safe limit of about ${round1(maxWeekly)} kg. This budget keeps to the safe pace instead.`,
      );
    }
  }

  const daily = (weekly * KCAL_PER_KG) / 7;
  let intake = direction === "lose" ? maint - daily : maint + daily;
  const floor =
    direction === "lose" ? Math.max(MIN_INTAKE[b.sex], bmr(kg, b)) : 0;
  if (direction === "lose" && intake < floor) {
    intake = floor;
    notes.push(
      "I kept this at a safe minimum for your body, so the pace is slower than the target would need.",
    );
  }
  const budget = Math.max(
    Math.round(intake / 10) * 10,
    Math.ceil(floor / 10) * 10,
  );

  return {
    budget,
    maintenance: Math.round(maint),
    direction,
    weeklyKg: round1(((budget - maint) * 7) / KCAL_PER_KG),
    projectedKg:
      daysLeft === null ? null : round1(simulate(kg, b, budget, 0, daysLeft)),
    daysToTarget:
      targetKg === null ? null : daysToReach(kg, targetKg, b, budget, 0),
    notes,
  };
}

export async function saveProfile(userId: string, input: ProfileInput) {
  const existing = await Profile.findOne({ userId });
  // Only move the weigh-in date when the weight itself changed
  const weightDate =
    existing && existing.weightKg === input.weightKg
      ? existing.weightDate
      : input.weightDate;
  const { targetWeightKg, ...rest } = input;
  return Profile.findOneAndUpdate(
    { userId },
    {
      $set: {
        ...rest,
        weightDate,
        userId,
        ...(targetWeightKg !== undefined && { targetWeightKg }),
      },
      ...(targetWeightKg === undefined && { $unset: { targetWeightKg: 1 } }),
    },
    { new: true, upsert: true, runValidators: true },
  );
}

export async function forecast(userId: string, today: string) {
  const [profile, goal] = await Promise.all([
    Profile.findOne({ userId }),
    Goal.findOne({ userId }),
  ]);
  if (!profile) {
    return {
      ready: false,
      reason: "no_profile",
      profile: null,
      loggedDays: 0,
      daysLeft: null,
      warnings: [] as string[],
    };
  }

  const body: Body = {
    heightCm: profile.heightCm,
    age: profile.age,
    sex: profile.sex as Body["sex"],
    activity: profile.activity as Body["activity"],
  };
  const kg = profile.weightKg;
  const targetKg = profile.targetWeightKg ?? null;

  // The last 7 COMPLETED days (today is unfinished, so it's left out)
  const entries = await Entry.find({
    userId,
    date: { $gte: addDays(today, -7), $lte: addDays(today, -1) },
  });
  const perDay = new Map<string, { eaten: number; burned: number }>();
  for (const e of entries) {
    const d = perDay.get(e.date) ?? { eaten: 0, burned: 0 };
    if (e.type === "workout") d.burned += e.calories;
    else d.eaten += e.calories;
    perDay.set(e.date, d);
  }
  // A day with no food logged is "missing", not "zero calories"
  const logged = [...perDay.values()].filter((d) => d.eaten > 0);

  const daysLeft = goal?.targetDate
    ? Math.max(0, diffDays(today, goal.targetDate))
    : null;
  const warnings: string[] = [];
  const stale = diffDays(profile.weightDate, today);
  if (stale > 14)
    warnings.push(
      `Your weight was last updated ${stale} days ago. Update it to keep the forecast useful.`,
    );

  const base = {
    profile: {
      heightCm: profile.heightCm,
      weightKg: kg,
      weightDate: profile.weightDate,
      targetWeightKg: targetKg,
      age: profile.age,
      sex: profile.sex,
      activity: profile.activity,
    },
    loggedDays: logged.length,
    daysLeft,
    eventLabel: goal?.eventLabel ?? null,
    budget: goal?.dailyCalorieBudget ?? null,
    maintenance: Math.round(maintenance(kg, body)),
    goalType: goal?.type ?? null,
    targetDate: goal?.targetDate ?? null,
    recommendation: recommend(kg, body, targetKg, daysLeft, (goal?.type as "lose" | "maintain" | "gain" | undefined) ?? null),
    warnings,
  };

  if (logged.length < 3) return { ...base, ready: false, reason: "few_days" };

  const avgIntake = logged.reduce((s, d) => s + d.eaten, 0) / logged.length;
  const avgBurned = logged.reduce((s, d) => s + d.burned, 0) / logged.length;

  const recent = scenario(kg, body, avgIntake, avgBurned, daysLeft, targetKg);
  const onBudget = goal
    ? scenario(kg, body, goal.dailyCalorieBudget, avgBurned, daysLeft, targetKg)
    : null;

  if (avgIntake < bmr(kg, body)) {
    warnings.push(
      "Your logged intake is below your estimated resting burn. If that's real, it's too low to sustain. If you skip logging some meals, the forecast overstates weight loss.",
    );
  }
  if (Math.abs(recent.weeklyKg) > 1) {
    warnings.push(
      "That pace is faster than the 0.5 to 1 kg a week that's usually sustainable.",
    );
  }

  return { ...base, ready: true, recent, onBudget };
}
