import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

/**
 * One shared Socket.io connection for the whole app — avoids duplicate sockets
 * and keeps dashboard / kanban / activity feed in sync with the server.
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

    const s = io({
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
