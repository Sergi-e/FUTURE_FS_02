import { Navigate, Outlet } from "react-router-dom";
import { useHasSession } from "../hooks/useHasSession.js";
import Navbar from "./Navbar.jsx";
import ActivityFeed from "./ActivityFeed.jsx";
import AIAssistant from "./AIAssistant.jsx";

export default function ProtectedLayout() {
  const hasSession = useHasSession();

  if (!hasSession) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1">
        <main id="main-content" className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-4">
          <div className="mx-auto w-full max-w-[1400px] flex-1 p-4 md:p-6">
            <Outlet />
          </div>
          <footer className="mt-8 py-4 text-center text-xs text-slate-500 dark:text-[#80CBC4]/70">
            &copy; {new Date().getFullYear()} Leadrift. All rights reserved.
          </footer>
        </main>
        <ActivityFeed />
      </div>
      <AIAssistant />
    </div>
  );
}
