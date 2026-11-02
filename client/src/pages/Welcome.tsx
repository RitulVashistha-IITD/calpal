import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api/client";
import type { Profile } from "../api/types";
import { useAuth } from "../context/AuthContext";
import { CoachProvider, MyCoach } from "../components/Coach";
import CoachPicker from "../components/CoachPicker";
import ProfileForm from "../components/ProfileForm";
import PlanGoal from "../components/PlanGoal";
import { ReminderSetting } from "../components/WeighIn";
import { markOnboarded } from "../components/OnboardingGate";
import { Button } from "../components/ui";

const card = "rounded-3xl border border-mist-200 bg-white p-6 shadow-card md:p-8";
const STEPS = ["About you", "Your goal", "Your coach"];

function Flow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Load saved body stats whenever step 1 opens, so going back shows what you entered
  useEffect(() => {
    if (step !== 0) return;
    let cancelled = false;
    setLoaded(false);
    api<Profile>("/profile")
      .then((p) => { if (!cancelled) setProfile(p); })
      .catch(() => { if (!cancelled) setProfile(null); })
      .finally(() => { if (!cancelled) setLoaded(true); });
    return () => { cancelled = true; };
  }, [step]);

  const finish = () => {
    markOnboarded(user?.id);
    navigate("/", { replace: true });
  };

  return (
    <main className="mx-auto max-w-2xl space-y-6 px-4 py-8 md:py-12">
      <header className="flex items-center gap-4">
        <MyCoach size={64} />
        <div>
          <h1 className="font-display text-3xl font-extrabold tracking-tight">Welcome, {user?.name}</h1>
          <p className="text-sm text-mist-500">Three quick steps, so everything fits you.</p>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-2" aria-label={`Step ${step + 1} of ${STEPS.length}: ${STEPS[step]}`}>
        {STEPS.map((s, i) => (
          <button
            key={s}
            type="button"
            disabled={i >= step}
            onClick={() => setStep(i)}
            className="text-left disabled:cursor-default"
          >
            <div className={`h-1.5 rounded-full ${i <= step ? "bg-blush-500" : "bg-blush-200"}`} />
            <p className={`mt-1.5 text-xs font-semibold ${i === step ? "text-blush-600" : "text-mist-500"}`}>{s}</p>
          </button>
        ))}
      </div>

      {step === 0 &&
        (!loaded ? (
          <section className={`${card} text-center text-sm font-semibold text-mist-500`}>Loading…</section>
        ) : (
          <section className={card}>
            <h2 className="font-display text-2xl font-extrabold tracking-tight">First, a little about you</h2>
            <p className="mt-1 text-sm text-mist-500">
              I use this to estimate how many calories you burn, so your budget and forecast fit your body. It's saved on your account, and you can change it any time in Profile.
            </p>
            <ProfileForm key={profile?.weightKg ?? "new"} initial={profile} onSaved={() => setStep(1)} />
          </section>
        ))}

      {step === 1 && <PlanGoal onSaved={() => setStep(2)} />}

      {step === 2 && (
        <section className={card}>
          <h2 className="font-display text-2xl font-extrabold tracking-tight">Pick your coach</h2>
          <p className="mt-1 text-sm text-mist-500">Someone to cheer you on. You can switch any time in Profile.</p>
          <CoachPicker />
          <div className="mt-8 border-t border-mist-100 pt-6">
            <ReminderSetting />
          </div>
          <Button onClick={finish} className="mt-8 w-full">Take me to my day</Button>
        </section>
      )}

      <div className="flex items-center justify-between">
        {step > 0 ? (
          <button onClick={() => setStep(step - 1)} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-mist-700 hover:bg-mist-100">
            ‹ Back
          </button>
        ) : (
          <span />
        )}
        <button onClick={finish} className="rounded-lg px-3 py-1.5 text-sm font-semibold text-mist-500 hover:bg-mist-100">
          Skip for now
        </button>
      </div>
    </main>
  );
}

export default function WelcomePage() {
  return (
    <CoachProvider>
      <Flow />
    </CoachProvider>
  );
}