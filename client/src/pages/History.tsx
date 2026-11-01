import { useState } from "react";
import { today } from "../api/types";
import PageHeader from "../components/PageHeader";
import EntryList from "../components/EntryList";

export default function HistoryPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader title="History" subtitle="Every day you've logged, searchable." />
      <EntryList refreshKey={refreshKey} onChanged={() => setRefreshKey((k) => k + 1)} date={today()} mode="all" />
    </main>
  );
}