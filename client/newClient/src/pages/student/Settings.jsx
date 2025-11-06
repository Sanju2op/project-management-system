import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Key } from 'lucide-react';

function Settings() {
  const navigate = useNavigate();

  // Mock profile data
  const [profile, setProfile] = useState({
    name: 'Admin User',
    email: 'admin@college.edu'
  });

  // Password form state
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Success message state
  const [successMessage, setSuccessMessage] = useState('');

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  // Handle profile save
  const handleProfileSave = () => {
    console.log('Profile updated:', profile);
    setSuccessMessage('Profile updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle password submit
  const handlePasswordSubmit = () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setSuccessMessage('Passwords do not match!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    console.log('Password change requested:', {
      currentPassword: passwords.currentPassword,
      newPassword: passwords.newPassword
    });
    setSuccessMessage('Password changed successfully!');
    setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Handle back navigation
  const handleBack = () => {
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 font-sans">
      {/* Header */}
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
          >
            <ChevronLeft size={20} className="mr-2 text-white" /> Back to Dashboard
          </button>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
            Settings <span className="text-accent-teal">Panel</span>
          </h1>
          <div className="w-[200px]"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* Separation Line */}
      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

      {/* Main Content */}
      <div className="w-full max-w-7xl mx-auto mt-6 px-4 sm:px-6">
        {/* Success Message */}
        {successMessage && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-accent-teal font-semibold px-6 py-3 rounded-lg shadow-glow border border-white/30 z-50 animate-fade-in-down">
            {successMessage}
          </div>
        )}

        {/* Settings Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Profile Settings Card */}
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 animate-fade-in-down">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <User size={24} className="text-white mr-3" /> Profile Settings
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-lg font-semibold text-white mb-2">
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
                <label htmlFor="email" className="block text-lg font-semibold text-white mb-2">
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
                  onClick={handleProfileSave}
                  className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 animate-fade-in-down">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Key size={24} className="text-white mr-3" /> Change Password
            </h2>
            <div className="space-y-6">
              <div>
                <label htmlFor="currentPassword" className="block text-lg font-semibold text-white mb-2">
                  Current Password
                </label>
                <input
                  id="currentPassword"
                  name="currentPassword"
                  type="password"
                  value={passwords.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label htmlFor="newPassword" className="block text-lg font-semibold text-white mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  value={passwords.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-lg font-semibold text-white mb-2">
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200"
                  placeholder="Confirm new password"
                />
              </div>
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                  className="flex items-center bg-gray-600/80 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSubmit}
                  className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;