import { Navigate, Outlet } from "react-router-dom";
import { safeStorage } from "../utils/security";

function ProtectedRoute() {
  const user = safeStorage.get("streamweaver_user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;