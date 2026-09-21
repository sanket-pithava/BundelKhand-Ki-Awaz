import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { adminLoginFn, adminRegisterFn, adminGetSessionFn } from "@/lib/admin-auth";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;
    if (token) {
      adminGetSessionFn({ data: { token } })
        .then((res) => {
          if (res?.user) nav({ to: "/admin", replace: true });
        })
        .catch(() => {});
    }
  }, [nav]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const res = await adminRegisterFn({
          data: {
            email,
            password,
          },
        });
        if (res?.token) {
          localStorage.setItem("admin_token", res.token);
          window.dispatchEvent(new Event("admin-auth-changed"));
          toast.success("Account created successfully!");
          nav({ to: "/admin", replace: true });
        }
      } else {
        const res = await adminLoginFn({
          data: {
            email,
            password,
          },
        });
        if (res?.token) {
          localStorage.setItem("admin_token", res.token);
          window.dispatchEvent(new Event("admin-auth-changed"));
          toast.success("Signed in successfully!");
          nav({ to: "/admin", replace: true });
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-2xl border border-navy/10 bg-white p-8 shadow-elevated">
        <div className="mb-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-navy/40">
            हरबोले
          </div>
          <h1 className="text-2xl font-bold text-navy">Admin Console</h1>
          <p className="mt-1 text-xs text-navy/50">
            {mode === "signin"
              ? "Sign in to manage content"
              : "Create the first admin account"}
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-navy/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-navy"
          />
          <input
            type="password"
            required
            minLength={6}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-navy/15 bg-paper px-3 py-2.5 text-sm outline-none focus:border-navy"
          />
          <button
            disabled={busy}
            className="w-full rounded-lg bg-navy py-2.5 text-sm font-semibold text-paper disabled:opacity-50"
          >
            {busy
              ? "Please wait…"
              : mode === "signin"
                ? "Sign in"
                : "Create account"}
          </button>
        </form>
        <button
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="mt-4 w-full text-xs text-navy/60 hover:text-navy"
        >
          {mode === "signin"
            ? "First time? Create an admin account →"
            : "Have an account? Sign in →"}
        </button>
        <p className="mt-4 text-center text-[10px] text-navy/40">
          The first user to sign up is automatically made an admin.
        </p>
      </div>
    </div>
  );
}
