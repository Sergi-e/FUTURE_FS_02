import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import api from "../utils/api.js";
import {
  LEADRIFT_TOKEN_KEY,
  LEADRIFT_USER_KEY,
} from "../constants/session.js";

const AuthContext = createContext(null);

function readStoredUser() {
  try {
    const raw = localStorage.getItem(LEADRIFT_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(LEADRIFT_TOKEN_KEY));
  const [user, setUser] = useState(readStoredUser);

  useEffect(() => {
    const onUnauthorized = () => {
      setToken(null);
      setUser(null);
    };
    window.addEventListener("leadrift:unauthorized", onUnauthorized);
    return () => window.removeEventListener("leadrift:unauthorized", onUnauthorized);
  }, []);

  const persistSession = useCallback((nextToken, nextUser) => {
    if (nextToken) localStorage.setItem(LEADRIFT_TOKEN_KEY, nextToken);
    else localStorage.removeItem(LEADRIFT_TOKEN_KEY);
    if (nextUser) localStorage.setItem(LEADRIFT_USER_KEY, JSON.stringify(nextUser));
    else localStorage.removeItem(LEADRIFT_USER_KEY);
    setToken(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    persistSession(data.token, data.user);
    return data;
  }, [persistSession]);

  const register = useCallback(async (name, email, password) => {
    const { data } = await api.post("/auth/register", { name, email, password });
    persistSession(data.token, data.user);
    return data;
  }, [persistSession]);

  const logout = useCallback(() => {
    persistSession(null, null);
  }, [persistSession]);

  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token),
      login,
      register,
      logout,
    }),
    [token, user, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
