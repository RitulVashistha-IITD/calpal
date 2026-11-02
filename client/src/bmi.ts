export const bmiOf = (kg: number, cm: number) => kg / (cm / 100) ** 2;

export type BmiBand = { label: string; tone: "low" | "ok" | "high" };

export function bmiBand(b: number): BmiBand {
  if (b < 18.5) return { label: "Underweight", tone: "low" };
  if (b < 25) return { label: "Healthy range", tone: "ok" };
  if (b < 30) return { label: "Overweight", tone: "high" };
  return { label: "Obesity range", tone: "high" };
}

// The weights that give a BMI of 18.5 to 24.9 at this height
export function healthyKg(cm: number): [number, number] {
  const m2 = (cm / 100) ** 2;
  return [Math.ceil(18.5 * m2 * 10) / 10, Math.floor(24.9 * m2 * 10) / 10];
}