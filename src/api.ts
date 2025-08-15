import axios from 'axios';
import type { User, LoginCredentials, SignupFormData } from './types/user';

// Extend AxiosRequestConfig to include a private _retry flag
declare module 'axios' {
  interface AxiosRequestConfig {
    _retry?: boolean;
  }
}

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL,
  withCredentials: true, // Important for cookie-based authentication
  headers: {
    'Content-Type': 'application/json',
  },
});


// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as import('axios').AxiosRequestConfig | undefined;

    // If we have no config or no response, just reject
    if (!originalRequest || !error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;
    const url = originalRequest.url || '';

    // Do NOT attempt refresh for login, signup, refresh endpoints, or auth status check
    const isAuthAttempt = url.includes('/auth/user/login') || url.includes('/auth/user/signup');
    const isRefreshCall = url.includes('/auth/user/getnewaccesstoken');
    const isStatusCheck = url.includes('/auth/user/status');

    if (status === 401 && !isAuthAttempt && !isRefreshCall && !isStatusCheck) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        try {
          // Try to refresh the token
            await refreshAccessToken();
          // Retry the original request
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, redirect to login
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }

    // For login wrong password or any other 401 that shouldn't refresh, just reject
    return Promise.reject(error);
  }
);

// API Functions

// Auth related API calls
export const generateEmailCode = async (rollno: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/user/generateemailcode', { rollno });
  return response.data;
};

export const signup = async (signupData: SignupFormData & { code: string }): Promise<{ user: User; message: string }> => {
  const { confirmPassword, ...dataToSend } = signupData;
  const response = await api.post('/auth/user/signup', dataToSend);
  return response.data;
};

export const signin = async (credentials: LoginCredentials): Promise<{ user: User; message: string }> => {
  const response = await api.post('/auth/user/login', credentials);
  return response.data;
};

export const logout = async (): Promise<{ message: string }> => {
  const response = await api.post('/auth/user/logout');
  return response.data;
};

export const refreshAccessToken = async (): Promise<{ message: string }> => {
  const response = await api.get('/auth/user/getnewaccesstoken');
  return response.data;
};

export const getCurrentUser = async (): Promise<{ user: User }> => {
  const response = await api.get('/auth/user/status');
  return response.data;
};

// Forgot Password API calls
export const generatePasswordResetCode = async (rollno: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/user/generatecode', { rollno });
  return response.data;
};

export const verifyPasswordResetCode = async (rollno: string, code: string): Promise<{ message: string; token: string }> => {
  const response = await api.post('/auth/user/verifycode', { rollno, code });
  return response.data;
};

export const resetPassword = async (rollno: string, password: string, token: string): Promise<{ message: string }> => {
  const response = await api.post('/auth/user/resetpassword', { rollno, password, token });
  return response.data;
};

// Helper function to check if user is authenticated
export const checkAuthStatus = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch (error) {
    return false;
  }
};

export default api;
