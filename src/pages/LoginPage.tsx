import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import type { LoginCredentials } from '../types/user';
import { AiOutlineUser, AiOutlineLock, AiOutlineEye, AiOutlineEyeInvisible } from 'react-icons/ai';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();

  const [formData, setFormData] = useState<LoginCredentials>({
    rollno: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginCredentials, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof LoginCredentials, string>> = {};

    if (!formData.rollno.trim()) {
      newErrors.rollno = 'Roll number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name as keyof LoginCredentials]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signin(formData);
      showToast.success('Welcome back! Logged in successfully.');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.response?.status === 401) {
        const errorMessage = error.response?.data?.message;
        if (errorMessage === "Wrong password") {
          showToast.error('Wrong password. Please try again.');
        } else {
          showToast.error('Invalid credentials. Please check your roll number and password.');
        }
      } else {
        showToast.error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-fade-in">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center space-x-3 mb-6">
            <div className="w-12 h-12 bg-white rounded-xl p-2 shadow-lg">
              <img
                src="/psg.png"
                alt="PSG Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="w-12 h-12 bg-surface rounded-xl p-2 border border-border shadow-lg">
              <img
                src="/csea.png"
                alt="CSEA Logo"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            Welcome to <span className="gradient-text">EMS</span>
          </h1>
          <p className="text-text-secondary">Sign in to access your dashboard</p>
        </div>

        {/* Login Card */}
        <div className="card glass-effect animate-slide-up">
          <div className="card-header">
            <h2 className="card-title text-center">Sign In</h2>
            <p className="card-description text-center">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Roll Number Input */}
            <div className="form-group">
              <label className="form-label">
                <AiOutlineUser className="w-4 h-4 inline mr-2" />
                Roll Number
              </label>
              <div className="relative">
                <input
                  name="rollno"
                  value={formData.rollno}
                  onChange={handleInputChange}
                  placeholder="Enter your roll number"
                  className="form-input pl-10"
                  required
                />
                <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
              </div>
              {errors.rollno && <div className="form-error">{errors.rollno}</div>}
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label className="form-label">
                <AiOutlineLock className="w-4 h-4 inline mr-2" />
                Password
              </label>
              <div className="relative">
                <input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="form-input pl-10 pr-10"
                  required
                />
                <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                >
                  {showPassword ? (
                    <AiOutlineEyeInvisible className="w-5 h-5" />
                  ) : (
                    <AiOutlineEye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && <div className="form-error">{errors.password}</div>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full btn-lg"
            >
              {isSubmitting ? (
                <>
                  <div className="loading-spinner mr-2"></div>
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 space-y-4 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface text-text-secondary">New to EMS?</span>
              </div>
            </div>

            <Link
              to="/signup"
              className="btn btn-outline w-full"
            >
              Create Account
            </Link>

            <div className="flex justify-center">
              <Link
                to="/forgot-password"
                className="text-sm text-text-secondary hover:text-accent transition-colors"
              >
                Forgot your password?
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            By signing in, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
