import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
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
import { AiOutlineArrowLeft, AiOutlineCalendar, AiOutlineEnvironment, AiOutlineTag, AiOutlineTeam, AiOutlineCheckCircle } from 'react-icons/ai';

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
      const response = await getUserIdByRollNo({ rollno: inviteRoll.trim() });
      setFoundUserId(response.user_id);
      setInviteStatus(`User found: ${inviteRoll}`);
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
      <div className="min-h-screen bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="bg-surface rounded-xl shadow-xl p-6 text-center">
            <p className="text-text-secondary mb-4">Event not found.</p>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Header with Back Button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-text-secondary hover:text-text transition-colors duration-200"
          >
            <AiOutlineArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Event Info */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Event Poster */}
            <div className="relative rounded-2xl overflow-hidden bg-secondary border border-border">
              <img
                src={`${import.meta.env.VITE_BACKEND_URL}/event/eventposter?id=${event.id}`}
                alt={event.name}
                className="w-full aspect-[16/9] sm:aspect-[4/3] lg:aspect-[16/10] object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/default-event-poster.jpg';
                }}
              />
              {'status' in event && (
                <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium shadow-lg ${
                  event.status === 'ongoing' ? 'bg-accent text-primary' :
                  event.status === 'upcoming' ? 'bg-accent/80 text-primary' : 'bg-text-secondary text-background'
                }`}>
                  {event.status}
                </div>
              )}
            </div>

            {/* Event Details */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h1 className="text-3xl font-bold text-text mb-4">{event.name}</h1>
              
              <p className="text-text-secondary leading-relaxed mb-6">{event.about}</p>
              
              {/* Event Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <AiOutlineCalendar className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Date</p>
                    <p className="font-medium text-text">
                      {event.date ? new Date(event.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'To be announced'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <AiOutlineEnvironment className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Venue</p>
                    <p className="font-medium text-text">{event.venue}</p>
                  </div>
                </div>
                
                {'event_type' in event && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                      <AiOutlineTag className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Type</p>
                      <p className="font-medium text-text">{event.event_type} • {event.event_category}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <AiOutlineTeam className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-text-secondary">Team Size</p>
                    <p className="font-medium text-text">
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

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Registration Status */}
            {registered ? (
              <div className="bg-accent/5 border border-accent/20 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <AiOutlineCheckCircle className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">Successfully Registered!</h3>
                    <p className="text-sm text-text-secondary">You're all set for this event</p>
                  </div>
                </div>
                
                {registered.team_name && (
                  <div className="bg-surface rounded-lg p-3 border border-border">
                    <p className="text-sm text-text-secondary">Team Name</p>
                    <p className="font-medium text-text">{registered.team_name}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <h3 className="font-semibold text-text mb-4">Join This Event</h3>
                <p className="text-text-secondary text-sm mb-6">
                  Ready to participate? Register now to secure your spot.
                </p>
                <Button
                  onClick={handleRegister}
                  loading={registering}
                  className="w-full"
                  size="lg"
                >
                  {registering ? 'Registering...' : 'Register Now'}
                </Button>
              </div>
            )}

            {/* Team Management */}
            {registered && event.max_no_member > 1 && (
              <div className="bg-surface border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-text">Team Management</h3>
                  <span className="text-sm text-text-secondary">
                    {teamMembers.length}/{event.max_no_member} members
                  </span>
                </div>
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowTeam(!showTeam)}
                    className="w-full"
                  >
                    {showTeam ? 'Hide Team' : 'View Team'}
                  </Button>
                  
                  {teamMembers.length < event.max_no_member && (
                    <Button
                      variant="outline"
                      onClick={() => setShowInvite(!showInvite)}
                      className="w-full"
                    >
                      Invite Members
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        {/* Invite Popup */}
        {showInvite && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-md border border-border">
              <h2 className="text-xl font-bold mb-4 text-text">Invite Team Member</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    placeholder="Enter roll number"
                    className="w-full p-3 rounded-lg border border-border bg-input-bg text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    value={inviteRoll}
                    onChange={(e) => setInviteRoll(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !foundUserId && handleSearchUser()}
                  />
                </div>
                
                <div className="flex gap-2">
                  {!foundUserId ? (
                    <Button 
                      onClick={handleSearchUser} 
                      disabled={!inviteRoll.trim() || searchingUser}
                      className="flex-1"
                    >
                      {searchingUser ? 'Searching...' : 'Search User'}
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleSendInvite}
                      className="flex-1"
                    >
                      Send Invitation
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={closeInvitePopup}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
                
                {inviteStatus && (
                  <p className={`text-sm p-2 rounded ${
                    inviteStatus.includes('successfully') || inviteStatus.includes('found') 
                      ? 'text-accent bg-accent/10' 
                      : 'text-text-secondary bg-secondary/50'
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
            <div className="bg-surface p-6 rounded-2xl shadow-xl w-full max-w-2xl border border-border max-h-[80vh] overflow-y-auto">
              <h2 className="text-xl font-bold mb-4 text-text">
                Team Members ({teamMembers.length}/{event.max_no_member})
              </h2>
              
              {teamMembers.length > 0 ? (
                <div className="space-y-3 mb-6">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-4 bg-background border border-border rounded-xl">
                      <div className="flex-1">
                        <div className="font-medium text-text">{member.name}</div>
                        <div className="text-sm text-text-secondary">
                          {member.rollno} • {member.department} • Year {member.yearofstudy}
                        </div>
                        <div className="text-sm text-text-secondary">{member.email}</div>
                      </div>
                      
                      {currentUserRollNo && member.rollno !== currentUserRollNo && event.status !== 'past' && (
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveMember(member.id)}
                          className="text-text-secondary hover:text-text hover:border-accent"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-text-secondary mb-6 text-center py-8">No team members found.</p>
              )}
              
              <Button variant="outline" onClick={closeTeamPopup} className="w-full">
                Close
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventDetailsPage;
