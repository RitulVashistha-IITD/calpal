import { useAuth } from "../context/AuthContext";
import PageHeader from "../components/PageHeader";
import CoachPicker from "../components/CoachPicker";
import BodyStats from "../components/BodyStats";
import DeleteAccount from "../components/DeleteAccount";
import { ReminderSetting } from "../components/WeighIn";
import { Button } from "../components/ui";

const card = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader title="Profile" subtitle="Your account, your body stats and your coach." />

      <section className={card}>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Account</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p><span className="text-mist-500">Name </span><span className="font-semibold">{user?.name}</span></p>
          <p><span className="text-mist-500">Email </span><span className="font-semibold">{user?.email}</span></p>
        </div>
        <Button variant="soft" onClick={logout} className="mt-5">Log out</Button>
      </section>

      <BodyStats />

      <section className={card}>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Your coach</h2>
        <p className="mt-1 text-sm text-mist-500">Pick who cheers you on. Saved on this device.</p>
        <CoachPicker />
      </section>

      <section className={card}>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Reminders</h2>
        <div className="mt-4">
          <ReminderSetting />
        </div>
      </section>

      <DeleteAccount />
    </main>
  );
}