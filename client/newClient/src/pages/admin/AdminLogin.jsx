import { useNavigate, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import Input from "../../components/UI/Input";
import Button from "../../components/UI/Button";
import { authAPI } from "../../services/api";

function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      navigate("/admin/dashboard");
    }
  }, [token, navigate]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const email = (formData.email || "").trim().toLowerCase();
    const password = (formData.password || "").trim();

    if (!email || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      const response = await authAPI.login({ email, password });
      // token is already persisted by authAPI; normalize user storage in case backend returns only _id/email
      if (response) {
        const userPayload = response.data || { _id: response._id, email: response.email };
        if (userPayload) {
          localStorage.setItem("user", JSON.stringify(userPayload));
        }
      }
      navigate("/admin/dashboard"); // <— admin-only for now
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Login failed. Please try again.";
      setError(msg);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 keep ALL your UI styles the same (pasted from your component)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 font-sans bg-gradient-to-br from-gray-800 to-gray-900">
      <div className="w-full max-w-4xl bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 flex flex-col lg:flex-row overflow-hidden transform transition-all duration-500 hover:scale-[1.01]">
        <div className="lg:w-1/2 bg-gradient-to-br from-accent-teal to-cyan-600 p-12 text-white flex flex-col justify-center rounded-t-2xl lg:rounded-tr-none lg:rounded-l-2xl animate-fade-in">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-lg">
            Project Management System
          </h1>
          <p className="text-lg opacity-90 leading-relaxed">
            Streamline your college projects with ease. Log in to manage guides,
            groups, and divisions efficiently.
          </p>
        </div>
        <div className="lg:w-1/2 p-8 sm:p-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-8 animate-slide-up">
            Admin Login
          </h2>
          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-center">
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="space-y-6">
            <Input
              id="email"
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email address"
              className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition-all duration-300"
            />
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-accent-teal to-cyan-500 text-white py-3 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition-all duration-300 shadow-neumorphic cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </Button>
          </form>
          {/* <p className="mt-6 text-center text-white/80">
            Don&apos;t have an account?{" "}
            <Link
              to="/admin/register"
              className="text-accent-teal hover:underline font-semibold transition-colors duration-200"
            >
              Create Account
            </Link>
          </p> */}
          <p className="mt-6 text-center text-white/80">
            Having trouble Logging in{" "}
            <Link
              to="/admin/forgot-password"
              state={{ email: formData.email }}
              className="text-accent-teal hover:underline font-semibold transition-colors duration-200"
            >
              forgot Password?
            </Link>
          </p>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.6s ease-out; }
        .animate-slide-up { animation: slide-up 0.6s ease-out; }
      `}</style>
    </div>
  );
}

export default AdminLogin;
