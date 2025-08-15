import React from 'react';
import { Toaster } from 'react-hot-toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="bottom-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        toastOptions={{
          // Default options for all toasts
          duration: 4000,
          style: {
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '12px 16px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
          },
          // Success toast styling
          success: {
            iconTheme: {
              primary: 'var(--accent)',
              secondary: 'var(--primary)',
            },
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--accent)',
            },
          },
          // Error toast styling
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: 'var(--primary)',
            },
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid #ef4444',
            },
          },
          // Loading toast styling
          loading: {
            iconTheme: {
              primary: 'var(--accent)',
              secondary: 'var(--primary)',
            },
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
            },
          },
        }}
      />
    </>
  );
};

export default ToastProvider;
