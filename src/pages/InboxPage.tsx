import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getOngoingEvents,
  fetchInvitations,
  acceptTeamInvite,
  rejectTeamInvite
} from '../api';
import type { EventListItem, InviteWithDetails } from '../types/user';
import { showToast } from '../utils/toast';
import { useAuth } from '../context/AuthContext';

const InboxPage: React.FC = () => {
  const { user } = useAuth();
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
        showToast.error('Failed to load inbox data');
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
        to_user_id: 0,
        event_id: invite.event_id
      });

      setInvitations(prev => prev.filter(inv => inv.from_team_id !== invite.from_team_id));
      showToast.success('Team invitation accepted successfully!');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      showToast.error('Failed to accept invitation. Please try again.');
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleRejectInvite = async (invite: InviteWithDetails) => {
    setProcessingInvite(invite.from_team_id);
    try {
      let user_id: number = 0;
      if (user?.id) {
        user_id = user.id;
      }
      await rejectTeamInvite({
        from_team_id: invite.from_team_id,
        to_user_id: user_id,
        event_id: invite.event_id
      });

      setInvitations(prev => prev.filter(inv => inv.from_team_id !== invite.from_team_id));
      showToast.success('Team invitation rejected.');
    } catch (error) {
      console.error('Error rejecting invitation:', error);
      showToast.error('Failed to reject invitation. Please try again.');
    } finally {
      setProcessingInvite(null);
    }
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  if (loading) {
    return (
      <div className="page-container flex items-center justify-center">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4"></div>
          <p className="text-muted">Loading inbox...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="page-title">Inbox</h1>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn btn-secondary"
            >
              Back to Dashboard
            </button>
          </div>
          <p className="mt-2 text-muted">Manage your notifications and team invitations</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Event Notifications Panel */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Event Notifications</h2>
                <span className="badge badge-primary">
                  {ongoingEvents.length} active
                </span>
              </div>
            </div>

            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {ongoingEvents.length > 0 ? (
                ongoingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="p-4 hover:bg-muted cursor-pointer transition-colors"
                    onClick={() => handleEventClick(event.id)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-success/10 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{event.name}</p>
                        <p className="text-sm text-muted truncate">{event.about}</p>
                        <div className="mt-1 flex items-center space-x-4 text-xs text-muted">
                          <span>{event.venue}</span>
                          <span>{event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        <span className="badge badge-success">
                          Ongoing
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                  </svg>
                  <p className="text-muted">No ongoing events</p>
                </div>
              )}
            </div>
          </div>

          {/* Team Invitations */}
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="card-title">Team Invitations</h2>
                <span className="badge badge-warning">
                  {invitations.length} pending
                </span>
              </div>
            </div>

            <div className="divide-y divide-border max-h-96 overflow-y-auto">
              {invitations.length > 0 ? (
                invitations.map((invite) => (
                  <div key={`${invite.from_team_id}-${invite.event_id}`} className="p-4">
                    <div className="space-y-3">
                      <div>
                        <h3 className="text-sm font-medium text-foreground">{invite.event_name}</h3>
                        <p className="text-sm text-muted">Team invitation from {invite.from_user_name}</p>
                      </div>

                      <div className="bg-muted rounded-md p-3">
                        <div className="text-sm">
                          <span className="font-medium text-foreground">Team:</span>
                          <span className="ml-2 text-muted">{invite.teamName}</span>
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleAcceptInvite(invite)}
                          disabled={processingInvite === invite.from_team_id}
                          className="btn btn-success flex-1"
                        >
                          {processingInvite === invite.from_team_id ? (
                            <>
                              <div className="loading-spinner-sm mr-2"></div>
                              Processing...
                            </>
                          ) : (
                            'Accept'
                          )}
                        </button>

                        <button
                          onClick={() => handleRejectInvite(invite)}
                          disabled={processingInvite === invite.from_team_id}
                          className="btn btn-secondary flex-1"
                        >
                          Reject
                        </button>

                        <button
                          onClick={() => handleEventClick(invite.event_id)}
                          className="btn btn-secondary"
                        >
                          View Event
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <svg className="w-12 h-12 mx-auto text-muted mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-muted">No team invitations</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InboxPage;