import axios from 'axios';
import type {
  User,
  LoginCredentials,
  SignupFormData,
  EventRegistration,
  EventRegistrationResponse,
  TeamInvite,
  TeamInvitationResponse,
  AcceptTeamInviteRequest,
  AcceptTeamInviteResponse,
  RejectTeamInviteRequest,
  RejectTeamInviteResponse,
  FetchMembershipDetailsResponse,
  FetchInvitationsResponse,
  FetchProfileResponse,
  UpdateProfileRequest,
  UpdateProfileResponse,
  GetRegisteredEventsResponse,
  Feedback,
  FeedbackResponse,
  GetUserIdByRollNoRequest,
  GetUserIdByRollNoResponse,
  FetchTeamMembersRequest,
  FetchTeamMembersResponse,
  RemoveTeamMemberRequest,
  RemoveTeamMemberResponse,
  EventListResponse,
  UserProfile
} from './types/user';

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

export const getCurrentUser = async (): Promise<UserProfile> => {
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
// src/api.ts

const API_BASE = '/user';

// 1. Register for Event
export async function registerForEvent(data: EventRegistration): Promise<EventRegistrationResponse> {
  const response = await api.post(`${API_BASE}/register`, data);
  return response.data;
}

// 2. Send Team Invitation
export async function sendTeamInvitation(data: TeamInvite): Promise<TeamInvitationResponse> {
  const response = await api.post(`${API_BASE}/sendTeamInvitaion`, data);
  return response.data;
}

// 3. Accept Team Invite
export async function acceptTeamInvite(data: AcceptTeamInviteRequest): Promise<AcceptTeamInviteResponse> {
  const response = await api.post(`${API_BASE}/acceptTeamInvite`, data);
  return response.data;
}

// 4. Reject Team Invite
export async function rejectTeamInvite(data: RejectTeamInviteRequest): Promise<RejectTeamInviteResponse> {
  const response = await api.post(`${API_BASE}/rejectTeamInvite`, data);
  return response.data;
}

// 5. Fetch Membership Details
export async function fetchMembershipDetails(): Promise<FetchMembershipDetailsResponse> {
  const response = await api.get(`${API_BASE}/membershipDetails`);
  return response.data;
}

// 6. Fetch Invitations
export async function fetchInvitations(): Promise<FetchInvitationsResponse> {
  const response = await api.get(`${API_BASE}/fetch/invitations`);
  return response.data;
}

// 7. Fetch Profile
export async function fetchProfile(): Promise<FetchProfileResponse> {
  const response = await api.get(`${API_BASE}/fetch/profile`);
  return response.data;
}

// 8. Update Profile
export async function updateProfile(data: UpdateProfileRequest): Promise<UpdateProfileResponse> {
  const response = await api.post(`${API_BASE}/update/profile`, data);
  return response.data;
}

// 9. Get Registered Events
export async function getRegisteredEvents(): Promise<GetRegisteredEventsResponse> {
  const response = await api.get(`${API_BASE}/registeredevents`);
  return response.data;
}

// 10. Submit Feedback
export async function submitFeedback(data: Feedback): Promise<FeedbackResponse> {
  const response = await api.post(`${API_BASE}/feedback`, data);
  return response.data;
}

// 11. Get User ID by Roll Number
export async function getUserIdByRollNo(data: GetUserIdByRollNoRequest): Promise<GetUserIdByRollNoResponse> {
  const response = await api.post(`${API_BASE}/getUserIdByRollNo`, data);
  return response.data;
}

// 12. Fetch Team Members of Event
export async function fetchTeamMembersOfEvent(data: FetchTeamMembersRequest): Promise<FetchTeamMembersResponse> {
  const response = await api.post(`${API_BASE}/fetchTeamMembersOfEvent`, data);
  return response.data;
}

// 13. Remove Team Member
export async function removeTeamMember(data: RemoveTeamMemberRequest): Promise<RemoveTeamMemberResponse> {
  const response = await api.post(`${API_BASE}/removeTeamMember`, data);
  return response.data;
}

// 14. Get Past Events
export async function getPastEvents(): Promise<EventListResponse> {
  const response = await api.get(`${API_BASE}/events/past`);
  return response.data;
}

// 15. Get Ongoing Events
export async function getOngoingEvents(): Promise<EventListResponse> {
  const response = await api.get(`${API_BASE}/events/ongoing`);
  return response.data;
}

// 16. Get Upcoming Events
export async function getUpcomingEvents(): Promise<EventListResponse> {
  const response = await api.get(`${API_BASE}/events/upcoming`);
  return response.data;
}
export default api;
