import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

// Common
import WelcomePage from "./pages/WelcomePage";
import ProtectedRoute from "./components/ProtectedRoute";
import "./index.css";


// -------------------- GUIDE PAGES --------------------
import GuideLogin from "./pages/guide/GuideLogin";
import GuideRegister from "./pages/guide/GuideRegister";
import GuideDashboard from "./pages/guide/GuideDashboard";
import Profile from "./pages/guide/Profile.jsx";
import GuideGroupManagement from "./pages/guide/GroupManagement";
import ProjectApproval from "./pages/guide/ProjectApproval";
import Feedback from "./pages/guide/Feedback";

import ProjectEvaluation from "./pages/guide/ProjectEvaluation";



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
  useEffect(() => {
    // console.log("App.jsx mounted");
  }, []);

  return (
    <Router>
      <Routes>
        {/* -------------------- WELCOME -------------------- */}
        <Route path="/" element={<WelcomePage />} />

      

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
              <Profile />
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
              <Feedback />
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

       
        {/* -------------------- GENERIC -------------------- */}
        {/* <Route path="/login" element={<Navigate to="/admin/login" replace />} /> */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Router>
  );
}

export default App;
