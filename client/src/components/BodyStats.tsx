import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Profile } from "../api/types";
import ProfileForm from "./ProfileForm";
import { WeighInForm } from "./WeighIn";
import BmiLine, { BMI_NOTE } from "./BmiLine";
import { healthyKg } from "../bmi";

const card = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";
const SEX = { female: "Female", male: "Male", other: "Prefer not to say" } as const;
const ACTIVITY = { sedentary: "Mostly sitting", light: "On my feet some of the day", moderate: "On my feet most of the day" } as const;

export default function BodyStats() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const load = useCallback(() => {
    api<Profile>("/profile")
      .then(setProfile)
      .catch((e) => { if (e instanceof ApiError && e.status === 404) setProfile(null); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <section className={`${card} text-center text-sm font-semibold text-mist-500`}>Loading…</section>;

  if (!profile || editing) {
    return (
      <section className={card}>
        <h2 className="font-display text-xl font-extrabold tracking-tight">{profile ? "Edit your body stats" : "Add your body stats"}</h2>
        <p className="mt-1 text-sm text-mist-500">Used to estimate how many calories you burn, so your budget and forecast fit your body.</p>
        <ProfileForm initial={profile} onSaved={() => { setEditing(false); load(); }} onCancel={profile ? () => setEditing(false) : undefined} />
      </section>
    );
  }

  const days = Math.round((new Date(today() + "T00:00:00").getTime() - new Date(profile.weightDate + "T00:00:00").getTime()) / 86400000);

  return (
    <section className={card}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-extrabold tracking-tight">Body stats</h2>
          <p className="mt-1 text-sm text-mist-500">
            Weight updated {days === 0 ? "today" : `${days} day${days === 1 ? "" : "s"} ago`}
          </p>
        </div>
        <button onClick={() => setEditing(true)} className="rounded-lg px-2 py-1 text-sm font-semibold text-mist-500 hover:bg-mist-100 hover:text-mist-700">
          Edit all
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-blush-50 p-4">
        <p className="text-sm font-semibold text-mist-700">Update your weight</p>
        <div className="mt-2">
          <WeighInForm key={profile.weightKg} current={profile.weightKg} onSaved={load} />
        </div>
      </div>
      <div className="mt-4 space-y-1.5 rounded-2xl bg-mist-50 p-4">
        <BmiLine label="Your BMI" kg={profile.weightKg} cm={profile.heightCm} />
        <p className="text-xs text-mist-500">
          Healthy range for your height: {healthyKg(profile.heightCm)[0]} to {healthyKg(profile.heightCm)[1]} kg (BMI 18.5 to 24.9). {BMI_NOTE}
        </p>
      </div>
      <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 text-sm sm:grid-cols-4">
        {[
          ["Height", `${profile.heightCm} cm`],
          ["Age", String(profile.age)],
          ["Sex", SEX[profile.sex]],
          ["Daily activity", ACTIVITY[profile.activity]],
        ].map(([k, v]) => (
          <div key={k}>
            <dt className="text-xs font-semibold text-mist-500">{k}</dt>
            <dd className="font-semibold">{v}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}