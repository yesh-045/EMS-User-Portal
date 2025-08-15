import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import { generatePasswordResetCode, verifyPasswordResetCode, resetPassword } from '../api';
import { showToast } from '../utils/toast';

type ForgotPasswordStep = 1 | 2 | 3;

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState<ForgotPasswordStep>(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Enter roll number
  const [rollno, setRollno] = useState('');
  const [rollnoError, setRollnoError] = useState('');
  
  // Step 2: Enter verification code
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [resetToken, setResetToken] = useState('');
  
  // Step 3: Enter new password
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rollno.trim()) {
      setRollnoError('Roll number is required');
      return;
    }
    
    setLoading(true);
    setRollnoError('');
    
    try {
      await generatePasswordResetCode(rollno);
      showToast.success('Verification code sent to your email address!');
      setCurrentStep(2);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send verification code';
      setRollnoError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code.trim()) {
      setCodeError('Verification code is required');
      return;
    }
    
    if (code.length !== 6) {
      setCodeError('Verification code must be 6 digits');
      return;
    }
    
    setLoading(true);
    setCodeError('');
    
    try {
      const response = await verifyPasswordResetCode(rollno, code);
      setResetToken(response.token);
      showToast.success('Code verified! You can now reset your password.');
      setCurrentStep(3);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Invalid verification code';
      setCodeError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let hasErrors = false;
    
    if (!password) {
      setPasswordError('Password is required');
      hasErrors = true;
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      hasErrors = true;
    } else {
      setPasswordError('');
    }
    
    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password');
      hasErrors = true;
    } else if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      hasErrors = true;
    } else {
      setConfirmPasswordError('');
    }
    
    if (hasErrors) return;
    
    setLoading(true);
    
    try {
      await resetPassword(rollno, password, resetToken);
      showToast.success('Password reset successfully! You can now log in with your new password.');
      navigate('/login');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password';
      showToast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <form onSubmit={handleStep1Submit} className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text mb-2">Forgot Password</h1>
        <p className="text-text-secondary text-xs sm:text-sm">
          Enter your roll number to receive a verification code
        </p>
      </div>

      <Input
        label="Roll Number"
        value={rollno}
        onChange={(e) => {
          setRollno(e.target.value);
          setRollnoError('');
        }}
        error={rollnoError}
        placeholder="Enter your roll number"
        required
        disabled={loading}
      />

      <Button
        type="submit"
        loading={loading}
        className="w-full"
        size="md"
      >
        Send Verification Code
      </Button>

      <div className="text-center">
        <Link
          to="/login"
          className="text-accent hover:underline text-xs sm:text-sm transition-colors duration-200"
        >
          Back to Sign In
        </Link>
      </div>
    </form>
  );

  const renderStep2 = () => (
    <form onSubmit={handleStep2Submit} className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text mb-2">Enter Verification Code</h1>
        <p className="text-text-secondary text-xs sm:text-sm">
          We've sent a 6-digit code to your email address
        </p>
      </div>

      <div className="bg-input-bg border border-border rounded-lg p-3 mb-4">
        <p className="text-text-secondary text-xs">
          <strong>Roll Number:</strong> {rollno}
        </p>
      </div>

      <Input
        label="Verification Code"
        value={code}
        onChange={(e) => {
          setCode(e.target.value);
          setCodeError('');
        }}
        error={codeError}
        placeholder="Enter 6-digit code"
        maxLength={6}
        required
        disabled={loading}
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(1)}
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          Verify Code
        </Button>
      </div>
    </form>
  );

  const renderStep3 = () => (
    <form onSubmit={handleStep3Submit} className="space-y-4">
      <div className="text-center mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-text mb-2">Reset Password</h1>
        <p className="text-text-secondary text-xs sm:text-sm">
          Enter your new password
        </p>
      </div>

      <div className="bg-input-bg border border-border rounded-lg p-3 mb-4">
        <p className="text-text-secondary text-xs">
          <strong>Roll Number:</strong> {rollno}
        </p>
      </div>

      <Input
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => {
          setPassword(e.target.value);
          setPasswordError('');
        }}
        error={passwordError}
        placeholder="Enter new password"
        required
        disabled={loading}
      />

      <Input
        label="Confirm New Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => {
          setConfirmPassword(e.target.value);
          setConfirmPasswordError('');
        }}
        error={confirmPasswordError}
        placeholder="Confirm new password"
        required
        disabled={loading}
      />

      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => setCurrentStep(2)}
          disabled={loading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          loading={loading}
          className="flex-1"
        >
          Reset Password
        </Button>
      </div>
    </form>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="w-full max-w-sm">
        <div className="bg-surface rounded-xl shadow-xl p-5 sm:p-6 border border-border">
          {/* Progress indicator */}
          <div className="flex justify-center mb-6">
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                      step === currentStep
                        ? 'bg-accent text-primary'
                        : step < currentStep
                        ? 'bg-accent text-primary'
                        : 'bg-border text-text-secondary'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${
                        step < currentStep ? 'bg-accent' : 'bg-border'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
