// @ts-nocheck
import { useNavigate, Link } from 'react-router-dom';
import { useState } from 'react';
import { BookOpen, Users2, Award, BarChart3, AlertCircle } from 'lucide-react';
import { guideAuthAPI } from '../../services/api';

function GuideLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const response = await guideAuthAPI.guideLogin(formData);
      
      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.data));
      
      console.log('Guide login successful, navigating to /guide/dashboard');
      navigate('/guide/dashboard');
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 font-sans relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000'%3E%3Cdefs%3E%3CradialGradient id='a' cx='50%25' cy='50%25'%3E%3Cstop offset='0%25' stop-color='%23ffffff' stop-opacity='0.05'/%3E%3Cstop offset='100%25' stop-color='%23ffffff' stop-opacity='0'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle fill='url(%23a)' cx='200' cy='200' r='100'/%3E%3Ccircle fill='url(%23a)' cx='800' cy='300' r='150'/%3E%3Ccircle fill='url(%23a)' cx='400' cy='700' r='120'/%3E%3C/svg%3E')] opacity-30 animate-pulse"></div>
      
      <div className="w-full max-w-5xl bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 flex flex-col lg:flex-row overflow-hidden transform transition-all duration-500 hover:scale-[1.02] relative z-10">
        {/* Left Side - Branding */}
        <div className="lg:w-1/2 bg-gradient-to-br from-purple-600 via-pink-600 to-purple-800 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          {/* Animated gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/50 to-pink-600/50 animate-pulse"></div>
          <div className="relative z-10">
            <div className="mb-8">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-sm">
                <BookOpen size={32} className="text-white" />
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-6 tracking-tight drop-shadow-lg bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Guide Portal
              </h1>
            </div>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              Empower the next generation of innovators. Guide students through their academic journey with mentorship, feedback, and expertise.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Users2 size={16} className="text-white" />
                </div>
                <span className="text-white/90">Manage student groups efficiently</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Award size={16} className="text-white" />
                </div>
                <span className="text-white/90">Provide expert feedback and evaluations</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 size={16} className="text-white" />
                </div>
                <span className="text-white/90">Track progress and performance analytics</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Right Side - Login Form */}
        <div className="lg:w-1/2 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-2">
              Welcome Back
            </h2>
            <p className="text-purple-200/70">Sign in to your guide account</p>
          </div>
          
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-2xl text-red-200 text-center backdrop-blur-sm">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle size={16} />
                {error}
              </div>
            </div>
          )}
          
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-white font-medium text-sm">Email Address</label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full p-4 bg-white/10 text-white rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm placeholder-white/50"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-white font-medium text-sm">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full p-4 bg-white/10 text-white rounded-2xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-400 transition-all duration-300 backdrop-blur-sm placeholder-white/50"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-4 rounded-2xl font-bold text-lg hover:from-purple-600 hover:to-pink-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-purple-500/50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Signing In...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-purple-200/70">
              Don&apos;t have an account?{' '}
              <Link to="/guide/register" className="text-purple-300 hover:text-white font-semibold transition-colors duration-200 underline decoration-purple-400 underline-offset-4">
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>
      <style>
        {`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide-up {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fade-in 0.6s ease-out;
          }
          .animate-slide-up {
            animation: slide-up 0.6s ease-out;
          }
        `}
      </style>
    </div>
  );
}

export default GuideLogin;
