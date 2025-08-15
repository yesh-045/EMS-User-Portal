import React, { forwardRef } from 'react';
import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        <label className="block text-xs sm:text-sm font-medium text-text-secondary mb-1 sm:mb-2">
          {label}
        </label>
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <span className="text-text-secondary">{icon}</span>
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-3 py-2 sm:px-4 sm:py-3 ${icon ? 'pl-8 sm:pl-10' : ''} 
              bg-input-bg border border-border rounded-lg
              text-text placeholder-text-secondary text-xs sm:text-base
              focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent
              transition-all duration-200
              hover:border-text-secondary
              ${error ? 'border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
