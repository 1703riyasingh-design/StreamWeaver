import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const user = sessionStorage.getItem("streamweaver_user");

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
