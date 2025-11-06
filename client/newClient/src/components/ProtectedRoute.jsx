import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const studentToken = localStorage.getItem('studentToken');
  const studentDataStr = localStorage.getItem('studentData');
  
  const user = userStr ? JSON.parse(userStr) : null;
  const studentData = studentDataStr ? JSON.parse(studentDataStr) : null;
  
  const location = useLocation();
  
  // Check if user is authenticated (either admin/guide or student)
  const isAuthenticated = (token && user) || (studentToken && studentData);
  
  if (!isAuthenticated) {
    console.log('No token found, redirecting to appropriate login');
    
    // Determine which login page to redirect to based on the current path
    if (location.pathname.startsWith('/guide')) {
      return <Navigate to="/guide/login" replace />;
    } else if (location.pathname.startsWith('/student')) {
      return <Navigate to="/student/login" replace />;
    } else {
      return <Navigate to="/admin/login" replace />;
    }
  }

  // Optionally, you can add role-based redirection here if needed
  return children;
}

export default ProtectedRoute;
