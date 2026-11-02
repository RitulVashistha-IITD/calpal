import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Forecast } from "../api/types";
import { ErrorBanner } from "./ui";

const card = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";

function dateIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function WeightPlan({ refreshKey }: { refreshKey: number }) {
  const [f, setF] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      setF(await api<Forecast>(`/profile/forecast?today=${today()}`));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not load your forecast");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, refreshKey]);

  if (loading) return <section className={`${card} text-center text-sm font-semibold text-mist-500`}>Loading your forecast…</section>;
  if (error) return <section className={card}><ErrorBanner message={error} /></section>;
  if (!f) return null;

  if (!f.profile) {
    return (
      <section className={`${card} pattern-sparkles`}>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">Weight forecast</h2>
        <p className="mt-1 max-w-md text-sm text-mist-500">I need your body stats to estimate how many calories you burn.</p>
        <Link to="/profile" className="mt-5 inline-block rounded-xl bg-blush-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-blush-600">
          Add my body stats
        </Link>
      </section>
    );
  }

  const p = f.profile;
  const r = f.recent;
  const eventName = f.eventLabel || "your event";
  const change = r && r.projectedKg !== null ? Math.round((r.projectedKg - p.weightKg) * 10) / 10 : null;

  return (
    <section className={card}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Weight forecast</h2>
          <p className="mt-1 text-sm text-mist-500">
            Now {p.weightKg} kg, weighed {p.weightDate === today() ? "today" : `on ${p.weightDate}`}
          </p>
        </div>
        <Link to="/profile" className="rounded-lg px-2 py-1 text-sm font-semibold text-mist-500 hover:bg-mist-100 hover:text-mist-700">
          Update weight
        </Link>
      </div>

      {!f.ready || !r ? (
        <p className="mt-5 rounded-2xl bg-mist-50 p-4 text-sm font-semibold text-mist-700">
          Log your food on at least 3 days and I'll show your pace. You have {f.loggedDays} in the last week.
        </p>
      ) : (
        <div className="mt-5 grid gap-6 md:grid-cols-2">
          <div>
            {r.projectedKg !== null && change !== null ? (
              <>
                <p className="font-display text-5xl font-extrabold tracking-tight">{r.projectedKg} kg</p>
                <p className="mt-1 text-sm font-semibold text-mist-500">
                  expected by {eventName}, in {f.daysLeft} day{f.daysLeft === 1 ? "" : "s"}.{" "}
                  {change < 0 ? `${-change} kg lost` : change > 0 ? `${change} kg gained` : "No change"} from now.
                </p>
              </>
            ) : (
              <>
                <p className="font-display text-5xl font-extrabold tracking-tight">
                  {r.weeklyKg > 0 ? "+" : r.weeklyKg < 0 ? "−" : ""}{Math.abs(r.weeklyKg)} kg
                </p>
                <p className="mt-1 text-sm font-semibold text-mist-500">per week at your recent pace. Set a future date in your goal to see a projection.</p>
              </>
            )}
          </div>

          <ul className="space-y-3 text-sm">
            <li className="flex justify-between gap-4 border-b border-mist-100 pb-3">
              <span className="text-mist-500">Your recent pace ({f.loggedDays} logged days)</span>
              <span className="text-right font-semibold">{r.avgIntake} eaten, {r.avgBurned} burned a day</span>
            </li>
            <li className="flex justify-between gap-4 border-b border-mist-100 pb-3">
              <span className="text-mist-500">Rate</span>
              <span className="font-semibold">{r.weeklyKg > 0 ? "+" : r.weeklyKg < 0 ? "−" : ""}{Math.abs(r.weeklyKg)} kg a week</span>
            </li>
            {f.onBudget && f.onBudget.projectedKg !== null && (
              <li className="flex justify-between gap-4 border-b border-mist-100 pb-3">
                <span className="text-mist-500">If you stick to {f.budget} kcal</span>
                <span className="font-semibold">{f.onBudget.projectedKg} kg by then</span>
              </li>
            )}
            {p.targetWeightKg !== null && (
              <li className="flex justify-between gap-4 border-b border-mist-100 pb-3">
                <span className="text-mist-500">Reaching {p.targetWeightKg} kg</span>
                <span className="font-semibold">
                  {r.daysToTarget === null ? "Not at this pace" : r.daysToTarget === 0 ? "Already there" : `Around ${dateIn(r.daysToTarget)}`}
                </span>
              </li>
            )}
            <li className="flex justify-between gap-4">
              <span className="text-mist-500">You burn about</span>
              <span className="font-semibold">{f.maintenance} kcal a day before workouts</span>
            </li>
          </ul>
        </div>
      )}

      {f.warnings.length > 0 && (
        <div className="mt-5 space-y-2">
          {f.warnings.map((w) => (
            <p key={w} className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-700">{w}</p>
          ))}
        </div>
      )}

      <p className="mt-5 text-xs text-mist-500">
        A rough estimate. It uses a standard burn formula and 7,700 kcal per kg, and it skips days you didn't log, so log everything for an honest pace. Real results vary.
      </p>
    </section>
  );
}