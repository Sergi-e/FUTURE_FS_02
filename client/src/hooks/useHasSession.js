import { useAuth } from "../context/AuthContext.jsx";
import { readStoredToken } from "../constants/session.js";

/** True when React auth state or persisted token indicates a logged-in session. */
export function useHasSession() {
  const { token } = useAuth();
  const storedToken = readStoredToken();
  return Boolean(token || storedToken);
}
