import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { api, ApiError } from "../api/client";
import { useAuth } from "../context/AuthContext";

const key = (id?: string) => `calpal_onboarded_${id}`;

export function isOnboarded(id?: string) {
  try {
    return localStorage.getItem(key(id)) === "1";
  } catch {
    return false;
  }
}
export function markOnboarded(id?: string) {
  try {
    localStorage.setItem(key(id), "1");
  } catch {
    /* storage can be blocked; the welcome flow may show again */
  }
}

export default function OnboardingGate({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [state, setState] = useState<"loading" | "needs" | "ok">("loading");

  useEffect(() => {
    let cancelled = false;
    api("/profile")
      .then(() => { if (!cancelled) setState("ok"); })
      .catch((e) => {
        if (cancelled) return;
        const missing = e instanceof ApiError && e.status === 404;
        setState(missing && !isOnboarded(user?.id) ? "needs" : "ok"); // never block the app on a network error
      });
    return () => { cancelled = true; };
  }, [user?.id]);

  if (state === "loading") return <div className="grid min-h-screen place-items-center text-sm font-semibold text-mist-500">Loading…</div>;
  if (state === "needs") return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}