import { useRef, useState } from "react";
import type { FormEvent } from "react";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { COACHES, MyCoach, useCoach } from "./Coach";
import { ErrorBanner, Input } from "./ui";

export default function DeleteAccount() {
  const { user, logout } = useAuth();
  const { prefs } = useCoach();
  const coachName = COACHES.find((c) => c.kind === prefs.kind)?.name ?? "Your coach";
  const ref = useRef<HTMLDialogElement>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const open = () => {
    setPassword("");
    setError("");
    ref.current?.showModal();
  };
  const close = () => {
    if (!loading) ref.current?.close();
  };

  const confirm = async (e: FormEvent) => {
    e.preventDefault();
    if (!password) return setError("Enter your password so I know it's really you");
    setLoading(true);
    setError("");
    try {
      await api("/account", { method: "DELETE", body: { password } });
      try {
        localStorage.removeItem(`calpal_coach_${user?.id}`);
      } catch {
        /* storage can be blocked; nothing to clean up then */
      }
      logout(); // clears the session and sends you back to the login page
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not delete your account");
      setLoading(false);
    }
  };

  return (
    <>
      <section className="rounded-3xl border border-red-200 bg-white p-6 shadow-card md:p-8">
        <h2 className="font-display text-xl font-extrabold tracking-tight">Danger zone</h2>
        <p className="mt-1 text-sm text-mist-500">Permanently delete your account and everything in it.</p>
        <button
          onClick={open}
          className="mt-5 rounded-xl border border-red-300 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50"
        >
          Delete my account
        </button>
      </section>

      <dialog
        ref={ref}
        onCancel={(e) => loading && e.preventDefault()}
        onClick={(e) => e.target === ref.current && close()}
        className="m-auto w-[calc(100%-2rem)] max-w-md rounded-3xl bg-white p-0 text-mist-900 shadow-lift backdrop:bg-mist-900/50 backdrop:backdrop-blur-sm"
      >
        <form onSubmit={confirm} className="p-6 md:p-8">
          <div className="flex flex-col items-center text-center">
            <MyCoach cheer={false} size={96} />
            <h2 className="mt-3 font-display text-2xl font-extrabold tracking-tight">Wait, you're leaving?</h2>
            <p className="mt-2 text-sm text-mist-700">
              {coachName} is trying to act cool about it. {coachName} is not cool about it.
            </p>
          </div>

          <div className="mt-5 rounded-2xl bg-blush-50 p-4 text-sm text-mist-700">
            <p className="font-semibold">This will permanently delete:</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>your goal and your forecast</li>
              <li>your body stats</li>
              <li>every meal, treat and workout you've logged</li>
              <li>any foods you added</li>
            </ul>
            <p className="mt-3 font-semibold text-blush-600">
              There's no undo and no backup. Not by you, not by me, not even by a very persuasive coach.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            {error && <ErrorBanner message={error} />}
            <Input
              label="Type your password to confirm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={close}
              autoFocus
              className="rounded-xl bg-blush-500 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-blush-600"
            >
              Keep my account
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl border border-red-300 px-5 py-2.5 text-sm font-bold text-red-600 transition hover:bg-red-50 disabled:opacity-60"
            >
              {loading ? "Deleting…" : "Delete everything"}
            </button>
          </div>
        </form>
      </dialog>
    </>
  );
}