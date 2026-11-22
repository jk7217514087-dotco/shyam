import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';

import { LandingPage } from './pages/LandingPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { ComplaintSubmissionPage } from './pages/ComplaintSubmissionPage.js';
import { CitizenDashboard } from './pages/CitizenDashboard.js';
import { WorkerDashboard } from './pages/WorkerDashboard.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { ComplaintTrackerPage } from './pages/ComplaintTrackerPage.js';

// Protected Route Guard
const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-400 text-sm">
        Authenticating session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If citizen tries to access admin, redirect to citizen dashboard, etc.
    if (user.role === 'citizen') return <Navigate to="/citizen" replace />;
    if (user.role === 'worker') return <Navigate to="/worker" replace />;
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/track" element={<ComplaintTrackerPage />} />
              <Route path="/track/:trackingId" element={<ComplaintTrackerPage />} />

              {/* Citizen Routes */}
              <Route
                path="/report"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                    <ComplaintSubmissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen"
                element={
                  <ProtectedRoute allowedRoles={['citizen', 'admin']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Worker Routes */}
              <Route
                path="/worker"
                element={
                  <ProtectedRoute allowedRoles={['worker', 'admin']}>
                    <WorkerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Administrator Routes */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
    </ThemeProvider>
  );
};


export default App;
