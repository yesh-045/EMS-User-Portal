import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import EmailVerificationModal from '../components/EmailVerificationModal';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import type { SignupFormData } from '../types/user';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { signup, completeSignup } = useAuth();
  
  const [formData, setFormData] = useState<SignupFormData>({
    name: '',
    rollno: '',
    password: '',
    confirmPassword: '',
    department: '',
    email: '',
    phoneno: 0,
    yearofstudy: 1,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignupFormData, string>>>({});
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const departments = [
    'Computer Science and Engineering',
    'CSE (AI & ML)',
    'Information Technology',
    'Electronics and Communication Engineering',
    'Electrical and Electronics Engineering',
    'Mechanical Engineering',
    'Civil Engineering',
    'Chemical Engineering',
    'Aerospace Engineering',
    'Biomedical Engineering',
    'Other'
  ];

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SignupFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.rollno.trim()) {
      newErrors.rollno = 'Roll number is required';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.phoneno || formData.phoneno.toString().length < 10) {
      newErrors.phoneno = 'Valid phone number is required';
    }

    if (formData.yearofstudy < 1 || formData.yearofstudy > 4) {
      newErrors.yearofstudy = 'Year of study must be between 1 and 4';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'phoneno' || name === 'yearofstudy' ? Number(value) : value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof SignupFormData]) {
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
      await signup(formData);
    } catch (error: any) {
      if (error.message === 'EMAIL_VERIFICATION_REQUIRED') {
        setEmailSent(true);
        setShowEmailModal(true);
      } else {
        console.error('Signup error:', error);
        showToast.error(error.message || 'Error creating account. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailVerification = async (code: string) => {
    try {
      await completeSignup(formData, code);
      setShowEmailModal(false);
      showToast.success('Account created successfully! You can now sign in.');
      navigate('/login'); // Redirect to login after successful signup
    } catch (error: any) {
      console.error('Email verification error:', error);
      showToast.error(error.message || 'Invalid verification code. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm sm:max-w-md">
        <div className="bg-surface rounded-xl shadow-xl p-5 sm:p-6 border border-border">
          {/* Header */}
          <div className="text-center mb-4 sm:mb-5">
            <h1 className="text-xl sm:text-2xl font-bold text-text mb-1">Create Account</h1>
            <p className="text-text-secondary text-xs sm:text-sm">Join our platform today</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            {/* Two column layout for larger screens */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                error={errors.name}
                placeholder="Enter your full name"
                required
              />

              <Input
                label="Roll Number"
                name="rollno"
                value={formData.rollno}
                onChange={handleInputChange}
                error={errors.rollno}
                placeholder="Enter your roll number"
                required
              />
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              error={errors.email}
              placeholder="Enter your email"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Phone Number"
                name="phoneno"
                type="tel"
                value={formData.phoneno || ''}
                onChange={handleInputChange}
                error={errors.phoneno}
                placeholder="Enter your phone number"
                required
              />

              <Input
                label="Year of Study"
                name="yearofstudy"
                type="number"
                min="1"
                max="4"
                value={formData.yearofstudy}
                onChange={handleInputChange}
                error={errors.yearofstudy}
                placeholder="Year (1-4)"
                required
              />
            </div>

            <div className="w-full">
              <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-2">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className="w-full px-3 py-2 sm:px-4 sm:py-3 bg-input-bg border border-border rounded-lg text-text focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all duration-200 hover:border-text-secondary text-xs sm:text-base"
                required
              >
                <option value="">Select your department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept} className="bg-input-bg text-text">
                    {dept}
                  </option>
                ))}
              </select>
              {errors.department && (
                <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-500">{errors.department}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange}
                error={errors.password}
                placeholder="Create a password"
                required
              />

              <Input
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                error={errors.confirmPassword}
                placeholder="Confirm password"
                required
              />
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              className="w-full mt-4 sm:mt-5"
              size="md"
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center">
            <p className="text-text-secondary text-xs sm:text-sm">
              If you already have an account,{' '}
              <Link
                to="/login"
                className="text-accent hover:underline font-medium transition-colors duration-200"
              >
                sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        onVerify={handleEmailVerification}
        loading={isSubmitting}
      />
    </div>
  );
};

export default SignupPage;
