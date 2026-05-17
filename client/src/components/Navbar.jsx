import { useEffect, useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { useAddLeadCommand } from "../context/AddLeadCommandContext.jsx";

const linkClass =
  "rounded-lg px-3 py-2 text-sm font-medium transition text-slate-600 hover:bg-slate-200/80 hover:text-slate-900 dark:text-[#E0F7FA]/70 dark:hover:bg-white/10 dark:hover:text-white";

const activeClass =
  "bg-brand-cyan/15 text-brand-cyan dark:bg-brand-cyan/20 dark:text-violet-200";

/** Wheel/touch intents over modals & text fields should not drive the navbar. */
function scrollIntentIgnored(target) {
  if (!(target instanceof Element)) return true;

  const inModal = target.closest('[aria-modal="true"], [role="dialog"]');
  if (inModal) return true;

  const inFormControl = target.closest("textarea, select, option, [contenteditable='true']");
  if (inFormControl) return true;

  const input = target.closest("input");
  if (input) {
    const type = String(input.type || "text").toLowerCase();
    if (
      !["button", "checkbox", "radio", "submit", "reset", "hidden", "range", "color", "file"].includes(
        type
      )
    )
      return true;
  }

  return false;
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openAddLead } = useAddLeadCommand();
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);
  const [spacerHeight, setSpacerHeight] = useState(64);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const update = () => setSpacerHeight(el.offsetHeight);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const main = document.getElementById("main-content");
    const aside = document.getElementById("activity-feed-scroll");
    const DELTA_THRESHOLD = 8;
    const mainTopRevealPx = 40;

    lastScrollY.current = main?.scrollTop ?? 0;
    let lastAsideScroll = aside?.scrollTop ?? 0;
    let lastWinScroll = window.scrollY || document.documentElement.scrollTop || 0;

    function applyPrimaryAxis(deltaY, anchorScrollTop, topRevealPx) {
      if (anchorScrollTop <= topRevealPx) {
        setHidden(false);
        return;
      }
      if (deltaY > DELTA_THRESHOLD) setHidden(true);
      else if (deltaY < -DELTA_THRESHOLD) setHidden(false);
    }

    function applyDirection(deltaY) {
      if (deltaY > DELTA_THRESHOLD) setHidden(true);
      else if (deltaY < -DELTA_THRESHOLD) setHidden(false);
    }

    /** Center column + page fallback */
    function onMainScroll() {
      if (!main) return;
      const y = main.scrollTop;
      const d = y - lastScrollY.current;
      lastScrollY.current = y;
      applyPrimaryAxis(d, y, mainTopRevealPx);
    }

    /** Narrow screens hide the aside — guard still safe */
    function onAsideScroll() {
      if (!aside) return;
      const y = aside.scrollTop;
      const d = y - lastAsideScroll;
      lastAsideScroll = y;
      applyDirection(d);
    }

    /** Falls back only when `#main-content` is not the scroll container */
    function onWindowScroll() {
      const wy = window.scrollY || document.documentElement.scrollTop || 0;
      if (main && main.scrollHeight > main.clientHeight + 2) {
        lastWinScroll = wy;
        return;
      }
      const d = wy - lastWinScroll;
      lastWinScroll = wy;
      applyPrimaryAxis(d, wy, mainTopRevealPx);
    }

    /** Kanban/Pipeline nests `overflow-y-auto` per column — `main` stays at scrollTop 0. */
    function onWheelCapture(e) {
      if (scrollIntentIgnored(e.target)) return;
      if (e.ctrlKey) return;
      const dy = e.deltaY;
      const absX = Math.abs(e.deltaX);
      if (absX > Math.abs(dy) && absX > 12) return;

      /** Trackpads often stream small deltas; scroll listeners use DELTA_THRESHOLD. */
      const wheelThresh = 1;
      if (Math.abs(dy) < wheelThresh) return;
      if (dy > 0) setHidden(true);
      else setHidden(false);
    }

    main?.addEventListener("scroll", onMainScroll, { passive: true });
    aside?.addEventListener("scroll", onAsideScroll, { passive: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("wheel", onWheelCapture, { passive: true, capture: true });
    return () => {
      main?.removeEventListener("scroll", onMainScroll);
      aside?.removeEventListener("scroll", onAsideScroll);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("wheel", onWheelCapture, true);
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-50 glass-card border-b border-slate-200/60 px-4 py-3 transition-transform duration-300 ease-out motion-reduce:transition-none dark:border-[#2E4A5A] ${
          hidden ? "-translate-y-full" : "translate-y-0"
        }`}
      >
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-6">
          <Link
            to="/dashboard"
            className="text-lg font-semibold tracking-tight text-brand-cyan dark:text-violet-300"
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
              Pipeline
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
            className="rounded-lg bg-brand-cyan px-3 py-2 text-sm font-medium text-white shadow-neon transition hover:bg-cyan-500 dark:hover:bg-cyan-400"
          >
            Add lead
            <span className="ml-2 hidden text-xs font-normal opacity-80 sm:inline">
              Ctrl+K
            </span>
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg border border-slate-300/80 bg-white/50 px-3 py-2 text-sm text-slate-700 transition hover:bg-white dark:border-[#2E4A5A] dark:bg-[#243B47] dark:text-[#E0F7FA] dark:hover:bg-white/10"
            title="Toggle theme"
          >
            {theme === "dark" ? "Light mode" : "Dark mode"}
          </button>

          <span className="hidden text-sm text-slate-500 dark:text-[#E0F7FA]/50 sm:inline">
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
      <div className="shrink-0" style={{ height: spacerHeight }} aria-hidden />
    </>
  );
}
