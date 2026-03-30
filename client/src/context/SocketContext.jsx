import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";
import { getApiOrigin } from "../utils/api.js";

const SocketContext = createContext(null);

/**
 * Socket.io must hit the same host as Express. With the client on :5173 and API on :5000,
 * we connect explicitly instead of relying on the Vite proxy.
 */
export function SocketProvider({ children }) {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!token) {
      setSocket((prev) => {
        prev?.disconnect();
        return null;
      });
      return;
    }

    const s = io(getApiOrigin(), {
      path: "/socket.io",
      autoConnect: true,
      transports: ["websocket", "polling"],
    });

    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, [token]);

  const value = useMemo(() => socket, [socket]);
  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  return useContext(SocketContext);
}
