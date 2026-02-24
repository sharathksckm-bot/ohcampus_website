import React from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { Toaster } from "./components/ui/sonner";

// Pages
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CollegeDetail from "./pages/CollegeDetail";
import CompareColleges from "./pages/CompareColleges";
import Courses from "./pages/Courses";
import Admissions from "./pages/Admissions";
import CounselorPerformance from "./pages/CounselorPerformance";
import CounselorScholarships from "./pages/CounselorScholarships";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import FeeManagement from "./pages/FeeManagement";
import FAQManagement from "./pages/FAQManagement";
import CollegeManagement from "./pages/CollegeManagement";
import UserManagement from "./pages/UserManagement";
import PerformanceDashboard from "./pages/PerformanceDashboard";
import ActivityLog from "./pages/ActivityLog";
import ScholarshipApplications from "./pages/ScholarshipApplications";

// Components
import ProtectedRoute from "./components/ProtectedRoute";

// Auth redirect component
const AuthRedirect = ({ children }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return null;
  
  if (isAuthenticated) {
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes - Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route 
        path="/login" 
        element={
          <AuthRedirect>
            <Login />
          </AuthRedirect>
        } 
      />

      {/* Counselor Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/college/:collegeId" 
        element={
          <ProtectedRoute>
            <CollegeDetail />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/compare" 
        element={
          <ProtectedRoute>
            <CompareColleges />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/courses" 
        element={
          <ProtectedRoute>
            <Courses />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admissions" 
        element={
          <ProtectedRoute>
            <Admissions />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/performance" 
        element={
          <ProtectedRoute>
            <CounselorPerformance />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/scholarships" 
        element={
          <ProtectedRoute>
            <CounselorScholarships />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        } 
      />

      {/* Admin Routes */}
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/fees" 
        element={
          <ProtectedRoute requiredRole="admin">
            <FeeManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/faqs" 
        element={
          <ProtectedRoute requiredRole="admin">
            <FAQManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/colleges" 
        element={
          <ProtectedRoute requiredRole="admin">
            <CollegeManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/performance" 
        element={
          <ProtectedRoute requiredRole="admin">
            <PerformanceDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/activity-log" 
        element={
          <ProtectedRoute requiredRole="admin">
            <ActivityLog />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/scholarship-applications" 
        element={
          <ProtectedRoute requiredRole="admin">
            <ScholarshipApplications />
          </ProtectedRoute>
        } 
      />

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster position="top-right" richColors />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
