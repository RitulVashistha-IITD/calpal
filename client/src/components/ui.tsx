import type { ButtonHTMLAttributes, InputHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean };

export function Button({ loading, children, className = "", ...rest }: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={rest.disabled || loading}
      className={`rounded-2xl bg-blush-500 px-5 py-3 font-extrabold text-white shadow-md shadow-blush-300/60 transition hover:bg-blush-600 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {loading ? "One sec…" : children}
    </button>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string };

export function Input({ label, error, ...rest }: InputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-mist-700">{label}</span>
      <input
        {...rest}
        className={`w-full rounded-2xl border-2 bg-mist-50 px-4 py-3 outline-none transition focus:bg-white ${
          error ? "border-red-300" : "border-mist-100 focus:border-blush-300"
        }`}
      />
      {error && <span className="mt-1 block text-sm font-semibold text-red-500">{error}</span>}
    </label>
  );
}

export function ErrorBanner({ message }: { message: string }) {
  return (
    <div role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
      {message}
    </div>
  );
}