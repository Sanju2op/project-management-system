import { Routes, Route, Navigate, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import WelcomePage from "./pages/WelcomePage";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import PasswordManager from "./components/PasswordManager";

export default function App() {
  // Note: ProtectedRoute should check for 'token' in localStorage to align with authAPI and AdminDashboard
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />

      {/* admin auth */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/forgot-password"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <div className="flex flex-col items-center">
              <PasswordManager role="admin" initialMode="forgot" />
              <p className="mt-4 text-gray-300">
                Remembered your password?{" "}
                <Link
                  to="/admin/login"
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Back to Login
                </Link>
              </p>
            </div>
          </div>
        }
      />

      <Route
        path="/admin/dashboard/*"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* default */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
