import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Import all your page components
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Home from "./pages/Home.jsx";
import GroupManagement from "./pages/GroupManagement.jsx";
import Settings from "./pages/Settings.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import ProjectSubmission from "./pages/ProjectSubmission.jsx";
import StudentRequests from "./pages/StudentRequests.jsx";
import Announcements from "./pages/Announcements.jsx";
import ExamSchedules from "./pages/ExamSchedules.jsx";
import GuideDetails from "./pages/GuideDetails.jsx";
import StudentProfile from "./pages/StudentProfile.jsx";
import GroupChat from "./pages/GroupChat.jsx";
import CreateGroup from "./pages/CreateGroup.jsx";
import StudentDocuments from "./pages/StudentDocuments.jsx";

function App() {
  return (
    <Router>
      <Routes>
        {/* Default route for the application, typically the Login page */}
        <Route path="/" element={<Login />} />

        {/* Authentication routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Dashboard route */}
        <Route path="/home" element={<Home />} />

        {/* Student Dashboard route */}
        <Route path="/student/dashboard" element={<StudentDashboard />} />

        {/* Student Module routes */}
        <Route
          path="/student/project-submission"
          element={<ProjectSubmission />}
        />
        <Route path="/student/group-management" element={<GroupManagement />} />
        <Route path="/student/feedback" element={<StudentRequests />} />
        <Route path="/student/announcements" element={<Announcements />} />
        <Route path="/student/exam-schedules" element={<ExamSchedules />} />
        <Route path="/student/guide-details" element={<GuideDetails />} />
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/group-chat" element={<GroupChat />} />
        <Route path="/student/create-group" element={<CreateGroup />} />
        <Route path="/student/documents" element={<StudentDocuments />} />

        {/* Optional: A catch-all route for 404 Not Found pages */}
        {/* <Route path="*" element={<NotFoundPage />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
