import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { BookOpen, GraduationCap, Users, UserPlus } from 'lucide-react';
import { studentPublicAPI } from '../../services/api';

function Register() {
  const navigate = useNavigate();
  const [enrollmentNumber, setEnrollmentNumber] = useState('');
  const [name, setName] = useState('');
  const [mobileNo, setMobileNo] = useState('');
  const [email, setEmail] = useState('');
  const [division, setDivision] = useState('');
  const [divisions, setDivisions] = useState([]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [enrollmentOptions, setEnrollmentOptions] = useState([]);

  useEffect(() => {
    const loadDivisions = async () => {
      try {
        const list = await studentPublicAPI.getDivisions();
        setDivisions(list.map(d => ({ id: d._id, label: `${d.course} Sem ${d.semester} - ${d.year}` })));
      } catch (e) {
        console.error(e);
      }
    };
    loadDivisions();
  }, []);

  useEffect(() => {
    const loadEnrollments = async () => {
      try {
        setEnrollmentNumber('');
        if (!division) { setEnrollmentOptions([]); return; }
        const list = await studentPublicAPI.getPendingEnrollments(division);
        setEnrollmentOptions(list.map(s => s.enrollmentNumber));
      } catch (e) {
        console.error(e);
      }
    };
    loadEnrollments();
  }, [division]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!division || !enrollmentNumber || !name || !password || password !== confirmPassword) return;
    try {
      await studentPublicAPI.register({
        divisionId: division,
        enrollmentNumber,
        name,
        phone: mobileNo,
        email,
        password,
      });
      navigate('/login');
    } catch (err) {
      console.error(err);
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
              Join our academic community. Create your account and start your journey towards excellence.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <UserPlus size={24} className="text-white/80 mr-3" />
                <span className="text-white/90">Easy Registration</span>
              </div>
              <div className="flex items-center">
                <Users size={24} className="text-white/80 mr-3" />
                <span className="text-white/90">Student Community</span>
              </div>
              <div className="flex items-center">
                <BookOpen size={24} className="text-white/80 mr-3" />
                <span className="text-white/90">Academic Excellence</span>
              
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="lg:w-3/5 p-10 sm:p-14 bg-white/5 backdrop-blur-md">
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold text-white mb-4">Create Account</h2>
            <p className="text-white/70 text-lg">Join Project Excellence and start your academic journey</p>
          </div>
          
          <form onSubmit={handleRegister} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
             <Input
                id="name"
                label="Full Name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
               <Input
                id="mobileNo"
                label="Mobile Number"
                type="tel"
                placeholder="Enter mobile number"
                value={mobileNo}
                onChange={(e) => setMobileNo(e.target.value)}
                className="w-full p-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
               <Input
                id="email"
                label="Email"
                type="email"
                placeholder="Enter your email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
               <div className="mb-4">
                <label htmlFor="division" className="block text-white text-sm font-medium mb-2">Select Division</label>
                <select
                  id="division"
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full p-3 bg-white/10 text-black rounded-lg border border-white/20 focus:outline-none focus:ring-2 focus:ring-accent-teal transition duration-200 placeholder-white/60"
                >
                  <option value="">Select your Division</option>
                  {divisions.map(d => (
                    <option key={d.id} value={d.id}>{d.label}</option>
                  ))}
                </select>
              </div>
              <Input
                id="enrollmentNumber"
                label="Enrollment Number"
                type="select"
                placeholder="Select enrollment number"
                value={enrollmentNumber}
                onChange={(e) => setEnrollmentNumber(e.target.value)}
                options={enrollmentOptions}
                className="w-full p-4 bg-white/10 text-black rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Create password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
              <Input
                id="confirmPassword"
                label="Confirm Password"
                type="password"
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-white/10 text-white rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 backdrop-blur-sm"
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 hover:scale-105 transition-all duration-300 shadow-2xl"
            >
              Create Account
            </Button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-white/70">
              Already have an account?{' '}
              <Link 
                to="/login" 
                className="text-blue-300 hover:text-white font-semibold transition-colors duration-200 hover:underline"
              >
                Sign In
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

export default Register;
