// @ts-nocheck
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Book, Shield } from 'lucide-react';

function WelcomePage() {
  const navigate = useNavigate();

  const handleClick = (path) => {
    console.log(`Navigating to ${path}`);
    navigate(path);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white font-sans relative">
      <style>
        {`
          @keyframes slide-in {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes hover-scale {
            0% { transform: scale(1); }
            50% { transform: scale(1.05); }
            100% { transform: scale(1); }
          }
          .animate-slide-in {
            animation: slide-in 0.8s ease-out;
          }
          .hover-scale:hover {
            animation: hover-scale 0.3s ease-in-out forwards;
          }
          .bg-welcome-particles {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 800'%3E%3Ccircle fill='%238b5cf6' cx='150' cy='150' r='6'/%3E%3Ccircle fill='%238b5cf6' cx='650' cy='250' r='5'/%3E%3Ccircle fill='%238b5cf6' cx='350' cy='550' r='7'/%3E%3C/svg%3E") repeat;
            opacity: 0.15;
            z-index: 1;
            pointer-events: none;
          }
        `}
      </style>
      <div className="bg-welcome-particles" />
      <div className="text-center animate-slide-in relative z-10">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 drop-shadow-lg">
          Welcome to Project Excellence
        </h1>
        <p className="text-lg sm:text-xl text-white/80 mb-12">
          Select your role to proceed
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto px-4">
          <button
            type="button"
            onClick={() => handleClick('/admin/login')}
            onKeyDown={(e) => e.key === 'Enter' && handleClick('/admin/login')}
            className="flex flex-col items-center bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-xl shadow-lg border border-white/20 hover-scale transition duration-200 cursor-pointer relative z-20"
            aria-label="Admin Login"
            tabIndex={0}
          >
            <Shield size={48} className="text-white mb-4" />
            <span className="text-xl font-semibold">Admin</span>
          </button>
          <button
            type="button"
            onClick={() => handleClick('/guide/login')}
            onKeyDown={(e) => e.key === 'Enter' && handleClick('/guide/login')}
            className="flex flex-col items-center bg-gradient-to-r from-purple-600 to-indigo-600 p-6 rounded-xl shadow-lg border border-white/20 hover-scale transition duration-200 cursor-pointer relative z-20"
            aria-label="Guide Login"
            tabIndex={0}
          >
            <Book size={48} className="text-white mb-4" />
            <span className="text-xl font-semibold">Guide</span>
          </button>
          <button
            type="button"
            onClick={() => handleClick('/student/login')}
            onKeyDown={(e) => e.key === 'Enter' && handleClick('/student/login')}
            className="flex flex-col items-center bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-xl shadow-lg border border-white/20 hover-scale transition duration-200 cursor-pointer relative z-20"
            aria-label="Student Login"
            tabIndex={0}
          >
            <User size={48} className="text-white mb-4" />
            <span className="text-xl font-semibold">Student</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default WelcomePage;