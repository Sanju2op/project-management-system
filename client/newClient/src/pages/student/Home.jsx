import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Calendar, Building, SlidersHorizontal, UserPlus, LayoutGrid, Settings, LogOut, Key, User } from 'lucide-react';

function Home() {
  const navigate = useNavigate();
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const settingsMenuRef = useRef(null);
  const settingsIconRef = useRef(null);

  // Close settings menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        settingsMenuRef.current &&
        !settingsMenuRef.current.contains(event.target) &&
        settingsIconRef.current &&
        !settingsIconRef.current.contains(event.target)
      ) {
        setIsSettingsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const goToGuides = () => {
    console.log('Navigating to Guide Management');
    navigate('/admin/guides');
  };

  const goToGroups = () => {
    console.log('Navigating to Group Management');
    navigate('/admin/groups');
  };

  const goToProjects = () => {
    console.log('Navigating to Project Management');
    navigate('/admin/projects');
  };

  const goToExamSchedules = () => {
    console.log('Navigating to Exam Schedules');
    navigate('/admin/schedules');
  };

  const goToDivisions = () => {
    console.log('Navigating to Division Management');
    navigate('/admin/divisions');
  };

  const goToEvaluationParameters = () => {
    console.log('Navigating to Evaluation Parameters');
    navigate('/admin/evaluation-parameters');
  };

  const goToGuideRequests = () => {
    console.log('Navigating to Guide Requests');
    navigate('/admin/guide-requests');
  };

  // Settings menu actions
  const handleProfileSettings = () => {
    console.log('Navigating to Settings');
    setIsSettingsMenuOpen(false);
    navigate('/admin/settings');
  };

  const handleChangePassword = () => {
    console.log('Navigating to Settings');
    setIsSettingsMenuOpen(false);
    navigate('/admin/settings');
  };

  const handleLogout = () => {
    console.log('Logging out');
    setIsSettingsMenuOpen(false);
    navigate('/login');
  };

  // Helper component for a dashboard card
  const DashboardCard = ({ icon: Icon, title, description, onClick, index }) => (
    <div
      className="bg-white/20 backdrop-blur-md p-10 rounded-3xl shadow-glow border border-white/30 hover:scale-[1.03] transition-all duration-300 flex flex-col items-center text-center animate-fade-in-up"
      style={{ animationDelay: `${index * 0.15}s` }}
    >
      <Icon size={80} className="text-white mb-4 drop-shadow-md hover:animate-pulse" />
      <h2 className="text-2xl sm:text-2xl font-bold text-white mb-3">{title}</h2>
      {description && <p className="text-lg text-white/90 mb-4 flex-grow">{description}</p>}
      <button
        onClick={onClick}
        className="flex items-center bg-gradient-to-r from-accent-teal to-cyan-400 text-white py-2 px-6 sm:px-4 rounded-lg font-semibold hover:bg-opacity-90 hover:scale-105 transition duration-200 shadow-glow border border-white/30 backdrop-blur-md"
      >
        {`Go to ${title.replace('Manage ', '').replace('s', '')}`}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-900 font-sans">
      <div className="sticky top-0 w-full bg-white/20 backdrop-blur-md border-b border-white/30 shadow-glow z-10 py-4 sm:py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white drop-shadow-lg">
            Admin <span className="text-accent-teal">Control Center</span>
          </h1>
          <div className="relative">
            <Settings
              ref={settingsIconRef}
              size={40}
              className={`text-white hover:text-accent-teal transition duration-200 cursor-pointer drop-shadow-md ${isSettingsMenuOpen ? 'animate-spin' : ''}`}
              onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
              title="System Settings"
            />
            {isSettingsMenuOpen && (
              <div
                ref={settingsMenuRef}
                className="absolute right-0 mt-2 w-52 bg-white/20 backdrop-blur-md rounded-lg shadow-glow border border-white/30 overflow-hidden"
              >
                <ul className="py-2">
                  <li>
                    <button
                      onClick={handleProfileSettings}
                      className="flex items-center w-full px-4 py-2 text-white hover:bg-accent-teal/30 transition duration-150"
                    >
                      <User size={20} className="mr-3 text-white" /> Profile Settings
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleChangePassword}
                      className="flex items-center w-full px-4 py-2 text-white hover:bg-accent-teal/30 transition duration-150"
                    >
                      <Key size={20} className="mr-3 text-white" /> Change Password
                    </button>
                  </li>
                  <li>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-white hover:bg-accent-teal/30 transition duration-150"
                    >
                      <LogOut size={20} className="mr-3 text-white" /> Logout
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>

      <div className="w-full max-w-7xl mx-auto mt-6 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            {
              icon: Users,
              title: 'Manage Guides',
              description: 'View, add, edit, and manage guide profiles.',
              onClick: goToGuides
            },
            {
              icon: LayoutGrid,
              title: 'Manage Groups',
              description: 'Organize and oversee student project groups.',
              onClick: goToGroups
            },
            {
              icon: Briefcase,
              title: 'Manage Projects',
              description: 'Oversee project assignments and progress.',
              onClick: goToProjects
            },
            {
              icon: Calendar,
              title: 'Exam Schedules',
              description: 'Create, update, and delete all project and seminar schedules.',
              onClick: goToExamSchedules
            },
            {
              icon: Building,
              title: 'Manage Divisions',
              description: 'Add and manage college divisions.',
              onClick: goToDivisions
            },
            {
              icon: SlidersHorizontal,
              title: 'Evaluation Parameters',
              description: 'Define project evaluation criteria and percentages.',
              onClick: goToEvaluationParameters
            },
            {
              icon: UserPlus,
              title: 'Guide Requests',
              description: 'Review and approve/reject new guide registrations.',
              onClick: goToGuideRequests
            }
          ].map((card, index) => (
            <DashboardCard
              key={card.title}
              icon={card.icon}
              title={card.title}
              description={card.description}
              onClick={card.onClick}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Home;