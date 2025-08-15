import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVerify: (code: string) => void;
  loading?: boolean;
}

const EmailVerificationModal: React.FC<EmailVerificationModalProps> = ({
  isOpen,
  onClose,
  onVerify,
  loading = false,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }
    if (code.length !== 6) {
      setError('Verification code must be 6 digits');
      return;
    }
    onVerify(code);
  };

  const handleClose = () => {
    setCode('');
    setError('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-xl shadow-xl p-6 w-full max-w-md border border-border">
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-text mb-2">Email Verification</h2>
          <p className="text-text-secondary text-sm">
            We've sent a 6-digit verification code to your email. Please enter it below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Verification Code"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              setError('');
            }}
            placeholder="Enter 6-digit code"
            maxLength={6}
            error={error}
            disabled={loading}
          />

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              Verify
            </Button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-text-secondary text-xs">
            Didn't receive the code? Check your spam folder or try again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationModal;
