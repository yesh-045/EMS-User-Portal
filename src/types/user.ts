// User related interfaces
export interface UserProfile {
  name: string;
  rollno: string;
  department: string;
  email: string;
  phoneno: number;
  yearofstudy: number;
}

export interface User extends UserProfile {
  id?: number;
  password?: string;
}

export interface LoginCredentials {
  rollno: string;
  password: string;
}

export interface SignupFormData extends Omit<User, 'id' | 'password'> {
  password: string;
  confirmPassword: string;
}

// Password Reset interfaces
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

// Event related interfaces
export interface Event {
  id: number;
  name: string;
  about: string;
  date: string | Date;
  venue: string;
  event_type: string;
  event_category: string;
  min_no_member: number;
  max_no_member: number;
  chief_guest?: string;
}

export interface EventListItem {
  id: number;
  name: string;
  about: string;
  date: string | Date | null;
  venue: string;
  event_type: string;
  event_category: string;
  min_no_member: number;
  max_no_member: number;
  club_name: string | null;
  status: 'past' | 'ongoing' | 'upcoming';
}

export interface EventRegistration {
  event_id: number;
  teamName?: string;
}

// Team related interfaces
export interface Team {
  id: number;
  name: string;
  event_id: number;
}

export interface TeamMember {
  id: number;
  name: string;
  email: string;
  rollno: string;
  department: string;
  yearofstudy: number;
}

export interface TeamInvite {
  from_team_id: number;
  to_user_id: number;
  event_id: number;
  from_user_id?: number; // Added when creating invitation
}

// Accept/Reject Team Invite interfaces
export interface AcceptTeamInviteRequest extends TeamInvite {}

export interface AcceptTeamInviteResponse {
  message: string;
}

export interface RejectTeamInviteRequest extends TeamInvite {}

export interface RejectTeamInviteResponse {
  message: string;
}

// Club related interfaces
export interface Club {
  id: number;
  name: string;
}

export interface ClubMember {
  club_id: number;
  role: string;
  user_id: number;
}

export interface MembershipDetails {
  id: number;
  role: string;
  name: string;
}

// API Request/Response interfaces
export interface FetchTeamMembersRequest {
  event_id: number;
}

export interface FetchTeamMembersResponse {
  team_id: number;
  members: TeamMember[];
}

export interface RemoveTeamMemberRequest {
  event_id: number;
  user_id: number;
}

export interface RemoveTeamMemberResponse {
  message: string;
}

export interface GetUserIdByRollNoRequest {
  rollno: string;
}

export interface GetUserIdByRollNoResponse {
  user_id: number;
}

export interface UpdateProfileRequest {
  name?: string;
  department?: string;
  email?: string;
  phoneno?: number;
  yearofstudy?: number;
}

export interface UpdateProfileResponse {
  message: string;
  profile: Omit<User, 'id' | 'password'>;
}

export interface Feedback {
  event_id: number;
  feedback: string;
  rating: number;
}

export interface FeedbackResponse {
  message: string;
}

export interface RegisteredEventMember extends TeamMember {}

export interface RegisteredEvent {
  team_id: number;
  team_name: string | null;
  event: RegisteredEventData;
  members: RegisteredEventMember[];
}

export interface Invite {
  event_id: number;
  from_user_id: number;
  from_team_id: number;
}

export interface InviteWithDetails {
  event_id: number;
  event_name: string;
  from_user_name: string;
  teamName: string;
  from_team_id: number;
}

// Common Response interfaces
export interface EventListResponse {
  message: string;
  data: EventListItem[];
}

export interface FetchProfileResponse {
  message: string;
  profile: UserProfile;
}

export interface GetRegisteredEventsResponse {
  message: string;
  data: RegisteredEvent[];
}

export interface RegisteredEventsResponse {
  message: string;
  data: RegisteredEvent[];
}

export interface FetchMembershipDetailsResponse {
  message: string;
  data: MembershipDetails[];
}

export interface FetchInvitationsResponse {
  message: string;
  data: InviteWithDetails[];
}

export interface EventRegistrationResponse {
  message: string;
  team_name?: string;
}

export interface TeamInvitationResponse {
  message: string;
}

// Event
export interface RegisteredEventData {
  id: number;
  name: string;
  about: string;
  date: string | Date | null;
  venue: string;
  event_type: string;
  event_category: string;
  chief_guest?: string;
  max_no_member: number;
  min_no_member: number;
}
