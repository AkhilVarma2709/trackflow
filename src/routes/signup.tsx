import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useState, type FormEvent } from "react";
import { PrimaryButton } from "@/components/trackflow/Buttons";
import { redirectIfAuthenticated } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";

export const Route = createFileRoute("/signup")({
  beforeLoad: redirectIfAuthenticated,
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const result = await signUp(email, password);

    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    navigate({ to: "/dashboard" });
  }

  return (
    <div className="grid min-h-screen place-items-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-xl border border-border bg-card p-5 sm:p-8"
      >
        <Link to="/" className="block text-center text-lg font-medium tracking-tight text-charcoal">
          Track<span className="text-gold">Flow</span>
        </Link>
        <h1 className="mt-7 text-2xl font-medium text-charcoal text-center">Create your account</h1>
        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          {[
            { l: "Full name", n: "fullName", t: "text", p: "Your name" },
            { l: "Email", n: "email", t: "email", p: "you@company.com" },
            { l: "Password", n: "password", t: "password", p: "••••••••" },
          ].map((f) => (
            <div key={f.l}>
              <label className="block text-xs font-medium text-charcoal mb-1.5">{f.l}</label>
              <input name={f.n} type={f.t} placeholder={f.p} className="w-full rounded-md border border-border bg-card px-3 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-gold" />
            </div>
          ))}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <PrimaryButton type="submit" className="w-full" disabled={submitting}>Get Started Free</PrimaryButton>
        </form>
        <p className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-charcoal hover:underline">Login</Link>
        </p>
      </motion.div>
    </div>
  );
}
