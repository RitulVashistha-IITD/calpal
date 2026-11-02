import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import type { EntryType } from "../api/types";
import { Button, ErrorBanner, Input } from "./ui";

const TYPES: { value: EntryType; label: string }[] = [
  { value: "meal", label: "Meal" },
  { value: "treat", label: "Treat" },
  { value: "workout", label: "Workout" },
];

type Estimate = { calories: number; serving: string };

export default function EntryForm({ onCreated, day }: { onCreated: () => void; day: string }) {
  const [type, setType] = useState<EntryType>("meal");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState(day);
  useEffect(() => { setDate(day); }, [day]); // follow the day switcher
  const [errors, setErrors] = useState<{ name?: string; calories?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [looking, setLooking] = useState(false);
  const [lookupNote, setLookupNote] = useState("");
  const calTouched = useRef(false); // true once the user types their own number
  const cacheRef = useRef(new Map<string, Estimate>()); // repeated names cost nothing

  useEffect(() => {
    const q = name.trim();
    setEstimate(null);
    setLookupNote("");
    if (q.length < 3) {
      setLooking(false);
      return;
    }
    const key = `${type}:${q.toLowerCase()}`;
    const hit = cacheRef.current.get(key);
    if (hit) {
      setEstimate(hit);
      if (!calTouched.current) setCalories(String(hit.calories));
      setLooking(false);
      return;
    }
    let cancelled = false; // ignore answers for names the user has since changed
    const timer = setTimeout(async () => {
      setLooking(true);
      try {
        const r = await api<Estimate>(`/calories?${new URLSearchParams({ q, type })}`);
        if (cancelled) return;
        cacheRef.current.set(key, r);
        setEstimate(r);
        if (!calTouched.current) setCalories(String(r.calories));
      } catch (e) {
        if (!cancelled) setLookupNote(e instanceof ApiError ? e.message : "Couldn't estimate this one. You can type the calories yourself.");
      } finally {
        if (!cancelled) setLooking(false);
      }
    }, 900);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [name, type]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    const found: typeof errors = {};
    if (!name.trim()) found.name = "Give it a name";
    const n = Number(calories);
    if (!Number.isInteger(n) || n < 1 || n > 10000) found.calories = "Whole number, 1 to 10000";
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      await api("/entries", { method: "POST", body: { type, name: name.trim(), calories: n, date } });
      setName("");
      setCalories("");
      setEstimate(null);
      setLookupNote("");
      calTouched.current = false;
      onCreated();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {formError && <ErrorBanner message={formError} />}

      <div className="grid grid-cols-3 gap-1 rounded-xl bg-mist-100 p-1">
        {TYPES.map((t) => (
          <button
            type="button"
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-lg py-2 text-sm font-semibold transition ${
              type === t.value ? "bg-white text-blush-600 shadow-sm" : "text-mist-500 hover:text-mist-700"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <Input
        label="What was it?"
        value={name}
        onChange={(e) => {
          if (e.target.value.trim() === "") calTouched.current = false; // a fresh name gets a fresh estimate
          setName(e.target.value);
        }}
        error={errors.name}
        placeholder="Dal rice, gulab jamun, a run…"
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label={type === "workout" ? "Calories burned" : "Calories"}
          type="number"
          value={calories}
          onChange={(e) => {
            calTouched.current = true;
            setCalories(e.target.value);
          }}
          error={errors.calories}
        />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <p className="min-h-4 text-xs font-medium text-mist-500">
        {looking && "Looking up a typical value…"}
        {!looking && estimate && `Estimated at about ${estimate.calories} kcal for ${estimate.serving}. It's a guess, so edit it if yours differs.`}
        {!looking && !estimate && lookupNote && `${lookupNote}`}
      </p>

      <Button type="submit" loading={loading} className="w-full">Add entry</Button>
    </form>
  );
}