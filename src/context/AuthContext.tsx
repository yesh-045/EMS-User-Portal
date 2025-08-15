import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { 
  signin as apiSignin, 
  signup as apiSignup, 
  logout as apiLogout, 
  generateEmailCode as apiGenerateEmailCode,
  getCurrentUser,
  checkAuthStatus,
  refreshAccessToken
} from '../api';
import { showToast } from '../utils/toast';
import type { User, LoginCredentials, SignupFormData, UserProfile} from '../types/user';

interface AuthContextType {
  user: User | null;
  userRollNo: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signin: (credentials: LoginCredentials) => Promise<void>;
  signup: (signupData: SignupFormData) => Promise<void>;
  completeSignup: (signupData: SignupFormData, code: string) => Promise<void>;
  logout: () => Promise<void>;
  generateEmailCode: (rollno: string) => Promise<string>;
  refreshToken: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const setUserAndRollNo = (userData: UserProfile | null) => {
    setUser(userData);
  };

  useEffect(() => {
    const checkInitialAuthStatus = async () => {
      try {
        setIsLoading(true);
        const isAuth = await checkAuthStatus();
        if (isAuth) {
          const userData = await getCurrentUser();
          setUserAndRollNo(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Failed to check auth status:', error);
        setIsAuthenticated(false);
        setUserAndRollNo(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkInitialAuthStatus();
  }, []);

  const generateEmailCode = async (rollno: string): Promise<string> => {
    try {
      const response = await apiGenerateEmailCode(rollno);
      return response.message;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to generate email code';
      throw new Error(errorMessage);
    }
  };

  const signup = async (signupData: SignupFormData): Promise<void> => {
    try {
      setIsLoading(true);
      await generateEmailCode(signupData.rollno);
      throw new Error('EMAIL_VERIFICATION_REQUIRED');
    } catch (error: any) {
      if (error.message === 'EMAIL_VERIFICATION_REQUIRED') {
        throw error;
      }
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const completeSignup = async (signupData: SignupFormData, code: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiSignup({ ...signupData, code });
      setUserAndRollNo(response);
      setIsAuthenticated(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Signup failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const signin = async (credentials: LoginCredentials): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await apiSignin(credentials);
      setUserAndRollNo(response);
      setIsAuthenticated(true);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Sign in failed';
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      await apiLogout();
      setUserAndRollNo(null);
      setIsAuthenticated(false);
      showToast.success('Logged out successfully!');
    } catch (error: any) {
      setUserAndRollNo(null);
      setIsAuthenticated(false);
      showToast.success('Logged out successfully!');
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async (): Promise<void> => {
    try {
      await refreshAccessToken();
      const userData = await getCurrentUser();
      setUserAndRollNo(userData);
      setIsAuthenticated(true);
    } catch (error: any) {
      console.error('Token refresh failed:', error);
      setUserAndRollNo(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
     userRollNo: user?.rollno || null,
    isAuthenticated,
    isLoading,
    signin,
    signup,
    completeSignup,
    logout,
    generateEmailCode,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
export const useRollNo = () => {
  const { user } = useAuth();
  
  // Safely extract rollno with null checks
  return user?.rollno || null;
};