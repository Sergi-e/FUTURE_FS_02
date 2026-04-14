import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext.jsx";
import Page from "../components/Page.jsx";

function getErrorMessage(err) {
  const m = err.response?.data?.message;
  if (typeof m === "string" && m.trim()) return m;
  if (!err.response) {
    return err.message?.trim() || "Could not reach the server.";
  }
  return "Something went wrong";
}

export default function SettingsPage() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirmation do not match");
      return;
    }
    setBusy(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Page>
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#E0F7FA]">Settings</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-[#E0F7FA]/55">
          Signed in as <span className="font-medium text-slate-800 dark:text-[#E0F7FA]/80">{user?.email}</span>
        </p>

        <section className="mt-8 rounded-2xl border border-slate-200/80 bg-white/60 p-6 shadow-sm dark:border-[#2E4A5A] dark:bg-[#243B47]">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-[#E0F7FA]">Change password</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#E0F7FA]/50">
            Use a strong password you do not reuse on other sites.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/65">
              Current password
              <div className="relative mt-1">
                <input
                  required
                  type={showCurrent ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your current password"
                  className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-brand-cyan/50 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-[#80CBC4] dark:hover:text-[#E0F7FA]"
                  tabIndex="-1"
                >
                  {showCurrent ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/65">
              New password
              <div className="relative mt-1">
                <input
                  required
                  type={showNew ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-brand-cyan/50 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-[#80CBC4] dark:hover:text-[#E0F7FA]"
                  tabIndex="-1"
                >
                  {showNew ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/65">
              Confirm new password
              <div className="relative mt-1">
                <input
                  required
                  type={showConfirm ? "text" : "password"}
                  autoComplete="new-password"
                  minLength={6}
                  placeholder="Type your new password again"
                  className="w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 pr-10 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-brand-cyan/50 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] placeholder:text-slate-400 dark:placeholder:text-[#80CBC4]/50"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:text-[#80CBC4] dark:hover:text-[#E0F7FA]"
                  tabIndex="-1"
                >
                  {showConfirm ? <EyeSlashIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                </button>
              </div>
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-lg bg-brand-cyan py-2.5 text-sm font-semibold text-white shadow-neon transition hover:bg-cyan-500 disabled:opacity-60 dark:hover:bg-cyan-400"
            >
              {busy ? "Updating…" : "Update password"}
            </button>
          </form>
        </section>
      </div>
    </Page>
  );
}

function EyeIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );
}

function EyeSlashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}
