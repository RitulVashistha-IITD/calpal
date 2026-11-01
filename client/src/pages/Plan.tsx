import { useState } from "react";
import PageHeader from "../components/PageHeader";
import WeightPlan from "../components/WeightPlan";

export default function PlanPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader title="Plan" subtitle="Your body stats, forecast and suggested budget, all in one place." pattern="dots" />
      <WeightPlan refreshKey={refreshKey} onChanged={() => setRefreshKey((k) => k + 1)} />
    </main>
  );
}