import toast from 'react-hot-toast';

// Custom toast functions that match the app theme
export const showToast = {
  success: (message: string) => {
    return toast.success(message, {
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--accent)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      iconTheme: {
        primary: 'var(--accent)',
        secondary: 'var(--primary)',
      },
    });
  },

  error: (message: string) => {
    return toast.error(message, {
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid #ef4444',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      iconTheme: {
        primary: '#ef4444',
        secondary: 'var(--primary)',
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      iconTheme: {
        primary: 'var(--accent)',
        secondary: 'var(--primary)',
      },
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    {
      loading,
      success,
      error,
    }: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(promise, {
      loading,
      success,
      error,
    }, {
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      success: {
        iconTheme: {
          primary: 'var(--accent)',
          secondary: 'var(--primary)',
        },
        style: {
          border: '1px solid var(--accent)',
        },
      },
      error: {
        iconTheme: {
          primary: '#ef4444',
          secondary: 'var(--primary)',
        },
        style: {
          border: '1px solid #ef4444',
        },
      },
      loading: {
        iconTheme: {
          primary: 'var(--accent)',
          secondary: 'var(--primary)',
        },
      },
    });
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },

  custom: (message: string, options?: any) => {
    return toast(message, {
      style: {
        background: 'var(--surface)',
        color: 'var(--text)',
        border: '1px solid var(--border)',
        borderRadius: '8px',
        padding: '12px 16px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
      ...options,
    });
  },
};
