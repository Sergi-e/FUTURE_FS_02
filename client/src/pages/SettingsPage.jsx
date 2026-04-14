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
              <input
                required
                type="password"
                autoComplete="current-password"
                className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-brand-cyan/50 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA]"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/65">
              New password
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={6}
                className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-brand-cyan/50 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA]"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </label>
            <label className="block text-xs font-medium text-slate-600 dark:text-[#E0F7FA]/65">
              Confirm new password
              <input
                required
                type="password"
                autoComplete="new-password"
                minLength={6}
                className="mt-1 w-full rounded-lg border border-slate-300/80 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none ring-2 ring-transparent transition focus:ring-brand-cyan/50 dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA]"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
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
