import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Food, OptimizeResult, Stats } from "../api/types";
import { Button, ErrorBanner, Input, fieldClass } from "./ui";

const msg = (e: unknown, fallback: string) =>
  e instanceof ApiError ? e.message : fallback;

export default function CravingOptimizer({
  onLogged,
}: {
  onLogged: () => void;
}) {
  const [foods, setFoods] = useState<Food[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [showStarters, setShowStarters] = useState(false);
  const [budget, setBudget] = useState("300");
  const [maxPer, setMaxPer] = useState(2);
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [fName, setFName] = useState("");
  const [fCal, setFCal] = useState("");
  const [fJoy, setFJoy] = useState("7");

  const [estNote, setEstNote] = useState("");
  const [looking, setLooking] = useState(false);
  const calTouched = useRef(false); // true once the user types their own calories

  useEffect(() => {
    const q = fName.trim();
    setEstNote("");
    if (!showAdd || q.length < 3) {
      setLooking(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLooking(true);
      try {
        const r = await api<{ calories: number; serving: string }>(
          `/calories?${new URLSearchParams({ q, type: "treat" })}`,
        );
        if (cancelled) return;
        setEstNote(
          `Estimated at about ${r.calories} kcal for ${r.serving}. It's a guess, so edit it if yours differs.`,
        );
        if (!calTouched.current) setFCal(String(r.calories));
      } catch {
        /* silent: the user can always type the calories */
      } finally {
        if (!cancelled) setLooking(false);
      }
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [fName, showAdd]);

  const mine = foods.filter((f) => f.userId !== null);
  const starters = foods.filter((f) => f.userId === null);

  useEffect(() => {
    api<Food[]>("/foods")
      .then((list) => {
        setFoods(list);
        const own = list.filter((f) => f.userId !== null);
        setSelected(new Set(own.map((f) => f._id))); // only YOUR foods start selected
        if (own.length === 0) setShowStarters(true);
      })
      .catch((e) => setError(msg(e, "Could not load foods")));
  }, []);

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const useRemaining = async () => {
    try {
      const s = await api<Stats>(`/stats/daily?date=${today()}`);
      if (s.remaining === null)
        return setError("Set a goal first so I know your budget");
      setError("");
      setBudget(String(Math.min(3000, Math.max(1, s.remaining))));
    } catch (e) {
      setError(msg(e, "Could not load today's budget"));
    }
  };

  const run = async () => {
    const n = Number(budget);
    if (!Number.isInteger(n) || n < 1 || n > 3000)
      return setError("Budget must be a whole number from 1 to 3000");
    if (selected.size === 0)
      return setError(
        "Pick at least one food (add your own, or open Starter ideas)",
      );
    setLoading(true);
    setError("");
    try {
      setResult(
        await api<OptimizeResult>("/optimizer/treats", {
          method: "POST",
          body: { budget: n, maxPerItem: maxPer, foodIds: [...selected] },
        }),
      );
    } catch (e) {
      setError(msg(e, "Could not calculate"));
    } finally {
      setLoading(false);
    }
  };

  const logAll = async () => {
    if (!result) return;
    setLoading(true);
    setError("");
    try {
      for (const p of result.picks) {
        await api("/entries", {
          method: "POST",
          body: {
            type: "treat",
            name: p.count > 1 ? `${p.name} ×${p.count}` : p.name,
            calories: p.calories * p.count,
            date: today(),
          },
        });
      }
      setResult(null);
      onLogged();
    } catch (e) {
      setError(msg(e, "Could not log these"));
    } finally {
      setLoading(false);
    }
  };

  const addFood = async (e: FormEvent) => {
    e.preventDefault();
    const calories = Number(fCal);
    const joy = Number(fJoy);
    if (
      !fName.trim() ||
      !Number.isInteger(calories) ||
      calories < 1 ||
      calories > 3000 ||
      !Number.isInteger(joy) ||
      joy < 1 ||
      joy > 10
    ) {
      return setError(
        "Name, calories (1 to 3000) and joy (1 to 10) are required",
      );
    }
    try {
      const created = await api<Food>("/foods", {
        method: "POST",
        body: { name: fName.trim(), calories, joy },
      });
      setFoods((f) => [...f, created]);
      setSelected((s) => new Set(s).add(created._id));
      setFName("");
      setFCal("");
      setError("");
      setShowAdd(false);
      setFName("");
      setFCal("");
      calTouched.current = false;
      setEstNote("");
    } catch (e) {
      setError(msg(e, "Could not add food"));
    }
  };

  const chip = (f: Food) => {
    const on = selected.has(f._id);
    return (
      <button
        type="button"
        key={f._id}
        onClick={() => toggle(f._id)}
        aria-pressed={on}
        className={`rounded-xl border px-3 py-2 text-left transition ${
          on
            ? "border-blush-400 bg-blush-50"
            : "border-mist-200 bg-white hover:border-blush-300"
        }`}
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-mist-900">
          <span
            className={`h-2 w-2 rounded-full ${on ? "bg-blush-500" : "bg-mist-200"}`}
          />
          {f.name}
        </span>
        <span className="mt-0.5 block pl-4 text-xs text-mist-500">
          {f.calories} kcal, joy {f.joy}/10
        </span>
      </button>
    );
  };

  return (
    <div className="space-y-5">
      <p className="text-sm text-mist-500">
        Tap the foods you're tempted by. I'll find the mix with the most joy
        that fits your calories.
      </p>
      {error && <ErrorBanner message={error} />}

      <div>
        <p className="mb-2 text-sm font-semibold text-mist-700">Your foods</p>
        <div className="flex flex-wrap gap-2">
          {mine.map(chip)}
          {mine.length === 0 && (
            <p className="text-sm text-mist-500">
              None yet. Add your own, or pick from the starter ideas.
            </p>
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowAdd(!showAdd)}
            className="rounded-lg bg-mist-100 px-3 py-1.5 text-xs font-bold text-mist-700 hover:bg-mist-200"
          >
            {showAdd ? "Close" : "Add your own food"}
          </button>
          {starters.length > 0 && (
            <button
              type="button"
              onClick={() => setShowStarters(!showStarters)}
              className="rounded-lg bg-mist-100 px-3 py-1.5 text-xs font-bold text-mist-700 hover:bg-mist-200"
            >
              {showStarters
                ? "Hide starter ideas"
                : `Starter ideas (${starters.length})`}
            </button>
          )}
        </div>
      </div>

      {showStarters && (
        <div className="rounded-2xl bg-mist-50 p-4">
          <p className="mb-2 text-sm font-semibold text-mist-700">
            Starter ideas
          </p>
          <div className="flex flex-wrap gap-2">{starters.map(chip)}</div>
        </div>
      )}

      {showAdd && (
        <form
          onSubmit={addFood}
          noValidate
          className="grid grid-cols-3 gap-3 rounded-2xl bg-mist-50 p-4"
        >
          <div className="col-span-3">
            <Input
              label="Food"
              value={fName}
              onChange={(e) => setFName(e.target.value)}
            />
          </div>
          <Input
            label="Calories"
            type="number"
            value={fCal}
            onChange={(e) => {
              calTouched.current = true;
              setFCal(e.target.value);
            }}
          />
           
          <Input
            label="Joy (1 to 10)"
            type="number"
            value={fJoy}
            onChange={(e) => setFJoy(e.target.value)}
          />
          <div className="flex items-end">
            <Button type="submit" className="w-full">
              Save
            </Button>
          </div>
          <p className="col-span-3 min-h-4 text-xs font-medium text-mist-500">
            {looking ? "Looking up a typical value…" : estNote}
          </p>
        </form>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Calories to spend"
          type="number"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
        />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-mist-700">
            Max of each
          </span>
          <select
            value={maxPer}
            onChange={(e) => setMaxPer(Number(e.target.value))}
            className={fieldClass}
          >
            {[1, 2, 3].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button variant="soft" onClick={useRemaining} className="!py-2">
          Use what's left today
        </Button>
        <Button onClick={run} loading={loading} className="flex-1">
          Find the best mix
        </Button>
      </div>

      {result && (
        <div className="rounded-2xl bg-blush-50 p-5">
          {result.picks.length === 0 ? (
            <p className="text-center text-sm font-semibold text-mist-500">
              Nothing fits in {result.budget} kcal. Try a bigger budget.
            </p>
          ) : (
            <>
              <ul className="divide-y divide-blush-100">
                {result.picks.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between py-2 text-sm"
                  >
                    <span className="font-semibold">
                      {p.count}× {p.name}
                    </span>
                    <span className="text-mist-500">
                      {p.calories * p.count} kcal
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex items-end justify-between gap-3">
                <div>
                  <p className="font-display text-3xl font-extrabold text-blush-600">
                    {result.totalJoy} joy
                  </p>
                  <p className="text-sm text-mist-500">
                    for {result.totalCalories} kcal
                  </p>
                </div>
                <Button onClick={logAll} loading={loading}>
                  Log these as treats
                </Button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
