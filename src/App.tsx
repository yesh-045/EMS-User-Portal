import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import EventDetailsPage from './pages/EventDetailsPage';
import InboxPage from './pages/InboxPage';
import ThemeToggle from './components/ThemeToggle';
import ProtectedRoute from './components/ProtectedRoute';
import AuthGuard from './components/AuthGuard';
import ToastProvider from './components/ToastProvider';

function App() {
  return (
    <ToastProvider>
      <Router>
        <div className="app">
          <ThemeToggle />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes - Only accessible when not logged in */}
            <Route 
              path="/signup" 
              element={
                <AuthGuard>
                  <SignupPage />
                </AuthGuard>
              } 
            />
            <Route 
              path="/login" 
              element={
                <AuthGuard>
                  <LoginPage />
                </AuthGuard>
              } 
            />
            <Route 
              path="/forgot-password" 
              element={
                <AuthGuard>
                  <ForgotPasswordPage />
                </AuthGuard>
              } 
            />
            
            {/* Protected Routes - Only accessible when logged in */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events/:eventId" 
              element={
                <ProtectedRoute>
                  <EventDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/inbox" 
              element={
                <ProtectedRoute>
                  <InboxPage />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route - redirect to home or 404 page */}
            <Route path="*" element={<HomePage />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;