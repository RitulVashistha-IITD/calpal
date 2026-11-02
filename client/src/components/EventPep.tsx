import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { today } from "../api/types";
import type { Goal } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { COACHES, MyCoach, useCoach } from "./Coach";

const ANY = [
  (e: string) => `Every logged meal is a tiny high-five to ${e}. Keep stacking them.`,
  (e: string) => `Not to be dramatic, but ${e} is going to be so good, and you're building it today.`,
  (e: string) => `Small steps, big ${e}. You've got this, and I've got the cheering.`,
  (e: string) => `Remember why you started: ${e}. Now go drink some water, hero.`,
];
const WITH_DAYS = [
  (e: string, d: number) => `${d} day${d === 1 ? "" : "s"} until ${e}. Future you is already grinning about this.`,
  (e: string, d: number) => `${e} is ${d} day${d === 1 ? "" : "s"} away and you're being consistent. Rude. Inspiring, but rude.`,
  (e: string, d: number) => `${d} day${d === 1 ? "" : "s"} to ${e}. Zero panic, maximum glow.`,
];

const ms = (s: string) => new Date(s + "T00:00:00").getTime();

export default function EventPep({ refreshKey = 0 }: { refreshKey?: number }) {
  const { user } = useAuth();
  const { prefs } = useCoach();
  const [goal, setGoal] = useState<Goal | null>(null);
  const [hidden, setHidden] = useState(false);
  const skipKey = `calpal_pep_${user?.id}`;

  useEffect(() => {
    api<Goal>("/goal").then(setGoal).catch(() => setGoal(null));
  }, [refreshKey]);

  let seen: string | null = null;
  try {
    seen = localStorage.getItem(skipKey);
  } catch {
    /* storage can be blocked; the card just shows each visit */
  }
  if (!goal?.eventLabel || hidden || seen === today()) return null;

  const e = goal.eventLabel;
  const days = goal.targetDate ? Math.round((ms(goal.targetDate) - ms(today())) / 86400000) : null;
  const coachName = COACHES.find((c) => c.kind === prefs.kind)?.name ?? "Your coach";

  let text: string;
  let past = false;
  if (days !== null && days < 0) {
    past = true;
    text = `I hope ${e} was everything you wanted. Ready to set a new goal?`;
  } else if (days === 0) {
    text = `${e} is today! You did it. Go enjoy every single second.`;
  } else {
    const seed = Number(today().replace(/-/g, ""));
    const pool: ((x: string, d: number) => string)[] = [...ANY, ...(days !== null ? WITH_DAYS : [])];
    text = pool[seed % pool.length](e, days ?? 0);
  }

  const dismiss = () => {
    try {
      localStorage.setItem(skipKey, today());
    } catch {
      /* storage can be blocked; it will show again */
    }
    setHidden(true);
  };

  return (
    <section className="pattern-sparkles flex flex-col items-center gap-4 rounded-3xl border border-blush-200 bg-white p-5 shadow-card sm:flex-row">
      <MyCoach size={64} />
      <div className="flex-1 text-center sm:text-left">
        <h2 className="font-display text-lg font-extrabold tracking-tight">A note from {coachName}</h2>
        <p className="text-sm text-mist-700">{text}</p>
      </div>
      <div className="flex gap-2">
        {past && (
          <Link to="/plan" className="rounded-xl bg-blush-500 px-4 py-2 text-sm font-bold text-white hover:bg-blush-600">
            New goal
          </Link>
        )}
        <button onClick={dismiss} className="rounded-xl bg-mist-100 px-4 py-2 text-sm font-bold text-mist-700 hover:bg-mist-200">
          Thanks
        </button>
      </div>
    </section>
  );
}