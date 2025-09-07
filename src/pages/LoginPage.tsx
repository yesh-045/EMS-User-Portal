import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import type { LoginCredentials } from '../types/user';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signin } = useAuth();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    rollno: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof LoginCredentials, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      navigate('/dashboard'); // Redirect to dashboard after successful login
    } catch (error: any) {
      console.error('Login error:', error);
      // Check for specific error messages from API
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-xl shadow-xl p-5 sm:p-6 border border-border">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-text mb-1">Welcome Back</h1>
            <p className="text-text-secondary text-xs sm:text-sm">Sign in to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <Input
              label="Roll Number"
              name="rollno"
              value={formData.rollno}
              onChange={handleInputChange}
              error={errors.rollno}
              placeholder="Enter your roll number"
              required
            />

            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              placeholder="Enter your password"
              required
            />

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-4 sm:mt-5"
              size="md"
            >
              Sign In
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-4 space-y-2 sm:space-y-3 text-center">
            <p className="text-text-secondary text-xs sm:text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-accent hover:underline font-medium transition-colors duration-200"
              >
                Create one here
              </Link>
            </p>
            
            <p className="text-text-secondary text-xs sm:text-sm">
              Forgot your password?{' '}
              <Link
                to="/forgot-password"
                className="text-accent hover:underline font-medium transition-colors duration-200"
              >
                Reset here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;