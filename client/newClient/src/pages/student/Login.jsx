import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { BookOpen, GraduationCap, Users } from 'lucide-react';
import { studentPublicAPI } from '../../services/api';

function Login() {
  const navigate = useNavigate();
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!enrollmentNumber.trim() || !password.trim()) {
      setError('Both enrollment number and password are required.');
      return;
    }

    setLoading(true);
    try {
      const response = await studentPublicAPI.login({ enrollmentNumber: enrollmentNumber.trim(), password });
      localStorage.setItem('studentToken', response.token);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 p-4 font-sans">
      <div className="w-full max-w-5xl bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 flex flex-col lg:flex-row overflow-hidden transform transition-all duration-700 hover:scale-[1.02]">
        {/* Left Side - Branding */}
        <div className="lg:w-2/5 bg-gradient-to-br from-blue-600 to-purple-700 p-12 text-white flex flex-col justify-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent"></div>
          <div className="relative z-10">
            <div className="flex items-center mb-6">
              <GraduationCap size={48} className="text-white mr-3" />
              <h1 className="text-5xl font-bold tracking-tight">Project Excellence</h1>
            </div>
            <p className="text-xl opacity-90 leading-relaxed mb-8">
              Your gateway to academic success. Manage projects, collaborate with guides, and excel in your studies.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <BookOpen size={24} className="text-white/80 mr-3" />
                <span className="text-white/90">Project Management</span>
              </div>
              <div className="flex items-center">
                <Users size={24} className="text-white/80 mr-3" />
                <span className="text-white/90">Team Collaboration</span>
              </div>
              <div className="flex items-center">
                <GraduationCap size={24} className="text-white/80 mr-3" />
                <span className="text-white/90">Academic Excellence</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="lg:w-3/5 p-10 sm:p-14 bg-white/5 backdrop-blur-md">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4">Welcome Back!</h2>
            <p className="text-white/70 text-lg">Sign in to continue your academic journey</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-8">
            {error && (
              <div className="text-red-400 text-center bg-red-900/20 border border-red-500/50 rounded-lg p-3">
                {error}
              </div>
            )}
            <div className="space-y-6">
              <Input
                id="enrollmentNumber"
                label="Enrollment Number"
                type="text"
                placeholder="Enter your enrollment number"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                required
                className="w-full p-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              New to Project Excellence?{' '}
              <Link 
                to="/register" 
                className="text-blue-300 hover:text-white font-semibold transition-colors duration-200 hover:underline"
              >
                Create Account
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Background Animation */}
      <style>
        {`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-20px); }
          }
          .animate-float {
            animation: float 6s ease-in-out infinite;
          }
        `}
      </style>
    </div>
  );
}

export default Login;
