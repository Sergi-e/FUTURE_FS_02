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

/** While dragging Pipeline cards @dnd-kit handles the gesture; nav must not twitch. */
function navScrollSuspended() {
  try {
    return typeof document !== "undefined" && document.body?.dataset?.leadriftKanbanDrag === "1";
  } catch {
    return false;
  }
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { openAddLead } = useAddLeadCommand();
  const headerRef = useRef(null);
  const lastScrollY = useRef(0);
  const touchPivot = useRef({ x: 0, y: 0, active: false });
  const touchScrollAcc = useRef(0);
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
    const TOUCH_COMMIT = 14;

    lastScrollY.current = main?.scrollTop ?? 0;
    let lastAsideScroll = aside?.scrollTop ?? 0;
    let lastWinScroll = window.scrollY || document.documentElement.scrollTop || 0;

    const nestedCleanups = [];
    const wiredNested = new Set();

    function applyPrimaryAxis(deltaY, anchorScrollTop, topRevealPx) {
      if (navScrollSuspended()) return;
      if (anchorScrollTop <= topRevealPx) {
        setHidden(false);
        return;
      }
      if (deltaY > DELTA_THRESHOLD) setHidden(true);
      else if (deltaY < -DELTA_THRESHOLD) setHidden(false);
    }

    function applyDirection(deltaY) {
      if (navScrollSuspended()) return;
      if (deltaY > DELTA_THRESHOLD) setHidden(true);
      else if (deltaY < -DELTA_THRESHOLD) setHidden(false);
    }

    function wireNestedScroll(el) {
      if (!(el instanceof HTMLElement) || wiredNested.has(el)) return;
      wiredNested.add(el);
      let lastTop = el.scrollTop;

      function onNest() {
        if (navScrollSuspended()) return;
        const y = el.scrollTop;
        const d = y - lastTop;
        lastTop = y;
        applyDirection(d);
      }

      lastTop = el.scrollTop;
      el.addEventListener("scroll", onNest, { passive: true });
      nestedCleanups.push(() => {
        el.removeEventListener("scroll", onNest);
        wiredNested.delete(el);
      });
    }

    function ingestScrollShellRoots(root) {
      if (!root || typeof root.querySelectorAll !== "function") return;
      if (root instanceof HTMLElement && root.hasAttribute("data-shell-scroll")) {
        wireNestedScroll(root);
      }
      root.querySelectorAll("[data-shell-scroll]").forEach((node) => {
        wireNestedScroll(node);
      });
    }

    /** Center column + page fallback */
    function onMainScroll() {
      if (!main) return;
      const y = main.scrollTop;
      const d = y - lastScrollY.current;
      lastScrollY.current = y;
      applyPrimaryAxis(d, y, mainTopRevealPx);
    }

    /** Narrow screens hide the aside (guard still safe). */
    function onAsideScroll() {
      if (!aside) return;
      const y = aside.scrollTop;
      const d = y - lastAsideScroll;
      lastAsideScroll = y;
      applyDirection(d);
    }

    /** Falls back only when `#main-content` is not the scroll container */
    function onWindowScroll() {
      if (navScrollSuspended()) return;
      const wy = window.scrollY || document.documentElement.scrollTop || 0;
      if (main && main.scrollHeight > main.clientHeight + 2) {
        lastWinScroll = wy;
        return;
      }
      const d = wy - lastWinScroll;
      lastWinScroll = wy;
      applyPrimaryAxis(d, wy, mainTopRevealPx);
    }

    /** Kanban/desktop: nested lanes do not bubble scroll to `#main-content`. */
    function onWheelCapture(e) {
      if (navScrollSuspended()) return;
      if (scrollIntentIgnored(e.target)) return;
      if (e.ctrlKey) return;
      const dy = e.deltaY;
      const absX = Math.abs(e.deltaX);
      if (absX > Math.abs(dy) && absX > 12) return;

      const wheelThresh = 1;
      if (Math.abs(dy) < wheelThresh) return;
      if (dy > 0) setHidden(true);
      else setHidden(false);
    }

    /** Phones / tablets: incremental drag scroll without `wheel` events. */
    function onTouchStart(e) {
      if (navScrollSuspended()) return;
      const t = e.touches[0];
      if (!t || scrollIntentIgnored(e.target)) {
        touchPivot.current.active = false;
        return;
      }
      touchPivot.current = { x: t.clientX, y: t.clientY, active: true };
      touchScrollAcc.current = 0;
    }

    function onTouchMove(e) {
      if (!touchPivot.current.active || navScrollSuspended()) return;
      const t = e.touches[0];
      if (!t || scrollIntentIgnored(e.target)) return;

      const { x: px, y: py } = touchPivot.current;
      const dx = t.clientX - px;
      const dy = py - t.clientY;

      touchPivot.current.x = t.clientX;
      touchPivot.current.y = t.clientY;

      const horizontallyDominant =
        Math.abs(dx) > Math.abs(dy) * 1.15 && Math.abs(dx) > 10;
      if (horizontallyDominant) return;

      if (Math.abs(dy) < 3) return;

      touchScrollAcc.current += dy;
      while (touchScrollAcc.current >= TOUCH_COMMIT) {
        if (!navScrollSuspended()) setHidden(true);
        touchScrollAcc.current -= TOUCH_COMMIT;
      }
      while (touchScrollAcc.current <= -TOUCH_COMMIT) {
        if (!navScrollSuspended()) setHidden(false);
        touchScrollAcc.current += TOUCH_COMMIT;
      }
    }

    function onTouchGestureEnd() {
      touchPivot.current.active = false;
      touchScrollAcc.current = 0;
    }

    main?.addEventListener("scroll", onMainScroll, { passive: true });
    aside?.addEventListener("scroll", onAsideScroll, { passive: true });
    window.addEventListener("scroll", onWindowScroll, { passive: true });
    window.addEventListener("wheel", onWheelCapture, { passive: true, capture: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true, capture: true });
    window.addEventListener("touchend", onTouchGestureEnd, { passive: true, capture: true });
    window.addEventListener("touchcancel", onTouchGestureEnd, { passive: true, capture: true });

    let mutationObserver = null;
    if (main) {
      ingestScrollShellRoots(main);
      mutationObserver = new MutationObserver((records) => {
        for (const rec of records) {
          rec.addedNodes.forEach((node) => {
            if (node.nodeType === 1) ingestScrollShellRoots(node);
          });
        }
      });
      mutationObserver.observe(main, { childList: true, subtree: true });
    }

    return () => {
      main?.removeEventListener("scroll", onMainScroll);
      aside?.removeEventListener("scroll", onAsideScroll);
      window.removeEventListener("scroll", onWindowScroll);
      window.removeEventListener("wheel", onWheelCapture, true);
      window.removeEventListener("touchstart", onTouchStart, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      window.removeEventListener("touchend", onTouchGestureEnd, true);
      window.removeEventListener("touchcancel", onTouchGestureEnd, true);
      mutationObserver?.disconnect();
      nestedCleanups.forEach((fn) => fn());
      wiredNested.clear();
    };
  }, []);

  return (
    <>
      <header
        ref={headerRef}
        inert={hidden ? true : undefined}
        className={`fixed inset-x-0 top-0 z-50 glass-card border-b border-slate-200/60 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top,0px))] transition-transform duration-300 ease-out motion-reduce:transition-none dark:border-[#2E4A5A] ${
          hidden ? "-translate-y-full pointer-events-none" : "translate-y-0"
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
      <div
        className="shrink-0 overflow-hidden transition-[height] duration-300 ease-out motion-reduce:transition-none"
        style={{ height: hidden ? 0 : spacerHeight }}
        aria-hidden
      />
    </>
  );
}
