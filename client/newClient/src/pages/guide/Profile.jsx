// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Key, Mail, LogOut } from 'lucide-react';
import { guideAuthAPI } from '../../services/api';

export default function Profile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    expertise: '',
  });

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setProfile(p => ({
        ...p,
        name: user.name || '',
        email: user.email || '',
        department: user.department || '',
        designation: user.designation || '',
        expertise: user.expertise || '',
      }));
    }
  }, []);

  const handleProfileSave = async () => {
    setLoading(true);
    setMessage('');

    try {
      const updatedProfile = await guideAuthAPI.updateGuideProfile(profile);
      
      setLoading(false);
      setMessage('Profile updated successfully!');
      
      // Update user data in localStorage
      localStorage.setItem('user', JSON.stringify(updatedProfile.data));

      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setLoading(false);
      setMessage(error.message || 'Failed to update profile.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePasswordSubmit = async () => {
    if (passwords.newPassword !== passwords.confirmPassword) {
      setMessage('New passwords do not match!');
      setTimeout(() => setMessage(''), 3000);
      return;
    }
    if (passwords.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await guideAuthAPI.changeGuidePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      
      setLoading(false);
      setMessage('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setMessage(''), 3000);

    } catch (error) {
      setLoading(false);
      setMessage(error.message || 'Failed to change password.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/guide/login');
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <button
            onClick={() => navigate('/guide/dashboard')}
            className="flex items-center bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30"
          >
            <ChevronLeft size={18} className="mr-2" /> Back to Dashboard
          </button>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-white drop-shadow-lg">
            Guide <span className="text-teal-400">Profile</span>
          </h1>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/guide/dashboard')}
              className="bg-white/10 text-white py-2 px-4 rounded-lg border border-white/30 hover:bg-white/20 transition"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center bg-red-500/30 text-white py-2 px-4 rounded-lg border border-red-400/30 hover:bg-red-500/40 transition"
            >
              <LogOut size={18} className="mr-2" /> Logout
            </button>
          </div>
        </div>
      </div>

      {message && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md text-teal-400 font-semibold px-6 py-3 rounded-lg border border-white/30 z-50">
          {message}
        </div>
      )}

      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-32">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 lg:col-span-3">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <User size={24} className="text-white mr-3" /> Profile Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Full Name</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Email Address</label>
                <div className="flex items-center bg-white/10 rounded-lg border border-white/20 px-3">
                  <Mail size={18} className="text-white/80 mr-2" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))}
                    className="w-full py-3 bg-transparent text-white outline-none"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Department</label>
                <input
                  type="text"
                  value={profile.department}
                  onChange={(e) => setProfile((p) => ({ ...p, department: e.target.value }))}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your department"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Designation</label>
                <input
                  type="text"
                  value={profile.designation}
                  onChange={(e) => setProfile((p) => ({ ...p, designation: e.target.value }))}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your designation"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Expertise</label>
                <input
                  type="text"
                  value={profile.expertise}
                  onChange={(e) => setProfile((p) => ({ ...p, expertise: e.target.value }))}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter your expertise"
                />
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={handleProfileSave}
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Profile'}
              </button>
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-md p-8 rounded-3xl shadow-glow border border-white/30 lg:col-span-3">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Key size={24} className="text-white mr-3" /> Change Password
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Current Password</label>
                <input
                  type="password"
                  value={passwords.currentPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter current password"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">New Password</label>
                <input
                  type="password"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Enter new password"
                />
              </div>
              <div>
                <label className="block text-lg font-semibold text-white mb-2">Confirm Password</label>
                <input
                  type="password"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full p-3 bg-white/10 text-white rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' })}
                className="bg-gray-600/80 text-white py-2 px-6 rounded-lg font-semibold hover:bg-gray-700 hover:scale-105 transition border border-white/30"
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                disabled={loading}
                className="bg-gradient-to-r from-teal-500 to-cyan-400 text-white py-2 px-6 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition border border-white/30 disabled:opacity-50"
              >
                {loading ? 'Updating...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
