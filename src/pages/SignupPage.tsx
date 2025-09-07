import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import EmailVerificationModal from '../components/EmailVerificationModal';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../utils/toast';
import type { SignupFormData } from '../types/user';
import {
  AiOutlineUser,
  AiOutlineLock,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineMail,
  AiOutlinePhone,
  AiOutlineIdcard,
  AiOutlineBank
} from 'react-icons/ai';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const { generateEmailCode, completeSignup } = useAuth();

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
      await generateEmailCode(formData.rollno);
      setShowEmailModal(true);
    } catch (error: any) {
      console.error('Email generation error:', error);
      showToast.error(error.message || 'Failed to send verification email. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailVerification = async (code: string) => {
    setIsSubmitting(true);
    try {
      await completeSignup(formData, code);
      setShowEmailModal(false);
      showToast.success('Account created successfully! You can now sign in.');
      navigate('/login');
    } catch (error: any) {
      console.error('Email verification error:', error);
      showToast.error(error.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => {
    // Validate current step fields
    const stepErrors: Partial<Record<keyof SignupFormData, string>> = {};

    if (currentStep === 1) {
      if (!formData.name.trim()) stepErrors.name = 'Name is required';
      if (!formData.rollno.trim()) stepErrors.rollno = 'Roll number is required';
      if (!formData.email) stepErrors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) stepErrors.email = 'Email is invalid';
      if (!formData.department) stepErrors.department = 'Department is required';
      if (!formData.phoneno || formData.phoneno.toString().length < 10) stepErrors.phoneno = 'Valid phone number is required';
      if (formData.yearofstudy < 1 || formData.yearofstudy > 4) stepErrors.yearofstudy = 'Year of study must be between 1 and 4';
    }

    if (Object.keys(stepErrors).length === 0) {
      setCurrentStep(2);
      setErrors({});
    } else {
      setErrors(stepErrors);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg animate-fade-in">
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
            Join <span className="gradient-text">EMS</span>
          </h1>
          <p className="text-text-secondary">Create your account to get started</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 1 ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary'}`}>
              1
            </div>
            <div className={`w-12 h-1 ${currentStep >= 2 ? 'bg-accent' : 'bg-border'}`}></div>
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${currentStep >= 2 ? 'bg-accent text-white' : 'bg-surface border border-border text-text-secondary'}`}>
              2
            </div>
          </div>
        </div>

        {/* Signup Card */}
        <div className="card glass-effect animate-slide-up">
          <div className="card-header">
            <h2 className="card-title text-center">
              {currentStep === 1 ? 'Personal Information' : 'Account Details'}
            </h2>
            <p className="card-description text-center">
              {currentStep === 1 ? 'Tell us about yourself' : 'Set up your account credentials'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 ? (
              <>
                {/* Step 1: Personal Information */}
                <div className="form-group">
                  <label className="form-label">
                    <AiOutlineUser className="w-4 h-4 inline mr-2" />
                    Full Name
                  </label>
                  <div className="relative">
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter your full name"
                      className="form-input pl-10"
                      required
                    />
                    <AiOutlineUser className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  </div>
                  {errors.name && <div className="form-error">{errors.name}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <AiOutlineIdcard className="w-4 h-4 inline mr-2" />
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
                    <AiOutlineIdcard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  </div>
                  {errors.rollno && <div className="form-error">{errors.rollno}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <AiOutlineMail className="w-4 h-4 inline mr-2" />
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email address"
                      className="form-input pl-10"
                      required
                    />
                    <AiOutlineMail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  </div>
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <AiOutlineBank className="w-4 h-4 inline mr-2" />
                    Year of Study
                  </label>
                  <select
                    name="yearofstudy"
                    value={formData.yearofstudy}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value={1}>1st Year</option>
                    <option value={2}>2nd Year</option>
                    <option value={3}>3rd Year</option>
                    <option value={4}>4th Year</option>
                  </select>
                  {errors.yearofstudy && <div className="form-error">{errors.yearofstudy}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <AiOutlinePhone className="w-4 h-4 inline mr-2" />
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      name="phoneno"
                      type="tel"
                      value={formData.phoneno || ''}
                      onChange={handleInputChange}
                      placeholder="Enter phone number"
                      className="form-input pl-10"
                      required
                    />
                    <AiOutlinePhone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                  </div>
                  {errors.phoneno && <div className="form-error">{errors.phoneno}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Select your department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  {errors.department && <div className="form-error">{errors.department}</div>}
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="btn btn-primary w-full btn-lg"
                >
                  Continue
                </button>
              </>
            ) : (
              <>
                {/* Step 2: Account Details */}
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
                      placeholder="Create a password"
                      className="form-input pl-10 pr-10"
                      required
                    />
                    <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showPassword ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <div className="form-error">{errors.password}</div>}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <AiOutlineLock className="w-4 h-4 inline mr-2" />
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm your password"
                      className="form-input pl-10 pr-10"
                      required
                    />
                    <AiOutlineLock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text transition-colors"
                    >
                      {showConfirmPassword ? <AiOutlineEyeInvisible className="w-5 h-5" /> : <AiOutlineEye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
                </div>

                <div className="flex space-x-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="btn btn-secondary flex-1"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="btn btn-primary flex-1 btn-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="loading-spinner mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-surface text-text-secondary">Already have an account?</span>
              </div>
            </div>

            <Link
              to="/login"
              className="btn btn-outline w-full mt-4"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-text-muted">
            By creating an account, you agree to our terms of service and privacy policy
          </p>
        </div>
      </div>

      {/* Email Verification Modal */}
      {showEmailModal && (
        <EmailVerificationModal
          onVerify={handleEmailVerification}
          onClose={() => setShowEmailModal(false)}
          isLoading={isSubmitting}
        />
      )}
    </div>
  );
};

export default SignupPage;
