import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  getRegisteredEvents, 
  fetchTeamMembersOfEvent, 
  registerForEvent, 
  sendTeamInvitation, 
  getUserIdByRollNo,
  removeTeamMember,
  getOngoingEvents,
  getUpcomingEvents,
  fetchProfile
} from '../api';
import type { EventListItem, RegisteredEvent, TeamMember } from '../types/user';
import { showToast } from '../utils/toast';
import { AiOutlineArrowLeft, AiOutlineCalendar, AiOutlineEnvironment, AiOutlineTag, AiOutlineTeam, AiOutlineCheckCircle, AiOutlineBank } from 'react-icons/ai';

const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [currentUserRollNo, setCurrentUserRollNo] = useState<string | null>(null);
  const [event, setEvent] = useState<EventListItem | null>(null);
  const [registered, setRegistered] = useState<RegisteredEvent | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [showInvite, setShowInvite] = useState(false);
  const [showTeam, setShowTeam] = useState(false);
  const [inviteRoll, setInviteRoll] = useState('');
  const [inviteStatus, setInviteStatus] = useState<string | null>(null);
  const [searchingUser, setSearchingUser] = useState(false);
  const [foundUserId, setFoundUserId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const fetchRollNo = async () => {
      try {
        const response = await fetchProfile();
        setCurrentUserRollNo(response.profile.rollno);
      } catch (error) {
        console.error("Failed to fetch roll number:", error);
        setCurrentUserRollNo(null);
      }
    };
    fetchRollNo();
  }, []);

  useEffect(() => {
    if (!eventId) return;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ongoingRes, upcomingRes, registeredRes] = await Promise.all([
          getOngoingEvents(),
          getUpcomingEvents(),
          getRegisteredEvents()
        ]);

        const allEvents = [...ongoingRes.data, ...upcomingRes.data];
        const currentEvent = allEvents.find(e => e.id === parseInt(eventId));
        
        if (currentEvent) {
          setEvent(currentEvent);
        }

        const userRegistration = registeredRes.data.find(
          reg => reg.event.id === parseInt(eventId)
        );
        
        if (userRegistration) {
          setRegistered(userRegistration);
          
          try {
            const teamRes = await fetchTeamMembersOfEvent({ event_id: parseInt(eventId) });
            setTeamMembers(teamRes.members);
          } catch (error) {
            console.error('Error fetching team members:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching event details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId]);
  
  const handleRegister = async () => {
    if (!event || !eventId) return;

    setRegistering(true);
    try {
      let teamName = '';
      if (event.min_no_member > 1) {
        teamName = prompt('Enter team name:') || '';
        if (!teamName) {
          setRegistering(false);
          return;
        }
      }

      await registerForEvent({
        event_id: parseInt(eventId),
        teamName: teamName || undefined
      });

      window.location.reload();
    } catch (error) {
      console.error('Registration error:', error);
      showToast.error('Registration failed. Please try again.');
    } finally {
      setRegistering(false);
    }
  };

  const handleSearchUser = async () => {
    if (!inviteRoll.trim()) return;

    setSearchingUser(true);
    setInviteStatus(null);
    setFoundUserId(null);

    try {
      const normalizedRollNo = inviteRoll.trim().toLowerCase();
      const response = await getUserIdByRollNo({ rollno: normalizedRollNo });
      setFoundUserId(response.user_id);
      setInviteStatus(`User found: ${normalizedRollNo}`);
    } catch (error) {
      setInviteStatus('User not found with this roll number');
      setFoundUserId(null);
    } finally {
      setSearchingUser(false);
    }
  };

  const handleSendInvite = async () => {
    if (!foundUserId || !registered || !eventId) return;

    try {
      await sendTeamInvitation({
        from_team_id: registered.team_id,
        to_user_id: foundUserId,
        event_id: parseInt(eventId)
      });

      showToast.success('Invitation sent successfully!');
      setInviteStatus('Invitation sent successfully!');
      setInviteRoll('');
      setFoundUserId(null);
      
      setTimeout(() => {
        setShowInvite(false);
        setInviteStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Invitation error:', error);
      showToast.error('Failed to send invitation. Please try again.');
      setInviteStatus('Failed to send invitation. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!currentUserRollNo) {
      showToast.error("Unable to verify your identity");
      return;
    }

    const memberToRemove = teamMembers.find(member => member.id === memberId);
    if (!memberToRemove) return;

    if (memberToRemove.rollno === currentUserRollNo) {
      showToast.error("You cannot remove yourself");
      return;
    }

    try {
      await removeTeamMember({
        event_id: parseInt(eventId!),
        user_id: memberId
      });
      setTeamMembers(prev => prev.filter(m => m.id !== memberId));
      showToast.success("Member removed successfully");
    } catch (error) {
      showToast.error("Failed to remove member");
    }
  };

  const closeInvitePopup = () => {
    setShowInvite(false);
    setInviteRoll('');
    setInviteStatus(null);
    setFoundUserId(null);
  };

  const closeTeamPopup = () => {
    setShowTeam(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-surface rounded-xl shadow-xl p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-secondary rounded w-3/4"></div>
              <div className="h-64 bg-secondary rounded"></div>
              <div className="h-4 bg-secondary rounded w-1/2"></div>
              <div className="h-4 bg-secondary rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md w-full bg-surface rounded-2xl p-8 shadow-lg border border-border">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M12 14a2 2 0 100-4 2 2 0 000 4M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text mb-2">Event Not Found</h2>
            <p className="text-text-secondary mb-6">The event you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center justify-center px-5 py-3 bg-accent text-background font-medium rounded-full hover:opacity-90 transition-opacity"
            >
              <AiOutlineArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const eventDate = event.date ? new Date(event.date) : null;
  const eventMonthLabel = eventDate?.toLocaleDateString('en-US', { month: 'short' })?.toUpperCase();
  const eventWeekdayLabel = eventDate?.toLocaleDateString('en-US', { weekday: 'long' });
  const eventDayLabel = eventDate ? eventDate.getDate().toString().padStart(2, '0') : null;
  const eventYearLabel = eventDate?.getFullYear();

  return (
    <div className="min-h-screen bg-background">
      {/* Header Section */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
            <button
              onClick={() => navigate('/dashboard')}
              className="inline-flex items-center text-text hover:text-accent transition-colors"
            >
              <AiOutlineArrowLeft className="w-5 h-5 mr-2" />
              Back to Dashboard
            </button>
            {'status' in event && (
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition border ${
                event.status === 'ongoing' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                event.status === 'upcoming' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                'bg-secondary text-text-secondary border-border'
              }`}>
                {event.status}
              </div>
            )}
          </div>

          <div className="flex flex-wrap flex-row items-end gap-3 text-text">
            {/* Date Card */}
            <div className="flex overflow-hidden rounded-3xl border border-border bg-surface/50 backdrop-blur-sm shadow-lg">
              <div className="flex flex-col items-center justify-between bg-accent px-5 py-4 text-background">
                <span className="text-[0.65rem] font-semibold tracking-[0.45em] opacity-70">
                  {eventMonthLabel || 'TBA'}
                </span>
                <span className="text-2xl font-bold leading-none">
                  {eventDayLabel || '--'}
                </span>
              </div>
              <div className="relative flex flex-col justify-between px-5 py-3 min-w-[160px]">
                <span className="text-sm font-semibold uppercase tracking-[0.3em] text-text-secondary">
                  {eventWeekdayLabel || 'To be announced'}
                </span>
                <span className="text-[0.65rem] font-semibold tracking-[0.45em] text-text-secondary">
                  {eventYearLabel || '----'}
                </span>
              </div>
            </div>

            {/* Event Title and Description */}
            <div className="flex-1 min-w-[200px]">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight text-text">
                {event.name}
              </h1>
              <p className="mt-2 text-sm md:text-base text-text-secondary max-w-2xl">
                {event.about}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="bg-background text-text pt-10 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Column - Event Details */}
            <div className="md:col-span-2">
              {/* Event Info Cards */}
              <div className="bg-surface rounded-2xl shadow-lg p-6 md:p-8 mb-8 border border-border">
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="bg-secondary px-3 py-1 rounded-full flex items-center border border-border">
                    <AiOutlineCalendar className="w-4 h-4 mr-1 text-accent" />
                    <span className="font-semibold text-text-secondary">
                      {eventDate ? eventDate.toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      }) : 'Date TBA'}
                    </span>
                  </div>

                  <div className="bg-secondary px-3 py-1 rounded-full flex items-center border border-border">
                    <AiOutlineEnvironment className="w-4 h-4 mr-1 text-accent" />
                    <span className="font-semibold text-text-secondary">{event.venue}</span>
                  </div>

                  {'event_type' in event && (
                    <div className="bg-secondary px-3 py-1 rounded-full flex items-center border border-border">
                      <AiOutlineTag className="w-4 h-4 mr-1 text-accent" />
                      <span className="font-semibold text-text-secondary">{event.event_type}</span>
                    </div>
                  )}

                  <div className="bg-secondary px-3 py-1 rounded-full flex items-center border border-border">
                    <AiOutlineTeam className="w-4 h-4 mr-1 text-accent" />
                    <span className="font-semibold text-text-secondary">
                      Team: {event.min_no_member === event.max_no_member 
                        ? `${event.min_no_member}` 
                        : `${event.min_no_member}-${event.max_no_member}`}
                    </span>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-text mb-4">About This Event</h2>
                <p className="text-text-secondary mb-8 leading-relaxed">{event.about}</p>

                {/* Event Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <AiOutlineCalendar className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text mb-1">Date & Time</h4>
                      <p className="text-text-secondary">
                        {eventDate ? eventDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        }) : 'To be announced'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <AiOutlineEnvironment className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text mb-1">Venue</h4>
                      <p className="text-text-secondary">{event.venue}</p>
                    </div>
                  </div>

                  {'club_name' in event && event.club_name && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <AiOutlineBank className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text mb-1">Organized By</h4>
                        <p className="text-text-secondary">{event.club_name}</p>
                      </div>
                    </div>
                  )}

                  {'event_type' in event && (
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <AiOutlineTag className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text mb-1">Event Type</h4>
                        <p className="text-text-secondary">{event.event_type}</p>
                        {'event_category' in event && (
                          <p className="text-text-secondary text-sm">{event.event_category}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      <AiOutlineTeam className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-text mb-1">Team Size</h4>
                      <p className="text-text-secondary">
                        {event.min_no_member === event.max_no_member 
                          ? `${event.min_no_member} ${event.min_no_member === 1 ? 'member' : 'members'}`
                          : `${event.min_no_member} - ${event.max_no_member} members`
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Actions & Team Management */}
            <div className="md:col-span-1">

              {/* Registration Status */}
              {registered ? (
                <div className="bg-surface rounded-2xl shadow-lg p-6 mb-6 border border-green-500/20">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                      <AiOutlineCheckCircle className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-text">Registered!</h3>
                      <p className="text-sm text-text-secondary">You're all set</p>
                    </div>
                  </div>
                  
                  {registered.team_name && (
                    <div className="bg-secondary rounded-lg p-3 border border-border">
                      <p className="text-sm text-text-secondary">Team Name</p>
                      <p className="font-medium text-text">{registered.team_name}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-surface rounded-2xl shadow-lg p-6 mb-6 border border-border">
                  <h3 className="text-lg font-bold text-text mb-4 pb-3 border-b border-border">Registration</h3>
                  <p className="text-text-secondary text-sm mb-6">
                    Ready to participate? Register now to secure your spot.
                  </p>
                  <button
                    onClick={handleRegister}
                    disabled={registering}
                    className="block w-full text-center bg-accent text-background font-semibold py-3 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {registering ? 'Registering...' : 'Register Now'}
                  </button>
                </div>
              )}

              {/* Team Management */}
              {registered && event.max_no_member > 1 && (
                <div className="bg-surface rounded-2xl shadow-lg p-6 border border-border">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
                    <h3 className="text-lg font-bold text-text">Team Management</h3>
                    <span className="text-sm text-text-secondary">
                      {teamMembers.length}/{event.max_no_member}
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowTeam(!showTeam)}
                      className="block w-full text-center bg-secondary text-text font-semibold py-2.5 px-6 rounded-full hover:bg-button-hover transition-colors border border-border"
                    >
                      {showTeam ? 'Hide Team' : 'View Team'}
                    </button>
                    
                    {teamMembers.length < event.max_no_member && (
                      <button
                        onClick={() => setShowInvite(!showInvite)}
                        className="block w-full text-center border border-border text-text font-semibold py-2.5 px-6 rounded-full hover:bg-button-hover transition-colors"
                      >
                        Invite Members
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {/* Invite Popup */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
            <h2 className="text-xl font-bold mb-4 text-text">Invite Team Member</h2>
            
            <div className="space-y-4">
              <div className="form-group">
                <label className="form-label">
                  Roll Number
                </label>
                <input
                  type="text"
                  placeholder="Enter roll number"
                  className="form-input"
                  value={inviteRoll}
                  onChange={(e) => setInviteRoll(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !foundUserId && handleSearchUser()}
                />
              </div>
              
              <div className="flex gap-2">
                {!foundUserId ? (
                  <button
                    onClick={handleSearchUser}
                    disabled={!inviteRoll.trim() || searchingUser}
                    className="flex-1 bg-accent text-background font-semibold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {searchingUser ? 'Searching...' : 'Search User'}
                  </button>
                ) : (
                  <button
                    onClick={handleSendInvite}
                    className="flex-1 bg-accent text-background font-semibold py-2.5 px-6 rounded-full hover:opacity-90 transition-opacity"
                  >
                    Send Invitation
                  </button>
                )}
                
                <button
                  onClick={closeInvitePopup}
                  className="flex-1 border border-border text-text font-semibold py-2.5 px-6 rounded-full hover:bg-button-hover transition-colors"
                >
                  Cancel
                </button>
              </div>
              
              {inviteStatus && (
                <p className={`text-sm p-2 rounded ${
                  (inviteStatus?.includes('successfully') || inviteStatus?.includes('found'))
                    ? 'text-green-400 bg-green-500/10 border border-green-500/20' 
                    : 'text-text-secondary bg-secondary border border-border'
                }`}>
                  {inviteStatus}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Team Members Popup */}
      {showTeam && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto border border-border">
            <h2 className="text-xl font-bold mb-4 text-text">
              Team Members ({teamMembers.length}/{event?.max_no_member || 0})
            </h2>
            
            {teamMembers.length > 0 ? (
              <div className="space-y-3 mb-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 bg-secondary border border-border rounded-xl">
                    <div className="flex-1">
                      <div className="font-medium text-text">{member.name}</div>
                      <div className="text-sm text-text-secondary">
                        {member.rollno} • {member.department} • Year {member.yearofstudy}
                      </div>
                      <div className="text-sm text-text-secondary">{member.email}</div>
                    </div>
                    
                    {currentUserRollNo && member.rollno !== currentUserRollNo && event && 'status' in event && event.status !== 'past' && (
                      <button
                        onClick={() => handleRemoveMember(member.id)}
                        className="text-text-secondary hover:text-text hover:bg-button-hover px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border border-border"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary mb-6 text-center py-8">No team members found.</p>
            )}
            
            <button
              onClick={closeTeamPopup}
              className="w-full border border-border text-text font-semibold py-2.5 px-6 rounded-full hover:bg-button-hover transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;
