import { useState } from "react";
import PageHeader from "../components/PageHeader";
import PlanGoal from "../components/PlanGoal";
import WeightPlan from "../components/WeightPlan";

export default function PlanPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const bump = () => setRefreshKey((k) => k + 1);
  return (
    <main className="mx-auto max-w-4xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader title="Plan" subtitle="Your goal, your body stats and your forecast, all in one place." pattern="dots" />
      <PlanGoal refreshKey={refreshKey} onSaved={bump} />
      <WeightPlan refreshKey={refreshKey} />
    </main>
  );
}