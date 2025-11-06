import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";

// Common
import WelcomePage from "./pages/WelcomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";

// -------------------- ADMIN PAGES --------------------
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PasswordManager from "./components/PasswordManager";

// -------------------- GUIDE PAGES --------------------
import GuideLogin from "./pages/guide/GuideLogin";
import GuideRegister from "./pages/guide/GuideRegister";
import GuideDashboard from "./pages/guide/GuideDashboard";
import GuideProfile from "./pages/guide/Profile";
import GuideGroupManagement from "./pages/guide/GroupManagement";
import ProjectApproval from "./pages/guide/ProjectApproval";
import GuideFeedback from "./pages/guide/Feedback";
import ProjectEvaluation from "./pages/guide/ProjectEvaluation";

// -------------------- STUDENT PAGES --------------------
import StudentLogin from "./pages/student/Login";
import StudentRegister from "./pages/student/Register";
import Home from "./pages/student/Home";
import StudentDashboard from "./pages/student/StudentDashboard";
import GroupManagement from "./pages/student/GroupManagement";
import Settings from "./pages/student/Settings";
import ProjectSubmission from "./pages/student/ProjectSubmission";
import StudentFeedback from "./pages/student/Feedback";
import Announcements from "./pages/student/Announcements";
import ExamSchedules from "./pages/student/ExamSchedules";
import GuideDetails from "./pages/student/GuideDetails";
import StudentProfile from "./pages/student/StudentProfile";
import GroupChat from "./pages/student/GroupChat";
import CreateGroup from "./pages/student/CreateGroup";

// -------------------- 404 PAGE --------------------
const NotFoundPage = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
    <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
    <p className="text-lg mb-4">The page you are looking for does not exist.</p>
    <a
      href="/"
      className="bg-gradient-to-r from-cyan-500 to-teal-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-opacity-90 transition duration-200"
    >
      Go to Welcome Page
    </a>
  </div>
);

function App() {
  return (
    <Routes>
      {/* -------------------- WELCOME -------------------- */}
      <Route path="/" element={<WelcomePage />} />

      {/* -------------------- ADMIN ROUTES -------------------- */}
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

      {/* -------------------- GUIDE ROUTES -------------------- */}
      <Route path="/guide/login" element={<GuideLogin />} />
      <Route path="/guide/register" element={<GuideRegister />} />
      <Route
        path="/guide/dashboard"
        element={
          <ProtectedRoute>
            <GuideDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guide/profile"
        element={
          <ProtectedRoute>
            <GuideProfile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guide/groups"
        element={
          <ProtectedRoute>
            <GuideGroupManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guide/projects"
        element={
          <ProtectedRoute>
            <ProjectApproval />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guide/feedback"
        element={
          <ProtectedRoute>
            <GuideFeedback />
          </ProtectedRoute>
        }
      />
      <Route
        path="/guide/evaluation"
        element={
          <ProtectedRoute>
            <ProjectEvaluation />
          </ProtectedRoute>
        }
      />
      {/* Default redirect for /guide → dashboard */}
      <Route path="/guide" element={<Navigate to="/guide/dashboard" replace />} />

      {/* -------------------- STUDENT ROUTES -------------------- */}
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/login" element={<Navigate to="/student/login" replace />} />
      <Route path="/register" element={<Navigate to="/student/register" replace />} />
      
      <Route path="/home" element={<Home />} />
      <Route path="/student/dashboard" element={<StudentDashboard />} />
      <Route path="/student/project-submission" element={<ProjectSubmission />} />
      <Route path="/student/group-management" element={<GroupManagement />} />
      <Route path="/student/feedback" element={<StudentFeedback />} />
      <Route path="/student/announcements" element={<Announcements />} />
      <Route path="/student/exam-schedules" element={<ExamSchedules />} />
      <Route path="/student/guide-details" element={<GuideDetails />} />
      <Route path="/student/profile" element={<StudentProfile />} />
      <Route path="/student/group-chat" element={<GroupChat />} />
      <Route path="/student/create-group" element={<CreateGroup />} />

      {/* -------------------- GENERIC -------------------- */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default App;
