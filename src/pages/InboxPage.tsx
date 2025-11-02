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
import {
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineEnvironment,
  AiOutlineBell,
  AiOutlineInbox,
  AiOutlineCheckCircle,
  AiOutlineSync
} from 'react-icons/ai';
import { showToast } from '../utils/toast';
import { useAuth } from '../context/AuthContext';

type IconComponent = React.ComponentType<{ className?: string }>;

const InboxPage: React.FC = () => {
  const {user} = useAuth();
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

      showToast.success('Invitation accepted. Happy collaborating!');
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
      if (user?.id){
        user_id = user.id;
      }
      await rejectTeamInvite({
        from_team_id: invite.from_team_id,
        to_user_id: user_id, // This will be handled by backend based on auth
        event_id: invite.event_id
      });

      // Remove invitation from list
      setInvitations(prev => prev.filter(inv => inv.from_team_id !== invite.from_team_id));

      showToast.success('Invitation rejected.');
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

  const statusCards: Array<{ label: string; value: number; icon: IconComponent }> = [
    {
      label: 'Active Events',
      value: ongoingEvents.length,
      icon: AiOutlineCalendar
    },
    {
      label: 'Pending Invites',
      value: invitations.length,
      icon: AiOutlineInbox
    }
  ];

  return (
    <div className="min-h-screen bg-background text-text">
      

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        {loading ? (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-3xl border border-border bg-surface/40"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
            <section className="space-y-6">
              <header className="flex flex-col gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
                  <AiOutlineCalendar className="h-5 w-5" />
                  Ongoing Events
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Active timelines waiting for you</h2>
                  <span className="rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
                    {ongoingEvents.length} events
                  </span>
                </div>
              </header>

              <div className="space-y-4">
                {ongoingEvents.length > 0 ? (
                  ongoingEvents.map((event) => (
                    <article
                      key={event.id}
                      className="group relative overflow-hidden rounded-3xl border border-border bg-surface/70 transition-transform duration-300 hover:-translate-y-1"
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.04),_transparent)] opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
                      <button
                        type="button"
                        onClick={() => handleEventClick(event.id)}
                        className="relative flex w-full items-stretch gap-6 p-6 text-left"
                      >
                        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl border border-border bg-background">
                          <img
                            src={`${import.meta.env.VITE_BACKEND_URL}/events/poster/${event.id}`}
                            alt={event.name}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/default-event-poster.jpg';
                            }}
                          />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col justify-between">
                          <div className="flex items-center justify-between gap-4">
                            <h3 className="text-lg font-semibold line-clamp-1">{event.name}</h3>
                            <span className="rounded-full border border-green-500/30 bg-green-500/10 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-green-400">
                              Ongoing
                            </span>
                          </div>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                              <AiOutlineCalendar className="h-4 w-4" />
                              {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                              <AiOutlineEnvironment className="h-4 w-4" />
                              {event.venue}
                            </span>
                          </div>
                        </div>
                      </button>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-border bg-surface/60 p-10 text-center">
                    <AiOutlineCalendar className="mx-auto mb-4 h-12 w-12 text-text-secondary" />
                    <h3 className="text-lg font-semibold">No ongoing events right now</h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      Once you join or follow events, live updates will surface here. Explore the dashboard to discover new opportunities.
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <header className="flex flex-col gap-2 border-b border-border pb-4">
                <div className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
                  <AiOutlineTeam className="h-5 w-5" />
                  Team Invitations
                </div>
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">Collaborations awaiting response</h2>
                  <span className="rounded-full border border-border px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
                    {invitations.length} invites
                  </span>
                </div>
              </header>

              <div className="space-y-4">
                {invitations.length > 0 ? (
                  invitations.map((invite) => (
                    <article
                      key={`${invite.from_team_id}-${invite.event_id}`}
                      className="rounded-3xl border border-border bg-surface/70 p-6 shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-[0.35em] text-text-secondary">
                              Invitation
                            </span>
                            <h3 className="text-lg font-semibold">{invite.event_name}</h3>
                            <p className="text-sm text-text-secondary">
                              {invite.from_user_name} wants you in <strong>{invite.teamName}</strong>.
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs text-text-secondary">
                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                              From {invite.from_user_name}
                            </span>
                            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1">
                              Team {invite.teamName}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvite(invite)}
                          disabled={processingInvite === invite.from_team_id}
                          className="flex-1 rounded-full bg-text px-4 py-3 text-background transition-colors duration-200 hover:bg-background hover:text-text"
                        >
                          {processingInvite === invite.from_team_id ? (
                            <span className="flex items-center justify-center gap-2">
                              <AiOutlineSync className="h-4 w-4 animate-spin" />
                              Processing
                            </span>
                          ) : (
                            <span className="flex items-center justify-center gap-2">
                              <AiOutlineCheckCircle className="h-4 w-4" />
                              Accept Invitation
                            </span>
                          )}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRejectInvite(invite)}
                          disabled={processingInvite === invite.from_team_id}
                          className="flex-1 rounded-full border border-border px-4 py-3 text-text transition-colors duration-200 hover:bg-background"
                        >
                          {processingInvite === invite.from_team_id ? 'Processing' : 'Reject'}
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEventClick(invite.event_id)}
                          className="flex-1 rounded-full border border-border px-4 py-3 text-text transition-colors duration-200 hover:bg-background"
                        >
                          View Event
                        </Button>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-border bg-surface/60 p-10 text-center">
                    <AiOutlineTeam className="mx-auto mb-4 h-12 w-12 text-text-secondary" />
                    <h3 className="text-lg font-semibold">No pending invitations</h3>
                    <p className="mt-2 text-sm text-text-secondary">
                      Team invitations from peers will surface instantly. Keep an eye here to respond quickly and secure your collaborations.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </section>
    </div>
  );
};

export default InboxPage;