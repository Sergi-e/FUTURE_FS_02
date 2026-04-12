import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import Page from "../components/Page.jsx";

function getAuthSubmitErrorMessage(err) {
  const data = err.response?.data;
  if (data && typeof data.message === "string" && data.message.trim()) {
    return data.message;
  }
  if (data && typeof data === "object" && data !== null) {
    const alt = data.error ?? data.msg;
    if (typeof alt === "string" && alt.trim()) return alt;
  }
  if (typeof data === "string" && data.trim().startsWith("<")) {
    return "Got HTML instead of JSON — check API URL / Vite proxy.";
  }
  if (!err.response) {
    if (err.code === "ERR_NETWORK" || err.message === "Network Error") {
      return "Cannot reach the API. Start the server (port 5000), or set VITE_API_URL if the API is elsewhere.";
    }
    return err.message?.trim() || "Request failed before a response was received.";
  }
  const status = err.response.status;
  if (status === 502 || status === 503 || status === 504) {
    return "API is unreachable (bad gateway). Fix MongoDB connection in the server terminal, then restart the API.";
  }
  if (status === 404) {
    return "API route not found (404). Check that the backend is running and paths use /api.";
  }
  if (status >= 500) {
    return "Server error — is the API running and MongoDB connected? Check the terminal running the server.";
  }
  if (status >= 400) {
    return `Request failed (${status}). If you are on a deployed site, set VITE_API_URL to your API origin when building the client.`;
  }
  return "Something went wrong";
}

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
    const emailTrimmed = email.trim();
    const passwordValue = password;
    setBusy(true);
    try {
      if (mode === "login") {
        await login(emailTrimmed, passwordValue);
        toast.success("Welcome back");
      } else {
        if (!name.trim()) {
          toast.error("Name is required");
          setBusy(false);
          return;
        }
        await register(name.trim(), emailTrimmed, passwordValue);
        toast.success("Account created");
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg = getAuthSubmitErrorMessage(err);
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  const tabBase = "flex-1 rounded-md py-2 text-sm font-medium transition";
  const tabInactive =
    "text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white";
  const tabActive =
    "bg-brand-violet/15 text-brand-violet dark:bg-brand-violet/20 dark:text-violet-200 shadow-sm dark:shadow-none";

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 p-6 text-slate-900 dark:bg-surface-deep dark:text-white">
      <div className="pointer-events-none absolute inset-0 hidden dark:block dark:bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(124,58,237,0.12),transparent)]" />
      <div className="pointer-events-none absolute inset-0 hidden dark:block dark:bg-[radial-gradient(ellipse_80%_50%_at_100%_50%,rgba(6,182,212,0.08),transparent)]" />
      <Page className="relative w-full max-w-md">
        <div className="glass-card p-8">
          <h1 className="text-center text-2xl font-semibold text-slate-900 dark:text-white">
            Leadrift
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500 dark:text-white/50">
            {mode === "login" ? "Sign in to your workspace" : "Create an account"}
          </p>

          <div className="mt-6 flex rounded-lg border border-slate-200/60 bg-white/50 p-1 dark:border-white/10 dark:bg-black/20">
            <button
              type="button"
              className={`${tabBase} ${mode === "login" ? tabActive : tabInactive}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`${tabBase} ${mode === "register" ? tabActive : tabInactive}`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" ? (
              <label className="block text-xs font-medium text-slate-600 dark:text-white/60">
                Name
                <input
                  required
                  className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-cyan/60 dark:border-white/15 dark:bg-white/5 dark:text-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            ) : null}
            <label className="block text-xs font-medium text-slate-600 dark:text-white/60">
              Email
              <input
                required
                type="email"
                autoComplete="email"
                className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-cyan/60 dark:border-white/15 dark:bg-white/5 dark:text-white"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-white/60">
              Password
              <input
                required
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white/80 px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:ring-2 focus:ring-brand-cyan/60 dark:border-white/15 dark:bg-white/5 dark:text-white"
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

          <p className="mt-6 text-center text-xs text-slate-500 dark:text-white/45">
            By continuing you agree to your organization&apos;s terms and acceptable use policy.
          </p>
        </div>
      </Page>
    </div>
  );
}
