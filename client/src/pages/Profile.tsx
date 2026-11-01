import { useAuth } from "../context/AuthContext";
import { COACHES, Coach, TONE_COLORS, useCoach } from "../components/Coach";
import PageHeader from "../components/PageHeader";
import { Button } from "../components/ui";

const card = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { prefs, setPrefs } = useCoach();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-6 md:px-8">
      <PageHeader title="Profile" subtitle="Your account and your coach." />

      <section className={card}>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Account</h2>
        <div className="mt-4 space-y-2 text-sm">
          <p><span className="text-mist-500">Name </span><span className="font-semibold">{user?.name}</span></p>
          <p><span className="text-mist-500">Email </span><span className="font-semibold">{user?.email}</span></p>
        </div>
        <Button variant="soft" onClick={logout} className="mt-5">Log out</Button>
      </section>

      <section className={card}>
        <h2 className="font-display text-xl font-extrabold tracking-tight">Your coach</h2>
        <p className="mt-1 text-sm text-mist-500">Pick who cheers you on. Saved on this device.</p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          {COACHES.map((c) => {
            const on = prefs.kind === c.kind;
            return (
              <button
                key={c.kind}
                onClick={() => setPrefs({ ...prefs, kind: c.kind })}
                aria-pressed={on}
                className={`rounded-2xl border-2 p-3 text-center transition ${on ? "border-blush-500 bg-blush-50" : "border-mist-200 hover:border-blush-300"}`}
              >
                <div className="flex justify-center"><Coach kind={c.kind} tone={prefs.tone} size={88} /></div>
                <p className="mt-2 text-sm font-bold">{c.name}</p>
                <p className="text-xs text-mist-500">{c.pronoun}</p>
              </button>
            );
          })}
        </div>

        <p className="mt-6 text-sm font-semibold text-mist-700">Skin tone</p>
        <div className="mt-2 flex gap-3">
          {TONE_COLORS.map((color, i) => (
            <button
              key={color}
              onClick={() => setPrefs({ ...prefs, tone: i })}
              aria-label={`Skin tone ${i + 1}`}
              aria-pressed={prefs.tone === i}
              style={{ background: color }}
              className={`h-10 w-10 rounded-full border-2 transition ${prefs.tone === i ? "border-blush-500 ring-4 ring-blush-100" : "border-white shadow-card"}`}
            />
          ))}
        </div>
      </section>
    </main>
  );
}