import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Forecast, Profile } from "../api/types";
import { Button, ErrorBanner, Input, fieldClass } from "./ui";
import BudgetAdvice from "./BudgetAdvice";

const card = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";

const ACTIVITY = [
  { value: "sedentary", label: "Mostly sitting" },
  { value: "light", label: "On my feet some of the day" },
  { value: "moderate", label: "On my feet most of the day" },
] as const;

function dateIn(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function ProfileForm({ initial, onSaved, onCancel }: { initial: Profile | null; onSaved: () => void; onCancel?: () => void }) {
  const [height, setHeight] = useState(initial ? String(initial.heightCm) : "");
  const [weight, setWeight] = useState(initial ? String(initial.weightKg) : "");
  const [target, setTarget] = useState(initial?.targetWeightKg ? String(initial.targetWeightKg) : "");
  const [age, setAge] = useState(initial ? String(initial.age) : "");
  const [sex, setSex] = useState<Profile["sex"]>(initial?.sex ?? "female");
  const [activity, setActivity] = useState<Profile["activity"]>(initial?.activity ?? "light");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const h = Number(height);
    const w = Number(weight);
    const a = Number(age);
    const t = target.trim() === "" ? null : Number(target);
    if (!(h >= 100 && h <= 250)) return setError("Height must be between 100 and 250 cm");
    if (!(w >= 30 && w <= 300)) return setError("Weight must be between 30 and 300 kg");
    if (!Number.isInteger(a) || a < 18 || a > 90) return setError("Age must be a whole number from 18 to 90");
    if (t !== null && !(t >= 30 && t <= 300)) return setError("Target weight must be between 30 and 300 kg");

    setLoading(true);
    setError("");
    try {
      await api("/profile", {
        method: "PUT",
        body: { heightCm: h, weightKg: w, ...(t !== null && { targetWeightKg: t }), age: a, sex, activity, weightDate: today() },
      });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="mt-5 max-w-xl space-y-4">
      {error && <ErrorBanner message={error} />}
      <div className="grid grid-cols-2 gap-3">
        <Input label="Height (cm)" type="number" step="0.1" value={height} onChange={(e) => setHeight(e.target.value)} />
        <Input label="Weight now (kg)" type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} />
        <Input label="Target weight (kg, optional)" type="number" step="0.1" value={target} onChange={(e) => setTarget(e.target.value)} />
        <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-mist-700">Sex (for the burn formula)</span>
          <select className={fieldClass} value={sex} onChange={(e) => setSex(e.target.value as Profile["sex"])}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Prefer not to say</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-mist-700">Daily activity</span>
          <select className={fieldClass} value={activity} onChange={(e) => setActivity(e.target.value as Profile["activity"])}>
            {ACTIVITY.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
          </select>
        </label>
      </div>
      <p className="text-xs text-mist-500">Activity means your normal day, not counting the workouts you log. Those are added separately.</p>
      <div className="flex gap-2">
        <Button type="submit" loading={loading}>Save</Button>
        {onCancel && <Button variant="soft" type="button" onClick={onCancel}>Cancel</Button>}
      </div>
    </form>
  );
}

export default function WeightPlan({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const [f, setF] = useState<Forecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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

  if (!f.profile || editing) {
    return (
      <section className={card}>
        <h2 className="font-display text-2xl font-extrabold tracking-tight">{f.profile ? "Edit your body stats" : "Add your body stats"}</h2>
        <p className="mt-1 max-w-xl text-sm text-mist-500">
          Used only to estimate how many calories you burn each day, so I can forecast your weight from what you log. Saved on your account.
        </p>
        <ProfileForm
          initial={f.profile}
          onSaved={() => { setEditing(false); load(); }}
          onCancel={f.profile ? () => setEditing(false) : undefined}
        />
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
        <button onClick={() => setEditing(true)} className="rounded-lg px-2 py-1 text-sm font-semibold text-mist-500 hover:bg-mist-100 hover:text-mist-700">
          Edit stats
        </button>
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
                <p className="mt-1 text-sm font-semibold text-mist-500">per week at your recent pace. Set a future event date in your goal to see a projection.</p>
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

      <BudgetAdvice f={f} onApplied={() => { onChanged(); load(); }} />

      <p className="mt-5 text-xs text-mist-500">
        A rough estimate. It uses a standard burn formula and 7,700 kcal per kg, and it skips days you didn't log, so log everything for an honest pace. Real results vary.
      </p>
    </section>
  );
}