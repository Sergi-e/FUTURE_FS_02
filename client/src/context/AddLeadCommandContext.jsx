import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "./AuthContext.jsx";
import AddLeadModal from "../components/AddLeadModal.jsx";

const AddLeadCommandContext = createContext(null);

/**
 * Ctrl/Cmd+K opens the add-lead modal from any authenticated screen (not only Kanban).
 */
export function AddLeadCommandProvider({ children }) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);

  const openAddLead = useCallback(() => setOpen(true), []);

  useEffect(() => {
    if (!token) {
      setOpen(false);
      return;
    }
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
      setOpen(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [token]);

  const value = useMemo(() => ({ openAddLead }), [openAddLead]);

  return (
    <AddLeadCommandContext.Provider value={value}>
      {children}
      {token ? (
        <AddLeadModal open={open} onClose={() => setOpen(false)} />
      ) : null}
    </AddLeadCommandContext.Provider>
  );
}

export function useAddLeadCommand() {
  const ctx = useContext(AddLeadCommandContext);
  if (!ctx) {
    return { openAddLead: () => {} };
  }
  return ctx;
}
