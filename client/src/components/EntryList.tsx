import { useEffect, useRef, useState } from "react";
import { api, ApiError } from "../api/client";
import { today } from "../api/types";
import type { Entry, EntryListData } from "../api/types";
import { MyCoach } from "./Coach";
import { Button, ErrorBanner, fieldClass } from "./ui";

const PILL = {
  meal: "bg-mist-100 text-mist-700",
  treat: "bg-blush-100 text-blush-600",
  workout: "bg-sage-100 text-sage-600",
} as const;
const LABEL = { meal: "Meal", treat: "Treat", workout: "Workout" } as const;

function friendlyDate(iso: string) {
  const ms = (s: string) => new Date(s + "T00:00:00").getTime();
  const diff = Math.round((ms(today()) - ms(iso)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const Pencil = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
  </svg>
);
const Trash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 6h18" />
    <path d="M8 6V4h8v2" />
    <path d="M19 6l-1 14H6L5 6" />
  </svg>
);

type Props = { refreshKey: number; onChanged: () => void; date: string; mode?: "day" | "all" };

export default function EntryList({ refreshKey, onChanged, date, mode = "day" }: Props) {
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<EntryListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Undo toast: the entry we just deleted
  const [undo, setUndo] = useState<Entry | null>(null);
  const undoTimer = useRef<number | undefined>(undefined);

  // Inline edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [eName, setEName] = useState("");
  const [eCal, setECal] = useState("");
  const [eDate, setEDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => () => window.clearTimeout(undoTimer.current), []);

  // Wait 300ms after typing stops before searching
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  // A new day or mode always starts at page 1
  useEffect(() => { setPage(1); }, [date, mode]);

  useEffect(() => {
    let cancelled = false; // ignore responses from outdated requests
    const params = new URLSearchParams({ page: String(page), limit: mode === "day" ? "50" : "10" });
    if (mode === "day") {
      params.set("from", date);
      params.set("to", date);
    } else {
      if (from) params.set("from", from);
      if (to) params.set("to", to);
    }
    if (type) params.set("type", type);
    if (debouncedQ) params.set("q", debouncedQ);

    setLoading(true);
    api<EntryListData>(`/entries?${params}`)
      .then((d) => { if (!cancelled) { setData(d); setError(""); } })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load entries"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, mode, date, from, to, type, debouncedQ, refreshKey]);

  // If we deleted the last item on the last page, step back one page
  useEffect(() => {
    if (data && data.items.length === 0 && page > 1) setPage(page - 1);
  }, [data, page]);

  const remove = async (entry: Entry) => {
    try {
      await api(`/entries/${entry._id}`, { method: "DELETE" });
      onChanged();
      setUndo(entry);
      window.clearTimeout(undoTimer.current);
      undoTimer.current = window.setTimeout(() => setUndo(null), 6000);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete");
    }
  };

  const restore = async () => {
    if (!undo) return;
    const { type, name, calories, date, notes } = undo;
    setUndo(null);
    window.clearTimeout(undoTimer.current);
    try {
      await api("/entries", { method: "POST", body: { type, name, calories, date, ...(notes && { notes }) } });
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not restore");
    }
  };

  const startEdit = (e: Entry) => {
    setEditingId(e._id);
    setEName(e.name);
    setECal(String(e.calories));
    setEDate(e.date);
    setError("");
  };

  const saveEdit = async () => {
    const calories = Number(eCal);
    if (!eName.trim()) return setError("Name can't be empty");
    if (!Number.isInteger(calories) || calories < 1 || calories > 10000) return setError("Calories: whole number, 1 to 10000");
    if (!eDate) return setError("Pick a date");

    setSaving(true);
    setError("");
    try {
      await api(`/entries/${editingId}`, { method: "PATCH", body: { name: eName.trim(), calories, date: eDate } });
      setEditingId(null);
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  // Day totals, only when nothing is filtered out, so the numbers are the true totals
  const totals =
    mode === "day" && !type && !debouncedQ && data && data.total === data.items.length
      ? data.items.reduce(
          (t, e) => (e.type === "workout" ? { ...t, burned: t.burned + e.calories } : { ...t, eaten: t.eaten + e.calories }),
          { eaten: 0, burned: 0 }
        )
      : null;

  const heading = mode === "all" ? "All entries" : date === today() ? "Today's log" : "This day's log";

  return (
    <>
      <section className="rounded-3xl border border-mist-200 bg-white p-5 shadow-card md:p-6">
        <h2 className="font-display text-xl font-extrabold tracking-tight">{heading}</h2>

        <div className="mt-4 grid grid-cols-2 gap-2">
          <input className={fieldClass} placeholder="Search by name" value={q} onChange={(e) => setQ(e.target.value)} />
          <select className={fieldClass} value={type} onChange={(e) => { setType(e.target.value); setPage(1); }} aria-label="Type">
            <option value="">All types</option>
            <option value="meal">Meals</option>
            <option value="treat">Treats</option>
            <option value="workout">Workouts</option>
          </select>
          {mode === "all" && (
            <>
              <input className={fieldClass} type="date" value={from} onChange={(e) => { setFrom(e.target.value); setPage(1); }} aria-label="From date" />
              <input className={fieldClass} type="date" value={to} onChange={(e) => { setTo(e.target.value); setPage(1); }} aria-label="To date" />
            </>
          )}
        </div>

        {error && <div className="mt-3"><ErrorBanner message={error} /></div>}

        {loading && !data ? (
          <p className="py-10 text-center text-sm font-semibold text-mist-500">Loading…</p>
        ) : data && data.items.length === 0 ? (
          <div className="pattern-sparkles mt-3 flex flex-col items-center rounded-2xl py-10 text-center">
            <MyCoach size={64} />
            <p className="mt-3 text-sm font-semibold text-mist-500">
              {mode === "day" ? "Nothing logged for this day yet." : "Nothing here yet. Log your first entry."}
            </p>
          </div>
        ) : (
          <ul className={`mt-3 max-h-[60vh] divide-y divide-mist-100 overflow-y-auto ${loading ? "opacity-60" : ""}`}>
            {data?.items.map((e) =>
              editingId === e._id ? (
                <li key={e._id} className="space-y-2 py-3">
                  <input className={fieldClass} value={eName} onChange={(ev) => setEName(ev.target.value)} aria-label="Name" />
                  <div className="grid grid-cols-2 gap-2">
                    <input className={fieldClass} type="number" value={eCal} onChange={(ev) => setECal(ev.target.value)} aria-label="Calories" />
                    <input className={fieldClass} type="date" value={eDate} onChange={(ev) => setEDate(ev.target.value)} aria-label="Date" />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={saveEdit} loading={saving} className="flex-1 !py-2">Save</Button>
                    <Button variant="soft" onClick={() => setEditingId(null)} className="flex-1 !py-2">Cancel</Button>
                  </div>
                </li>
              ) : (
                <li key={e._id} className="group flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{e.name}</p>
                    <p className="mt-1 flex items-center gap-2 text-xs text-mist-500">
                      <span className={`rounded-full px-2 py-0.5 font-bold ${PILL[e.type]}`}>{LABEL[e.type]}</span>
                      {mode === "all" && friendlyDate(e.date)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className={`mr-1 font-display text-lg font-bold tabular-nums ${e.type === "workout" ? "text-sage-600" : "text-mist-900"}`}>
                      {e.type === "workout" ? "−" : "+"}{e.calories}
                    </span>
                    <div className="flex sm:opacity-0 sm:transition sm:focus-within:opacity-100 sm:group-hover:opacity-100">
                      <button onClick={() => startEdit(e)} aria-label={`Edit ${e.name}`} className="rounded-lg p-2 text-mist-500 hover:bg-mist-100 hover:text-blush-600">
                        <Pencil />
                      </button>
                      <button onClick={() => remove(e)} aria-label={`Delete ${e.name}`} className="rounded-lg p-2 text-mist-500 hover:bg-red-50 hover:text-red-500">
                        <Trash />
                      </button>
                    </div>
                  </div>
                </li>
              )
            )}
          </ul>
        )}

        {totals && data && data.items.length > 0 && (
          <p className="mt-3 flex justify-between border-t border-mist-100 pt-3 text-sm font-semibold text-mist-500">
            <span>Eaten <span className="font-display text-base font-bold text-mist-900">{totals.eaten}</span> kcal</span>
            <span>Burned <span className="font-display text-base font-bold text-sage-600">{totals.burned}</span> kcal</span>
          </p>
        )}

        {data && data.pages > 1 && (
          <div className="mt-3 flex items-center justify-between text-sm font-semibold">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-lg bg-mist-100 px-3 py-1.5 disabled:opacity-40">Previous</button>
            <span className="text-mist-500">Page {data.page} of {data.pages}</span>
            <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-lg bg-mist-100 px-3 py-1.5 disabled:opacity-40">Next</button>
          </div>
        )}
      </section>

      {undo && (
        <div className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex justify-center px-4 md:bottom-6">
          <div role="status" className="pointer-events-auto flex animate-pop items-center gap-4 rounded-xl bg-mist-900 py-3 pl-4 pr-3 text-sm font-semibold text-white shadow-lg">
            <span className="max-w-[16rem] truncate">Deleted {undo.name}</span>
            <button onClick={restore} className="rounded-lg px-2 py-1 font-bold text-blush-300 hover:bg-white/10">Undo</button>
          </div>
        </div>
      )}
    </>
  );
}