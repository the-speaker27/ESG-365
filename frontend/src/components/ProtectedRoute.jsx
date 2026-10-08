import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { ROLE_HOME_PATH } from "../utils/constants.js";

export default function ProtectedRoute() {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
}

export function RoleRoute({ allowedRoles }) {
  const { user } = useAuth();
  if (!allowedRoles.includes(user?.role)) {
    return <Navigate to={ROLE_HOME_PATH[user?.role] || "/login"} replace />;
  }
  return <Outlet />;
}