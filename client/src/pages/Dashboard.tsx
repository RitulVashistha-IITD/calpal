import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { today } from "../api/types";
import Mascot from "../components/Mascot";
import { Button, fieldClass } from "../components/ui";
import BudgetCard from "../components/BudgetCard";
import EntryForm from "../components/EntryForm";
import EntryList from "../components/EntryList";
import CravingOptimizer from "../components/CravingOptimizer";

const TABS = [
  { id: "log", label: "Log" },
  { id: "cravings", label: "Cravings" },
] as const;
type Tab = (typeof TABS)[number]["id"];

const ms = (s: string) => new Date(s + "T00:00:00").getTime();

function dayLabel(date: string) {
  const diff = Math.round((ms(today()) - ms(date)) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return new Date(date + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
}

function shiftDay(date: string, n: number) {
  const d = new Date(date + "T00:00:00");
  d.setDate(d.getDate() + n);
  return d.toLocaleDateString("en-CA");
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  // Bumping this number tells the cards and the list to refetch
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);
  const [tab, setTab] = useState<Tab>("log");
  const [date, setDate] = useState(today()); // the day the whole page is showing
  const isToday = date === today();

  const arrow = "rounded-xl bg-mist-100 px-3.5 py-2 text-lg font-bold leading-none text-mist-700 hover:bg-mist-200 disabled:opacity-40";

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Mascot size={36} />
          <span className="font-display text-2xl font-extrabold tracking-tight">CalPal</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden text-sm font-semibold text-mist-500 sm:inline">Hi, {user?.name}</span>
          <Button variant="soft" onClick={logout} className="!py-2">Log out</Button>
        </div>
      </header>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-extrabold tracking-tight">{dayLabel(date)}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setDate(shiftDay(date, -1))} aria-label="Previous day" className={arrow}>‹</button>
          <input
            type="date"
            value={date}
            max={today()}
            onChange={(e) => e.target.value && setDate(e.target.value)}
            aria-label="Pick a day"
            className={`${fieldClass} !w-auto`}
          />
          <button onClick={() => setDate(shiftDay(date, 1))} disabled={isToday} aria-label="Next day" className={arrow}>›</button>
          {!isToday && <Button variant="soft" onClick={() => setDate(today())} className="!py-2">Back to today</Button>}
        </div>
      </div>

      <BudgetCard refreshKey={refreshKey} date={date} />

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <section className="rounded-3xl border border-mist-200 bg-white p-5 md:p-6 lg:col-span-3">
          <div role="tablist" className="mb-5 inline-flex rounded-xl bg-mist-100 p-1 text-sm font-semibold">
            {TABS.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`rounded-lg px-5 py-2 transition ${
                  tab === t.id ? "bg-white text-blush-600 shadow-sm" : "text-mist-500 hover:text-mist-700"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Both stay mounted so you don't lose what you typed when switching tabs */}
          <div className={tab === "log" ? "" : "hidden"}>
            <EntryForm onCreated={refresh} day={date} />
          </div>
          <div className={tab === "cravings" ? "" : "hidden"}>
            <CravingOptimizer onLogged={refresh} day={date} />
          </div>
        </section>

        <div className="lg:sticky lg:top-6 lg:col-span-2">
          <EntryList refreshKey={refreshKey} onChanged={refresh} date={date} />
        </div>
      </div>
    </main>
  );
}