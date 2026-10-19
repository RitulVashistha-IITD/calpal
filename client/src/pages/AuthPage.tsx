import { useState } from "react";
import type { FormEvent } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../api/client";
import Mascot from "../components/Mascot";
import { Button, ErrorBanner, Input } from "../components/ui";

type Errors = Partial<Record<"name" | "email" | "password", string>>;

function validate(mode: "login" | "register", name: string, email: string, password: string): Errors {
  const errors: Errors = {};
  if (mode === "register" && (name.trim().length < 1 || name.trim().length > 50)) {
    errors.name = "Name must be 1 to 50 characters";
  }
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) errors.email = "Enter a valid email";
  if (mode === "register" && password.length < 8) errors.password = "At least 8 characters";
  if (mode === "login" && password.length === 0) errors.password = "Enter your password";
  return errors;
}

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to="/" replace />;

  const switchMode = () => {
    setMode(mode === "login" ? "register" : "login");
    setErrors({});
    setFormError("");
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault(); // stop the browser's full-page form submit
    setFormError("");
    const found = validate(mode, name, email, password);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setLoading(true);
    try {
      if (mode === "login") await login(email.trim(), password);
      else await register(name.trim(), email.trim(), password);
    } catch (err) {
      if (err instanceof ApiError) {
        const fieldErrors: Errors = {};
        err.details?.forEach((d) => {
          if (d.field === "name" || d.field === "email" || d.field === "password") {
            fieldErrors[d.field] = d.message;
          }
        });
        setErrors(fieldErrors);
        setFormError(err.details?.length ? "Please fix the highlighted fields" : err.message);
      } else {
        setFormError("Something went wrong");
      }
    } finally {
      setLoading(false); // runs whether it succeeded or failed
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-blush-200/60">
        <div className="mb-6 flex flex-col items-center text-center">
          <Mascot size={88} float />
          <h1 className="mt-3 text-3xl font-extrabold text-blush-600">CalPal</h1>
          <p className="text-sm font-semibold text-mist-500">
            {mode === "login" ? "Welcome back! 💕" : "Let's get you started 💕"}
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-4">
          {formError && <ErrorBanner message={formError} />}
          {mode === "register" && (
            <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} autoComplete="name" />
          )}
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} autoComplete="email" />
          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
          <Button type="submit" loading={loading} className="w-full">
            {mode === "login" ? "Log in" : "Create account"}
          </Button>
        </form>

        <button onClick={switchMode} className="mt-5 w-full text-center text-sm font-bold text-mist-500 hover:text-blush-600">
          {mode === "login" ? "New here? Create an account" : "Already have an account? Log in"}
        </button>
      </div>
    </main>
  );
}