import { COACHES, Coach, TONE_COLORS, useCoach } from "./Coach";

export default function CoachPicker() {
  const { prefs, setPrefs } = useCoach();
  return (
    <>
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
    </>
  );
}