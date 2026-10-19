import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Mascot from "../components/Mascot";
import { Button } from "../components/ui";
import BudgetCard from "../components/BudgetCard";
import EntryForm from "../components/EntryForm";
import EntryList from "../components/EntryList";

export default function Dashboard() {
  const { user, logout } = useAuth();
  // Bumping this number tells BudgetCard and EntryList to refetch
  const [refreshKey, setRefreshKey] = useState(0);
  const refresh = () => setRefreshKey((k) => k + 1);

  return (
    <main className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <header className="flex items-center justify-between rounded-3xl bg-white p-4 shadow-lg shadow-blush-200/50">
        <div className="flex items-center gap-3">
          <Mascot size={44} />
          <div>
            <p className="text-lg font-extrabold text-blush-600">CalPal</p>
            <p className="text-sm font-semibold text-mist-500">Hi, {user?.name}!</p>
          </div>
        </div>
        <Button onClick={logout} className="!bg-mist-100 !text-mist-700 !shadow-none hover:!bg-mist-200">Log out</Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <BudgetCard refreshKey={refreshKey} />
          <EntryForm onCreated={refresh} />
        </div>
        <EntryList refreshKey={refreshKey} onChanged={refresh} />
      </div>
    </main>
  );
}