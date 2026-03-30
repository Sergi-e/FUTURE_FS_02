import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "./Navbar.jsx";
import ActivityFeed from "./ActivityFeed.jsx";
import AddLeadModal from "./AddLeadModal.jsx";

export default function ProtectedLayout() {
  const { token } = useAuth();
  const location = useLocation();
  const [addOpen, setAddOpen] = useState(false);

  // Global shortcut — ignore when typing so we don't hijack browser search fields.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== "k") return;
      const t = e.target;
      if (
        t?.tagName === "INPUT" ||
        t?.tagName === "TEXTAREA" ||
        t?.isContentEditable
      ) {
        return;
      }
      e.preventDefault();
      setAddOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onOpenAddLead={() => setAddOpen(true)} />
      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="mx-auto max-w-[1400px] p-4 md:p-6"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
        <ActivityFeed />
      </div>
      <AddLeadModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
