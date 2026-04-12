import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAddLeadCommand } from "../context/AddLeadCommandContext.jsx";

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium transition text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-white/70 dark:hover:bg-white/10 dark:hover:text-white";

const activeClass =
  "bg-brand-violet/15 text-brand-violet dark:bg-brand-violet/20 dark:text-violet-200";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openAddLead } = useAddLeadCommand();

  return (
    <header className="glass-card border-b border-slate-200/60 px-4 py-3 dark:border-white/10">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-lg font-semibold tracking-tight text-brand-violet dark:text-violet-300"
          >
            Leadrift
          </Link>
          <nav className="flex items-center gap-1" aria-label="Primary">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/kanban"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
            >
              Kanban
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) => `${linkClass} ${isActive ? activeClass : ""}`}
            >
              Settings
            </NavLink>
          </nav>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={openAddLead}
            className="rounded-lg bg-brand-violet px-3 py-2 text-sm font-medium text-white shadow-neon transition hover:bg-violet-600 dark:hover:bg-violet-500"
          >
            Add lead
            <span className="ml-2 hidden text-xs font-normal opacity-80 sm:inline">
              Ctrl+K
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-300/80 bg-white/50 px-3 py-2 text-sm text-slate-700 transition hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
            title="Toggle theme"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <span className="hidden text-sm text-slate-500 dark:text-white/50 sm:inline">
            {user?.name}
          </span>
          <button
            type="button"
            onClick={logout}
            className="rounded-lg border border-brand-cyan/40 px-3 py-2 text-sm font-medium text-brand-cyan transition hover:bg-brand-cyan/10 dark:border-cyan-500/40 dark:text-cyan-300"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
