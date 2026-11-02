import { bmiBand, bmiOf } from "../bmi";

export const BMI_NOTE =
  "BMI is a rough guide. It doesn't know about muscle, and some guidelines use lower cut-offs for South Asian adults, so ask a doctor for a personal view.";

const TONE = {
  low: "bg-amber-100 text-amber-800",
  ok: "bg-sage-100 text-sage-600",
  high: "bg-amber-100 text-amber-800",
} as const;

export default function BmiLine({ label, kg, cm }: { label: string; kg: number; cm: number }) {
  const b = bmiOf(kg, cm);
  const band = bmiBand(b);
  return (
    <p className="flex flex-wrap items-center gap-2 text-sm">
      <span className="text-mist-500">{label}</span>
      <span className="font-display text-lg font-bold">{b.toFixed(1)}</span>
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${TONE[band.tone]}`}>{band.label}</span>
    </p>
  );
}