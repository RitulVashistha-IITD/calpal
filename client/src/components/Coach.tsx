import { createContext, useContext, useEffect, useId, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";

export type CoachKind = "w" | "m" | "n";
export type CoachPrefs = { kind: CoachKind; tone: number };

export const COACHES: { kind: CoachKind; name: string; pronoun: string }[] = [
  { kind: "w", name: "Coach Maya", pronoun: "She" },
  { kind: "m", name: "Coach Arjun", pronoun: "He" },
  { kind: "n", name: "Coach Sam", pronoun: "They" },
];

const TONES: [string, string][] = [
  ["#F5D3BA", "#E4B596"],
  ["#E0A97E", "#C98F63"],
  ["#B9785A", "#9C6046"],
  ["#7A4B33", "#643A27"],
];
export const TONE_COLORS = TONES.map((t) => t[0]);

const HAIR: Record<CoachKind, string> = { w: "#4A2F2A", m: "#2E2422", n: "#6B4A3A" };
const INK = "#3A2B33";
const SAGE = "#8FAE92";

const LINES: Record<CoachKind, { good: string[]; over: string[] }> = {
  w: {
    good: ["You're glowing. Go eat something nice.", "Look at you, logging like a legend.", "Budget handled. Main character energy."],
    over: ["Tomorrow exists, and I'll be here for it.", "You logged it. That's the hard part.", "One day isn't a trend. Breathe."],
  },
  m: {
    good: ["Look at you, doing the thing.", "Steady wins. Keep going.", "That's the rhythm. Love to see it."],
    over: ["One day isn't a trend. Proud you logged it.", "Walk it off with me tomorrow?", "Still on the team. Still proud."],
  },
  n: {
    good: ["Okay, main character energy.", "Quietly crushing it, as usual.", "Your future self says thank you."],
    over: ["Still logged it. That's the hard part.", "Reset, not restart. You've got this.", "Honestly? Still impressed."],
  },
};

// Same line all day, so it doesn't flicker on every refresh
export function coachLine(kind: CoachKind, over: boolean) {
  const list = LINES[kind][over ? "over" : "good"];
  return list[new Date().getDate() % list.length];
}

const Spark = ({ x, y, s }: { x: number; y: number; s: number }) => (
  <path transform={`translate(${x} ${y}) scale(${s})`} d="M0 -8 L2 -2 L8 0 L2 2 L0 8 L-2 2 L-8 0 L-2 -2 Z" fill={SAGE} />
);

export function Coach({ kind, tone, cheer = true, size = 64 }: { kind: CoachKind; tone: number; cheer?: boolean; size?: number }) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [skin, shade] = TONES[tone] ?? TONES[0];
  const hair = HAIR[kind];
  const clip = `coach-${uid}`;

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label="Your coach">
      <defs>
        <clipPath id={clip}>
          <circle cx="60" cy="60" r="58" />
        </clipPath>
      </defs>
      <circle cx="60" cy="60" r="58" fill="#F6E2E7" />
      <g clipPath={`url(#${clip})`}>
        {kind === "w" && <path d="M74 32 C98 24 104 52 90 72 C90 56 86 46 74 40 Z" fill={hair} />}
        {kind === "n" && <circle cx="60" cy="20" r="10" fill={hair} />}
        <path d="M14 122 C14 98 34 90 60 90 C86 90 106 98 106 122 Z" fill="#A9566A" />
        <rect x="52" y="76" width="16" height="18" rx="6" fill={shade} />
        <path d="M47 91 Q60 112 73 91 Z" fill="#FFFBFC" />
        <path d="M49 91 Q60 113 71 91" stroke={INK} strokeWidth="1.4" fill="none" />
        <circle cx="60" cy="104" r="4" fill={SAGE} stroke={INK} strokeWidth="1" />
        <circle cx="39" cy="58" r="4" fill={skin} />
        <circle cx="81" cy="58" r="4" fill={skin} />
        <ellipse cx="60" cy="56" rx="21" ry="25" fill={skin} />
        {kind === "m" ? (
          <path d="M37 52 C32 26 46 18 60 20 C76 18 88 28 83 52 C81 42 74 34 60 34 C46 34 39 42 37 52 Z" fill={hair} />
        ) : (
          <path d="M38 52 C35 30 48 25 60 25 C73 25 85 30 82 52 C79 42 72 37 60 37 C48 37 41 42 38 52 Z" fill={hair} />
        )}
        <path d="M38 44 C48 38 72 38 82 44 L82 49 C72 43 48 43 38 49 Z" fill={SAGE} />
        <path d="M46 53 Q51 50 56 52 M64 52 Q69 50 74 53" stroke={hair} strokeWidth={kind === "m" ? 3.2 : 2.2} strokeLinecap="round" fill="none" />
        {cheer ? (
          <path d="M47 58 Q51 54 55 58 M65 58 Q69 54 73 58" stroke={INK} strokeWidth="2.8" strokeLinecap="round" fill="none" />
        ) : (
          <>
            <circle cx="51" cy="58" r="2.9" fill={INK} />
            <circle cx="69" cy="58" r="2.9" fill={INK} />
            <circle cx="52" cy="57" r="1" fill="#fff" />
            <circle cx="70" cy="57" r="1" fill="#fff" />
          </>
        )}
        <path d="M60 60 Q57 65 61 65" stroke={shade} strokeWidth="1.8" strokeLinecap="round" fill="none" />
        <ellipse cx="45" cy="66" rx="5" ry="3.2" fill="#E58AA2" opacity=".35" />
        <ellipse cx="75" cy="66" rx="5" ry="3.2" fill="#E58AA2" opacity=".35" />
        {cheer ? (
          <>
            <path d="M52 67 Q60 80 68 67 Z" fill="#8B3A50" />
            <path d="M54 68 Q60 71 66 68 L66 69.5 Q60 72.5 54 69.5 Z" fill="#fff" />
            <Spark x={22} y={30} s={0.9} />
            <Spark x={99} y={32} s={1.1} />
            <Spark x={101} y={64} s={0.7} />
          </>
        ) : (
          <path d="M53 68 Q60 74 67 68" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        )}
      </g>
    </svg>
  );
}

type Ctx = { prefs: CoachPrefs; setPrefs: (p: CoachPrefs) => void };
const DEFAULT: CoachPrefs = { kind: "n", tone: 1 };
const CoachCtx = createContext<Ctx | null>(null);

function read(key: string): CoachPrefs {
  try {
    const p = JSON.parse(localStorage.getItem(key) ?? "null");
    if (p && ["w", "m", "n"].includes(p.kind) && Number.isInteger(p.tone) && p.tone >= 0 && p.tone < TONES.length) return p;
  } catch {
    /* fall through to the default */
  }
  return DEFAULT;
}

export function CoachProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const key = `calpal_coach_${user?.id ?? "guest"}`;
  const [prefs, setPrefsState] = useState<CoachPrefs>(() => read(key));

  useEffect(() => {
    setPrefsState(read(key));
  }, [key]);

  const setPrefs = (p: CoachPrefs) => {
    setPrefsState(p);
    try {
      localStorage.setItem(key, JSON.stringify(p));
    } catch {
      /* storage can be blocked; the choice just won't persist */
    }
  };

  return <CoachCtx.Provider value={{ prefs, setPrefs }}>{children}</CoachCtx.Provider>;
}

export function useCoach(): Ctx {
  return useContext(CoachCtx) ?? { prefs: DEFAULT, setPrefs: () => {} };
}

export function MyCoach({ cheer = true, size = 64 }: { cheer?: boolean; size?: number }) {
  const { prefs } = useCoach();
  return <Coach kind={prefs.kind} tone={prefs.tone} cheer={cheer} size={size} />;
}