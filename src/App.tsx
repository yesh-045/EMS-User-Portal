import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
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
            <Route path="/" element={<HomePage />} />
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
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            {/* Add more routes as needed */}
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
