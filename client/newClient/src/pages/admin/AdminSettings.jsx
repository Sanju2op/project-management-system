import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Shield } from "lucide-react";
import { adminAPI } from "../../services/api";

// PasswordManager component is now defined inside this file to comply with the single-file mandate.
const PasswordManager = ({ role }) => {
  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setMessage("Passwords do not match!");
      setMessageType("error");
      return;
    }

    try {
      setLoading(true);
      const response = await adminAPI.changePassword({
        oldPassword: formData.oldPassword,
        newPassword: formData.newPassword,
      });
      setMessage(response.data.message);
      setMessageType("success");
      setFormData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to change password");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  return (
    <form
      onSubmit={handleChangePassword}
      className="space-y-6 bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 animate-fade-in-down"
    >
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
        <Shield size={24} className="text-white mr-3" /> Change Password
      </h2>
      <div className="space-y-6">
        <div>
          <label
            htmlFor="oldPassword"
            className="block text-lg font-semibold text-white mb-2"
          >
            Current Password
          </label>
          <input
            id="oldPassword"
            name="oldPassword"
            type="password"
            value={formData.oldPassword}
            onChange={handleChange}
            className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
            placeholder="Enter current password"
            required
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-lg font-semibold text-white mb-2"
          >
            New Password
          </label>
          <input
            id="newPassword"
            name="newPassword"
            type="password"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-lg font-semibold text-white mb-2"
          >
            Confirm New Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
            placeholder="Confirm new password"
            required
          />
        </div>
        <div className="flex justify-end gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30"
          >
            {loading ? "Changing..." : "Change Password"}
          </button>
        </div>
      </div>
      {message && (
        <div
          className={`mt-4 text-center font-medium ${
            messageType === "success" ? "text-green-400" : "text-red-400"
          }`}
        >
          {message}
        </div>
      )}
    </form>
  );
};

const AdminSettings = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState(""); // 'success' or 'error'

  // Fetch profile data on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getProfile();
        setProfile({ name: response.data.name, email: response.data.email });
      } catch {
        setMessage("Failed to load profile");
        setMessageType("error");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");
    try {
      setLoading(true);
      const response = await adminAPI.updateProfile(profile);
      setMessage(response.data.message || "Profile updated successfully!");
      setMessageType("success");
    } catch (error) {
      setMessage(error?.response?.data?.message || "Failed to update profile");
      setMessageType("error");
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(""), 3000);
    }
  };

  const handleBack = () => {
    navigate("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 font-sans">
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30"
          >
            <ChevronLeft size={20} className="mr-2 text-white" /> Back to
            Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
            Settings <span className="text-accent-teal">Panel</span>
          </h1>
          <div className="w-[200px]"></div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

      <div className="w-full max-w-7xl mx-auto mt-6 px-4 sm:px-6">
        {message && (
          <div
            className={`fixed top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md font-semibold px-6 py-3 rounded-lg shadow-glow border border-white/30 z-50 animate-fade-in-down ${
              messageType === "success" ? "text-green-400" : "text-red-400"
            }`}
          >
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <form
            onSubmit={handleSubmitProfile}
            className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 animate-fade-in-down"
          >
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <User size={24} className="text-white mr-3" /> Profile Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={profile.name}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block text-lg font-semibold text-white mb-2"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30"
                >
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </div>
            </div>
          </form>

          {/* Password Manager Component is now included here */}
          <PasswordManager role="admin" />
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;
