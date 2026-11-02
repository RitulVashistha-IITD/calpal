import { useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Profile } from "../api/types";
import { Button, ErrorBanner, Input, fieldClass } from "./ui";

const ACTIVITY = [
  { value: "sedentary", label: "Mostly sitting" },
  { value: "light", label: "On my feet some of the day" },
  { value: "moderate", label: "On my feet most of the day" },
] as const;

export default function ProfileForm({ initial, onSaved, onCancel }: { initial: Profile | null; onSaved: () => void; onCancel?: () => void }) {
  const [height, setHeight] = useState(initial ? String(initial.heightCm) : "");
  const [weight, setWeight] = useState(initial ? String(initial.weightKg) : "");
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
    if (!(h >= 100 && h <= 250)) return setError("Height must be between 100 and 250 cm");
    if (!(w >= 30 && w <= 300)) return setError("Weight must be between 30 and 300 kg");
    if (!Number.isInteger(a) || a < 18 || a > 90) return setError("Age must be a whole number from 18 to 90");

    setLoading(true);
    setError("");
    try {
      await api("/profile", {
        method: "PUT",
        body: { heightCm: h, weightKg: w, age: a, sex, activity, weightDate: today() },
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
        <Input label="Age" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-mist-700">Sex (for the burn formula)</span>
          <select className={fieldClass} value={sex} onChange={(e) => setSex(e.target.value as Profile["sex"])}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Prefer not to say</option>
          </select>
        </label>
        <label className="col-span-2 block">
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