import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import Page from "../components/Page.jsx";

export default function LoginPage() {
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email, password);
        toast.success("Welcome back");
      } else {
        if (!name.trim()) {
          toast.error("Name is required");
          setBusy(false);
          return;
        }
        await register(name.trim(), email, password);
        toast.success("Account created");
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#06060a] p-6 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(124,58,237,0.22),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(6,182,212,0.1),transparent)]" />
      <Page className="relative w-full max-w-md">
        <div className="rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md">
          <h1 className="text-center text-2xl font-semibold">Leadrift</h1>
          <p className="mt-1 text-center text-sm text-white/55">
            {mode === "login" ? "Sign in to your workspace" : "Create an account"}
          </p>

          <div className="mt-6 flex rounded-lg bg-black/30 p-1">
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-white/10 text-white shadow"
                  : "text-white/55"
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-white/10 text-white shadow"
                  : "text-white/55"
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" ? (
              <label className="block text-xs font-medium text-white/65">
                Name
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none ring-2 ring-transparent transition placeholder:text-white/30 focus:ring-brand-violet/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            ) : null}
            <label className="block text-xs font-medium text-white/65">
              Email
              <input
                required
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none ring-2 ring-transparent transition focus:ring-brand-violet/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-white/65">
              Password
              <input
                required
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-1 w-full rounded-lg border border-white/15 bg-white/5 px-3 py-2.5 text-sm text-white outline-none ring-2 ring-transparent transition focus:ring-brand-violet/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand-violet py-2.5 text-sm font-semibold text-white shadow-neon transition hover:bg-violet-600 disabled:opacity-60 dark:hover:bg-violet-500"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/45">
            By continuing you agree to your organization&apos;s terms and acceptable use policy.
          </p>
        </div>
      </Page>
    </div>
  );
}
