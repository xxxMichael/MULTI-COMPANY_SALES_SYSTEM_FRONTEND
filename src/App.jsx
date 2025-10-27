// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AdminCreateModeratorPage from "./pages/AdminCreateModeratorPage";
import AdminUsersPage from "./pages/AdminUsersPage";
import WelcomePage from "./pages/WelcomePage";
import MarketplacePage from "./pages/MarketplacePage";
import MyProductsPage from "./pages/MyProductsPage";
import CreateProductPage from "./pages/CreateProductPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RecoverPasswordPage from "./pages/RecoverPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import EditProfilePage from "./pages/EditProfilePage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/marketplace" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route
          path="/admin/create-moderator"
          element={<AdminCreateModeratorPage />}
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute requiredRole={["ADMIN", "MODERATOR"]}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
        <Route path="/recover-password" element={<RecoverPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route
          path="/edit-profile"
          element={
            <ProtectedRoute>
              <EditProfilePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/marketplace"
          element={
            <ProtectedRoute>
              <MarketplacePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/welcome"
          element={
            <ProtectedRoute>
              <WelcomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/my-products"
          element={
            <ProtectedRoute>
              <MyProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/create-product"
          element={
            <ProtectedRoute>
              <CreateProductPage />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/marketplace" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
