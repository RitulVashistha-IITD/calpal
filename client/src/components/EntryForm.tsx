import { useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { EntryType } from "../api/types";
import { Button, ErrorBanner, Input } from "./ui";

const TYPES: { value: EntryType; label: string }[] = [
  { value: "meal", label: "🍚 Meal" },
  { value: "treat", label: "🍬 Treat" },
  { value: "workout", label: "🏃 Workout" },
];

export default function EntryForm({ onCreated }: { onCreated: () => void }) {
  const [type, setType] = useState<EntryType>("meal");
  const [name, setName] = useState("");
  const [calories, setCalories] = useState("");
  const [date, setDate] = useState(today());
  const [errors, setErrors] = useState<{ name?: string; calories?: string }>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

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
      onCreated();
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Could not save entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-3 rounded-3xl bg-white p-6 shadow-lg shadow-blush-200/50">
      <h2 className="text-xl font-extrabold text-blush-600">Log something 📝</h2>
      {formError && <ErrorBanner message={formError} />}
      <div className="grid grid-cols-3 gap-2">
        {TYPES.map((t) => (
          <button
            type="button"
            key={t.value}
            onClick={() => setType(t.value)}
            className={`rounded-2xl py-2 text-sm font-extrabold ${type === t.value ? "bg-blush-500 text-white" : "bg-mist-100 text-mist-700"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder="Dal rice, gulab jamun, run…" />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Calories" type="number" value={calories} onChange={(e) => setCalories(e.target.value)} error={errors.calories} />
        <Input label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <Button type="submit" loading={loading} className="w-full">Add entry</Button>
    </form>
  );
}