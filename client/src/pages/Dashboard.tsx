import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import { Button } from "../components/ui";
import BudgetCard from "../components/BudgetCard";
import EntryForm from "../components/EntryForm";
import EntryList from "../components/EntryList";
import CravingOptimizer from "../components/CravingOptimizer";

const TABS = [
  { id: "log", label: "Log" },
  { id: "cravings", label: "Cravings" },
] as const;
type Tab = (typeof TABS)[number]["id"];

export default function Dashboard() {
  const { user, logout } = useAuth();
  // Bumping this number tells BudgetCard and EntryList to refetch
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);
  const [tab, setTab] = useState<Tab>("log");

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

      <BudgetCard refreshKey={refreshKey} />

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
            <EntryForm onCreated={refresh} />
          </div>
          <div className={tab === "cravings" ? "" : "hidden"}>
            <CravingOptimizer onLogged={refresh} />
          </div>
        </section>

        <div className="lg:sticky lg:top-6 lg:col-span-2">
          <EntryList refreshKey={refreshKey} onChanged={refresh} />
        </div>
      </div>
    </main>
  );
}