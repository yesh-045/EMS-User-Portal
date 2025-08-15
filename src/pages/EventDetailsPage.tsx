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

import { toast } from 'react-toastify';
const rollNo = '23n237';
const EventDetailsPage: React.FC = () => {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const [currentUserRollNo, setCurrentUserRollNo] = useState<string | null>(null);
  const [removingMember, setRemovingMember] = useState<number | null>(null);
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
      setCurrentUserRollNo(response.profile.rollno); // Access through response.profile
    } catch (error) {
      console.error("Failed to fetch roll number:", error);
      setCurrentUserRollNo(null);
    }
  };

  fetchRollNo();
}, []);
  useEffect(() => {
    const fetchData = async () => {
      if (!eventId) return;
      
      setLoading(true);
      try {
        // Fetch all events to find the specific event
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

        // Check if user is registered for this event
        const userRegistration = registeredRes.data.find(
          reg => reg.event.id === parseInt(eventId)
        );
        
        if (userRegistration) {
          setRegistered(userRegistration);
          
          // Fetch team members if registered
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

      const response = await registerForEvent({
        event_id: parseInt(eventId),
        teamName: teamName || undefined
      });

      // Refresh the page data
      window.location.reload();
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
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

      setInviteStatus('Invitation sent successfully!');
      setInviteRoll('');
      setFoundUserId(null);
      
      setTimeout(() => {
        setShowInvite(false);
        setInviteStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Invitation error:', error);
      setInviteStatus('Failed to send invitation. Please try again.');
    }
  };

  const handleRemoveMember = async (memberId: number) => {
  if (!currentUserRollNo) {
    toast.error("Unable to verify your identity");
    return;
  }

  const memberToRemove = teamMembers.find(member => member.id === memberId);
  if (!memberToRemove) return;

  // Compare by roll number
  if (memberToRemove.rollno === currentUserRollNo) {
    toast.error("You cannot remove yourself");
    return;
  }

  // Rest of your existing removal logic...
  try {
    await removeTeamMember({
      event_id: parseInt(eventId!),
      user_id: memberId
    });
    setTeamMembers(prev => prev.filter(m => m.id !== memberId));
    toast.success("Member removed successfully");
  } catch (error) {
    toast.error("Failed to remove member");
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
      <div className="max-w-3xl mx-auto p-6 bg-surface rounded-xl shadow-xl mt-8">
        <p className="text-text-secondary">Loading event details...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-surface rounded-xl shadow-xl mt-8">
        <p className="text-text-secondary">Event not found.</p>
        <Button variant="outline" onClick={() => navigate('/dashboard')} className="mt-4">
          Back to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-surface rounded-xl shadow-xl mt-8">
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-1/2">
          <img
            src={`${import.meta.env.VITE_BACKEND_URL}/event/eventposter?id=${event.id}`}
            alt={event.name}
            className="w-full h-80 object-cover rounded-lg border border-border"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/default-event-poster.jpg';
            }}
          />
        </div>
        
        <div className="lg:w-1/2 space-y-4">
          <h1 className="text-3xl font-bold text-text">{event.name}</h1>
          
          <div className="space-y-2 text-text-secondary">
            <p className="text-text leading-relaxed">{event.about}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <p className="font-semibold text-text">Date:</p>
                <p>{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</p>
              </div>
              
              <div>
                <p className="font-semibold text-text">Venue:</p>
                <p>{event.venue}</p>
              </div>
              
              <div>
                <p className="font-semibold text-text">Type:</p>
                <p>{event.event_type} - {event.event_category}</p>
              </div>
              
              <div>
                <p className="font-semibold text-text">Team Size:</p>
                <p>{event.min_no_member} - {event.max_no_member} members</p>
              </div>
              
              {event.club_name && (
                <div>
                  <p className="font-semibold text-text">Organized by:</p>
                  <p>{event.club_name}</p>
                </div>
              )}
              
              <div>
                <p className="font-semibold text-text">Status:</p>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  event.status === 'ongoing' ? 'bg-green-500 text-white' :
                  event.status === 'upcoming' ? 'bg-blue-500 text-white' : 
                  'bg-gray-500 text-white'
                }`}>
                  {event.status.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex flex-wrap gap-4">
        {!registered ? (
          <Button 
            onClick={handleRegister} 
            disabled={registering || event.status === 'past'}
            className="px-6 py-3"
          >
            {registering ? 'Registering...' : 'Register for Event'}
          </Button>
        ) : (
          <div className="flex flex-wrap gap-4">
            {teamMembers.length < event.max_no_member && event.status !== 'past' && (
              <Button onClick={() => setShowInvite(true)} className="px-6 py-3">
                Invite Team Member
              </Button>
            )}
            
            {event.min_no_member > 1 && (
              <Button 
                variant="outline" 
                onClick={() => setShowTeam(true)}
                className="px-6 py-3"
              >
                View Team Members ({teamMembers.length})
              </Button>
            )}
            
            <div className="px-4 py-2 bg-green-500/10 text-green-500 rounded-lg border border-green-500/20">
              Registered {registered.team_name ? `as team: ${registered.team_name}` : ''}
            </div>
          </div>
        )}
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/dashboard')}
          className="px-6 py-3"
        >
          Back to Dashboard
        </Button>
      </div>

      {/* Invite Popup */}
      {showInvite && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-md border border-border">
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
                    ? 'text-green-500 bg-green-500/10' 
                    : 'text-red-500 bg-red-500/10'
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
          <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-2xl border border-border max-h-[80vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4 text-text">
              Team Members ({teamMembers.length}/{event.max_no_member})
            </h2>
            
            {teamMembers.length > 0 ? (
              <div className="space-y-3 mb-6">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                    <div className="flex-1">
                      <div className="font-medium text-text">{member.name}</div>
                      <div className="text-sm text-text-secondary">
                        {member.rollno} | {member.department} | Year {member.yearofstudy}
                      </div>
                      <div className="text-sm text-text-secondary">{member.email}</div>
                    </div>
                    
                    {currentUserRollNo && member.rollno !== currentUserRollNo && event.status !== 'past' && (
  <Button 
    size="sm"
    variant="outline"
    onClick={() => handleRemoveMember(member.id)}
    className="text-red-500 hover:text-red-600 hover:border-red-500"
    disabled={removingMember === member.id}
  >
    {removingMember === member.id ? 'Removing...' : 'Remove'}
  </Button>
)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-text-secondary mb-6">No team members found.</p>
            )}
            
            <Button variant="outline" onClick={closeTeamPopup} className="w-full">
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventDetailsPage;