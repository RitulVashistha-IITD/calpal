import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { CoachProvider, MyCoach } from "./Coach";

const LINKS: { to: string; label: string; end?: boolean }[] = [
  { to: "/", label: "Today", end: true },
  { to: "/history", label: "History" },
  { to: "/plan", label: "Plan" },
  { to: "/learn", label: "Learn" },
  { to: "/profile", label: "Profile" },
];

export default function Layout() {
  const { user } = useAuth();
  return (
    <CoachProvider>
      <div className="min-h-screen pb-24 md:pb-10">
        <header className="sticky top-0 z-40 border-b border-mist-200 bg-blush-50">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 md:px-8">
            <div className="flex items-center gap-2.5">
              <MyCoach size={36} />
              <span className="font-display text-2xl font-extrabold tracking-tight">CalPal</span>
            </div>
            <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
              {LINKS.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.end}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      isActive ? "bg-white text-blush-600 shadow-card" : "text-mist-500 hover:text-mist-900"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
            </nav>
            <span className="hidden text-sm font-semibold text-mist-500 lg:inline">Hi, {user?.name}</span>
          </div>
        </header>
        <Outlet />
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t border-mist-200 bg-white px-2 py-2 md:hidden" aria-label="Main (mobile)">
        {LINKS.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `rounded-xl py-2 text-center text-xs font-semibold transition ${isActive ? "bg-blush-50 text-blush-600" : "text-mist-500"}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </nav>
    </CoachProvider>
  );
}