import { Navigate } from "react-router-dom";
import { isLoggedIn, getAuth } from "../state/auth";

export default function ProtectedRoute({ children, requiredRole }) {
  if (!isLoggedIn()) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const auth = getAuth();
    const userRole = auth?.user?.rol;

    // Si requiredRole es un array, verificar si el rol del usuario está incluido
    if (Array.isArray(requiredRole)) {
      if (!requiredRole.includes(userRole)) {
        return <Navigate to="/marketplace" replace />;
      }
    } else {
      // Si es un string, verificar igualdad
      if (userRole !== requiredRole) {
        return <Navigate to="/marketplace" replace />;
      }
    }
  }

  return children;
}
