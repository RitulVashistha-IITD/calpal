import { useEffect, useState } from "react";
import { api, ApiError } from "../api/client";
import type { EntryListData } from "../api/types";
import { ErrorBanner } from "./ui";

const ICON = { meal: "🍚", treat: "🍬", workout: "🏃" } as const;
const field = "rounded-2xl border-2 border-mist-100 bg-mist-50 px-3 py-2 text-sm outline-none focus:border-blush-300 focus:bg-white";

export default function EntryList({ refreshKey, onChanged }: { refreshKey: number; onChanged: () => void }) {
  const [type, setType] = useState("");
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState<EntryListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Wait 300ms after typing stops before searching
  useEffect(() => {
    const t = setTimeout(() => { setDebouncedQ(q); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false; // ignore responses from outdated requests
    const params = new URLSearchParams({ page: String(page), limit: "8" });
    if (type) params.set("type", type);
    if (debouncedQ) params.set("q", debouncedQ);
    if (from) params.set("from", from);
    if (to) params.set("to", to);

    setLoading(true);
    api<EntryListData>(`/entries?${params}`)
      .then((d) => { if (!cancelled) { setData(d); setError(""); } })
      .catch((e) => { if (!cancelled) setError(e instanceof ApiError ? e.message : "Could not load entries"); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [page, type, debouncedQ, from, to, refreshKey]);

  // If we deleted the last item on the last page, step back one page
  useEffect(() => {
    if (data && data.items.length === 0 && page > 1) setPage(page - 1);
  }, [data, page]);

  const remove = async (id: string) => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await api(`/entries/${id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Could not delete");
    }
  };

  const filter = (setter: (v: string) => void) => (v: string) => { setter(v); setPage(1); };

  return (
    <div className="space-y-3 rounded-3xl bg-white p-6 shadow-lg shadow-blush-200/50">
      <h2 className="text-xl font-extrabold text-blush-600">History 📖</h2>
      <div className="grid grid-cols-2 gap-2">
        <input className={field} placeholder="Search by name…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={field} value={type} onChange={(e) => filter(setType)(e.target.value)}>
          <option value="">All types</option>
          <option value="meal">Meals</option>
          <option value="treat">Treats</option>
          <option value="workout">Workouts</option>
        </select>
        <input className={field} type="date" value={from} onChange={(e) => filter(setFrom)(e.target.value)} aria-label="From date" />
        <input className={field} type="date" value={to} onChange={(e) => filter(setTo)(e.target.value)} aria-label="To date" />
      </div>

      {error && <ErrorBanner message={error} />}

      {loading && !data ? (
        <p className="py-6 text-center font-semibold text-mist-500">Loading…</p>
      ) : data && data.items.length === 0 ? (
        <p className="py-6 text-center font-semibold text-mist-500">Nothing here yet. Log your first entry! 💕</p>
      ) : (
        <ul className={`divide-y divide-mist-100 ${loading ? "opacity-60" : ""}`}>
          {data?.items.map((e) => (
            <li key={e._id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="truncate font-extrabold">{ICON[e.type]} {e.name}</p>
                <p className="text-xs font-semibold text-mist-500">{e.date}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`font-extrabold ${e.type === "workout" ? "text-emerald-500" : "text-blush-600"}`}>
                  {e.type === "workout" ? "−" : "+"}{e.calories}
                </span>
                <button onClick={() => remove(e._id)} aria-label={`Delete ${e.name}`} className="text-mist-500 hover:text-red-500">✕</button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {data && data.pages > 1 && (
        <div className="flex items-center justify-between pt-2 text-sm font-bold">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded-xl bg-mist-100 px-3 py-1 disabled:opacity-40">← Prev</button>
          <span className="text-mist-500">Page {data.page} of {data.pages}</span>
          <button disabled={page >= data.pages} onClick={() => setPage(page + 1)} className="rounded-xl bg-mist-100 px-3 py-1 disabled:opacity-40">Next →</button>
        </div>
      )}
    </div>
  );
}