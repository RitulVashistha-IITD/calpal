import { describe, expect, it } from "vitest";
import { bestCombo } from "./knapsack";

describe("bestCombo", () => {
  it("beats greedy: two 5-kcal items (joy 40) over one 6-kcal item (joy 30)", () => {
    const items = [
      { id: "a", name: "A", calories: 6, joy: 30 },
      { id: "b", name: "B", calories: 5, joy: 20 },
      { id: "c", name: "C", calories: 5, joy: 20 },
    ];
    const r = bestCombo(items, 10, 1);
    expect(r.totalJoy).toBe(40);
    expect(r.totalCalories).toBe(10);
    expect(r.picks.map((p) => p.id).sort()).toEqual(["b", "c"]);
  });

  it("respects maxPerItem", () => {
    const r = bestCombo([{ id: "x", name: "X", calories: 10, joy: 5 }], 100, 2);
    expect(r.picks[0].count).toBe(2);
    expect(r.totalJoy).toBe(10);
  });

  it("returns nothing when nothing fits", () => {
    const r = bestCombo([{ id: "x", name: "X", calories: 10, joy: 9 }], 5, 2);
    expect(r.picks).toEqual([]);
    expect(r.totalJoy).toBe(0);
  });
});