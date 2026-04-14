import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import Page from "../components/Page.jsx";
import "./LoginPage.css";

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

  return (
    <div className="login-page relative flex min-h-screen items-center justify-center overflow-hidden p-6">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,rgba(124,58,237,0.22),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_100%_50%,rgba(6,182,212,0.1),transparent)]" />
      <Page className="relative w-full max-w-md">
        <div className="login-card rounded-2xl p-8 backdrop-blur-md">
          <h1 className="login-title text-center text-2xl font-semibold">Leadrift</h1>
          <p className="login-subtitle mt-1 text-center text-sm">
            {mode === "login" ? "Sign in to your workspace" : "Create an account"}
          </p>

          <div className="mt-6 flex rounded-lg p-1">
            <button
              type="button"
              className={`login-tab flex-1 rounded-t-md py-2 text-sm font-medium transition ${
                mode === "login" ? "active" : ""
              }`}
              onClick={() => setMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`login-tab flex-1 rounded-t-md py-2 text-sm font-medium transition ${
                mode === "register" ? "active" : ""
              }`}
              onClick={() => setMode("register")}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {mode === "register" ? (
              <label className="login-label block text-xs font-medium">
                Full Name
                <input
                  required
                  placeholder="e.g. Jane Doe"
                  className="login-input mt-1 w-full rounded-lg px-3 py-2.5 text-sm transition placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
            ) : null}
            <label className="login-label block text-xs font-medium">
              Email Address
              <input
                required
                type="email"
                autoComplete="email"
                placeholder="you@company.com"
                className="login-input mt-1 w-full rounded-lg px-3 py-2.5 text-sm transition placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="login-label block text-xs font-medium">
              Password
              <input
                required
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="••••••••"
                className="login-input mt-1 w-full rounded-lg px-3 py-2.5 text-sm transition placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="login-button w-full rounded-lg py-2.5 text-sm font-semibold transition disabled:opacity-60"
            >
              {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
            </button>
          </form>

          <p className="login-footer-text mt-6 text-center text-xs">
            By continuing you agree to your organization&apos;s terms and acceptable use policy.
          </p>
        </div>
      </Page>
    </div>
  );
}
