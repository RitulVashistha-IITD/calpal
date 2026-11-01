import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

// One shared look for every text field, select and date picker
export const fieldClass =
  "w-full rounded-xl border border-mist-200 bg-white px-3.5 py-2.5 text-sm text-mist-900 outline-none transition placeholder:text-mist-500/70 focus:border-blush-400 focus:ring-4 focus:ring-blush-100";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
  variant?: "primary" | "soft";
};

const variants = {
  primary: "bg-blush-500 text-white hover:bg-blush-600",
  soft: "bg-mist-100 text-mist-700 hover:bg-mist-200",
};

export function Button({ loading, variant = "primary", children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`rounded-xl px-5 py-2.5 text-sm font-bold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${variants[variant]} ${className}`}
    >
      {loading ? "One sec…" : children}
    </button>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Input({ label, error, ...rest }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold text-mist-700">{label}</span>
      <input {...rest} className={`${fieldClass} ${error ? "!border-red-300" : ""}`} />
      {error && <span className="mt-1 block text-xs font-semibold text-red-500">{error}</span>}
    </label>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
      {message}
    </div>
  );
}