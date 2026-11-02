import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Profile } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { MyCoach } from "./Coach";
import { Button, ErrorBanner, fieldClass } from "./ui";

export type Reminder = "daily" | "weekly" | "off";
const OPTIONS: { value: Reminder; label: string }[] = [
  { value: "daily", label: "Every day" },
  { value: "weekly", label: "Once a week" },
  { value: "off", label: "Never" },
];

const ms = (d: string) => new Date(d + "T00:00:00").getTime();

function read(k: string) {
  try {
    return localStorage.getItem(k);
  } catch {
    return null;
  }
}
function write(k: string, v: string) {
  try {
    localStorage.setItem(k, v);
  } catch {
    /* storage can be blocked; the choice just won't persist */
  }
}

export function getReminder(userId?: string): Reminder {
  const v = read(`calpal_reminder_${userId}`);
  return v === "weekly" || v === "off" ? v : "daily";
}

export function WeighInForm({ current, onSaved }: { current: number; onSaved: () => void }) {
  const [kg, setKg] = useState(String(current));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const w = Number(kg);
    if (!(w >= 30 && w <= 300)) return setError("Weight must be between 30 and 300 kg");
    setLoading(true);
    setError("");
    try {
      await api("/profile/weight", { method: "PATCH", body: { weightKg: w, weightDate: today() } });
      onSaved();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save your weight");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-2">
      {error && <ErrorBanner message={error} />}
      <div className="flex items-center gap-2">
        <input type="number" step="0.1" value={kg} onChange={(e) => setKg(e.target.value)} aria-label="Weight in kg" className={`${fieldClass} !w-28`} />
        <span className="text-sm font-semibold text-mist-500">kg</span>
        <Button type="submit" loading={loading}>Save weight</Button>
      </div>
    </form>
  );
}

export function ReminderSetting() {
  const { user } = useAuth();
  const [v, setV] = useState<Reminder>(getReminder(user?.id));
  const pick = (r: Reminder) => {
    setV(r);
    write(`calpal_reminder_${user?.id}`, r);
  };
  return (
    <div>
      <p className="text-sm font-semibold text-mist-700">Remind me to weigh in</p>
      <div className="mt-2 inline-flex rounded-xl bg-mist-100 p-1 text-sm font-semibold">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            onClick={() => pick(o.value)}
            aria-pressed={v === o.value}
            className={`rounded-lg px-4 py-2 transition ${v === o.value ? "bg-white text-blush-600 shadow-sm" : "text-mist-500 hover:text-mist-700"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mt-2 text-xs text-mist-500">Reminders show up when you open CalPal. Daily weights bounce around from water and food, so weekly is steadier.</p>
    </div>
  );
}

export function WeighInNudge({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [hidden, setHidden] = useState(false);
  const skipKey = `calpal_weighin_skip_${user?.id}`;

  useEffect(() => {
    api<Profile>("/profile").then(setProfile).catch(() => setProfile(null));
  }, [refreshKey]);

  if (!profile || hidden) return null;
  const freq = getReminder(user?.id);
  if (freq === "off" || read(skipKey) === today()) return null;
  const days = Math.round((ms(today()) - ms(profile.weightDate)) / 86400000);
  if (freq === "daily" ? days < 1 : days < 7) return null;

  return (
    <section className="pattern-sparkles flex flex-col items-center gap-4 rounded-3xl border border-blush-200 bg-white p-5 shadow-card sm:flex-row">
      <MyCoach size={64} />
      <div className="flex-1 text-center sm:text-left">
        <h2 className="font-display text-lg font-extrabold tracking-tight">Quick weigh-in?</h2>
        <p className="text-sm text-mist-500">
          Last time was {days} day{days === 1 ? "" : "s"} ago ({profile.weightKg} kg). Updating keeps your forecast honest.
        </p>
      </div>
      <div className="flex flex-col items-center gap-2 sm:items-end">
        <WeighInForm current={profile.weightKg} onSaved={() => setHidden(true)} />
        <button
          onClick={() => { write(skipKey, today()); setHidden(true); }}
          className="rounded-lg px-2 py-1 text-xs font-semibold text-mist-500 hover:bg-mist-100"
        >
          Not today
        </button>
      </div>
    </section>
  );
}