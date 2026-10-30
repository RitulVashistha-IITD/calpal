export type FoodOption = { id: string; name: string; calories: number; joy: number };
export type Pick = { id: string; name: string; count: number; calories: number; joy: number };
export type Combo = { picks: Pick[]; totalCalories: number; totalJoy: number };

export function bestCombo(items: FoodOption[], budget: number, maxPerItem: number): Combo {
  const units: FoodOption[] = [];
  for (const item of items) for (let c = 0; c < maxPerItem; c++) units.push(item);

  const n = units.length;
  const width = budget + 1;
  const dp = new Int32Array((n + 1) * width);

  for (let i = 1; i <= n; i++) {
    const { calories, joy } = units[i - 1];
    for (let w = 0; w <= budget; w++) {
      const skip = dp[(i - 1) * width + w];
      const take = calories <= w ? dp[(i - 1) * width + (w - calories)] + joy : -1;
      dp[i * width + w] = Math.max(skip, take);
    }
  }

  const byId = new Map<string, Pick>();
  let w = budget;
  for (let i = n; i >= 1; i--) {
    if (dp[i * width + w] !== dp[(i - 1) * width + w]) {
      const unit = units[i - 1];
      const pick = byId.get(unit.id) ?? { ...unit, count: 0 };
      pick.count += 1;
      byId.set(unit.id, pick);
      w -= unit.calories;
    }
  }

  const picks = [...byId.values()];
  return {
    picks,
    totalCalories: picks.reduce((s, p) => s + p.calories * p.count, 0),
    totalJoy: dp[n * width + budget],
  };
}