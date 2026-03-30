import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Navbar from "./Navbar.jsx";
import ActivityFeed from "./ActivityFeed.jsx";

export default function ProtectedLayout() {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="flex min-h-0 flex-1">
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-[1400px] p-4 md:p-6">
            <Outlet />
          </div>
        </div>
        <ActivityFeed />
      </div>
    </div>
  );
}
