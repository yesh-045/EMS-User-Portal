import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  getOngoingEvents, 
  fetchInvitations, 
  acceptTeamInvite, 
  rejectTeamInvite 
} from '../api';
import type { EventListItem, InviteWithDetails } from '../types/user';
import Button from '../components/Button';

const InboxPage: React.FC = () => {
  const navigate = useNavigate();
  const [ongoingEvents, setOngoingEvents] = useState<EventListItem[]>([]);
  const [invitations, setInvitations] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingInvite, setProcessingInvite] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [ongoingRes, invitesRes] = await Promise.all([
          getOngoingEvents(),
          fetchInvitations()
        ]);
        setOngoingEvents(ongoingRes.data);
        setInvitations(invitesRes.data);
      } catch (error) {
        console.error('Error fetching inbox data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAcceptInvite = async (invite: InviteWithDetails) => {
    setProcessingInvite(invite.from_team_id);
    try {
      await acceptTeamInvite({
        from_team_id: invite.from_team_id,
        to_user_id: 0, // This will be handled by backend based on auth
        event_id: invite.event_id
      });

      // Remove invitation from list
      setInvitations(prev => prev.filter(inv => inv.from_team_id !== invite.from_team_id));
      
      // Show success message (you can implement toast here)
      alert('Team invitation accepted successfully!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      alert('Failed to accept invitation. Please try again.');
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleRejectInvite = async (invite: InviteWithDetails) => {
    setProcessingInvite(invite.from_team_id);
    try {
      await rejectTeamInvite({
        from_team_id: invite.from_team_id,
        to_user_id: 0, // This will be handled by backend based on auth
        event_id: invite.event_id
      });

      // Remove invitation from list
      setInvitations(prev => prev.filter(inv => inv.from_team_id !== invite.from_team_id));
      
      // Show success message
      alert('Team invitation rejected.');
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      alert('Failed to reject invitation. Please try again.');
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-text">Inbox</h1>
          <Button 
            variant="outline" 
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2"
          >
            Back to Dashboard
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg">Loading inbox...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Ongoing Events Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text">Ongoing Events</h2>
                <span className="text-sm text-text-secondary bg-surface px-3 py-1 rounded-full border border-border">
                  {ongoingEvents.length} events
                </span>
              </div>
              
              <div className="bg-surface rounded-xl shadow-lg border border-border">
                {ongoingEvents.length > 0 ? (
                  <div className="divide-y divide-border">
                    {ongoingEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className="p-4 hover:bg-background/50 transition-colors cursor-pointer"
                        onClick={() => handleEventClick(event.id)}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={`${import.meta.env.VITE_BACKEND_URL}/events/poster/${event.id}`}
                              alt={event.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-event-poster.jpg';
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text truncate">{event.name}</h3>
                            <p className="text-sm text-text-secondary mt-1 line-clamp-2">
                              {event.about}
                            </p>
                            
                            <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-secondary">
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                              </span>
                              
                              <span className="flex items-center">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                {event.venue}
                              </span>
                            </div>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className="text-xs bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20">
                                ONGOING
                              </span>
                              
                              <span className="text-xs text-text-secondary">
                                {event.event_type} • {event.event_category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-text-secondary">No ongoing events at the moment</p>
                  </div>
                )}
              </div>
            </section>

            {/* Team Invitations Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-text">Team Invitations</h2>
                <span className="text-sm text-text-secondary bg-surface px-3 py-1 rounded-full border border-border">
                  {invitations.length} invitations
                </span>
              </div>
              
              <div className="bg-surface rounded-xl shadow-lg border border-border">
                {invitations.length > 0 ? (
                  <div className="divide-y divide-border">
                    {invitations.map((invite) => (
                      <div key={`${invite.from_team_id}-${invite.event_id}`} className="p-4">
                        <div className="space-y-3">
                          <div>
                            <h3 className="font-semibold text-text text-lg">{invite.event_name}</h3>
                            <p className="text-text-secondary text-sm mt-1">
                              You've been invited to join a team for this event
                            </p>
                          </div>
                          
                          <div className="bg-background/50 rounded-lg p-3 border border-border">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="font-medium text-text">From:</span>
                                <span className="ml-2 text-text-secondary">{invite.from_user_name}</span>
                              </div>
                              <div>
                                <span className="font-medium text-text">Team:</span>
                                <span className="ml-2 text-text-secondary">{invite.teamName}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleAcceptInvite(invite)}
                              disabled={processingInvite === invite.from_team_id}
                              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            >
                              {processingInvite === invite.from_team_id ? 'Processing...' : 'Accept Invitation'}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRejectInvite(invite)}
                              disabled={processingInvite === invite.from_team_id}
                              className="flex-1 text-red-500 border-red-500 hover:bg-red-50"
                            >
                              {processingInvite === invite.from_team_id ? 'Processing...' : 'Reject'}
                            </Button>
                            
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEventClick(invite.event_id)}
                              className="flex-1"
                            >
                              View Event
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <p className="text-text-secondary">No team invitations</p>
                    <p className="text-text-secondary text-sm mt-1">Team invitations will appear here when you receive them</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
        
        {/* Summary Cards */}
        {!loading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Ongoing Events</p>
                  <p className="text-2xl font-bold text-text">{ongoingEvents.length}</p>
                </div>
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Pending Invitations</p>
                  <p className="text-2xl font-bold text-text">{invitations.length}</p>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div className="bg-surface rounded-lg p-4 border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-text-secondary text-sm">Total Notifications</p>
                  <p className="text-2xl font-bold text-text">{ongoingEvents.length + invitations.length}</p>
                </div>
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V3h5v14z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InboxPage;