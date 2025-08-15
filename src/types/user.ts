export interface User {
  id?: number;
  name: string;
  rollno: string;
  password?: string; // Optional when receiving from API
  department: string;
  email: string;
  phoneno: number;
  yearofstudy: number;
}

export interface LoginCredentials {
  rollno: string;
  password: string;
}

export interface SignupFormData extends Omit<User, 'id' | 'password'> {
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordStep1 {
  rollno: string;
}

export interface ForgotPasswordStep2 {
  rollno: string;
  code: string;
}

export interface ForgotPasswordStep3 {
  rollno: string;
  password: string;
  confirmPassword: string;
  token: string;
}
