import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRegisteredEvents, getOngoingEvents, getUpcomingEvents, fetchInvitations } from '../api';
import type { RegisteredEvent, EventListItem, InviteWithDetails } from '../types/user';
import EventCard from '../components/EventCard';
import { AiOutlineCheckCircle, AiOutlineCalendar, AiOutlineFilter, AiOutlineBell, AiOutlineArrowRight } from 'react-icons/ai';

type IconComponent = React.ComponentType<{ className?: string }>;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [upcomingEventsList, setUpcomingEventsList] = useState<EventListItem[]>([]);
  const [invitations, setInvitations] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStatus, setEventStatus] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [eventType, setEventType] = useState<'all' | 'technical' | 'non-technical'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [regRes, ongoingRes, upcomingRes, invitationsRes] = await Promise.all([
          getRegisteredEvents(),
          getOngoingEvents(),
          getUpcomingEvents(),
          fetchInvitations().catch(() => ({ data: [] })) // Handle if invitations fail
        ]);

        setRegisteredEvents(regRes.data);
        setUpcomingEventsList(upcomingRes.data);
        setAllEvents([...(ongoingRes.data || []), ...(upcomingRes.data || [])]);
        setInvitations(invitationsRes.data || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Filter events based on status and type
  const filteredEvents = allEvents.filter(event => {
    const matchesStatus = eventStatus === 'all' || event.status === eventStatus;
    const matchesType = eventType === 'all' || event.event_type.toLowerCase() === eventType;
    return matchesStatus && matchesType;
  });

  const firstName = user?.name ? user.name.split(' ')[0] : 'there';

  const stats: Array<{ label: string; value: string; icon: IconComponent }> = [
    { label: 'Joined', value: registeredEvents.length.toString(), icon: AiOutlineCheckCircle },
    { label: 'Invites', value: invitations.length.toString(), icon: AiOutlineBell },
    { label: 'Upcoming', value: upcomingEventsList.length.toString(), icon: AiOutlineCalendar }
  ];

  const quickActions: Array<{ label: string; icon: IconComponent; onClick: () => void }> = [
    {
      label: 'Inbox',
      icon: AiOutlineBell,
      onClick: () => navigate('/inbox')
    }
  ];

  const nextEvent = upcomingEventsList[0];
  

  return (
    <div className="min-h-screen bg-background text-text">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Top hero row */}
  <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_720px] gap-8 mb-8 items-start">
          <div className="flex flex-col gap-4">
            <div className="rounded-3xl border border-border bg-surface/70 p-8 shadow-lg">
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold">Hey, {firstName}</h1>
                  <p className="mt-2 text-sm text-text-secondary">Quick view of your EMS activity</p>
                </div>

                <div className="w-56 flex flex-col gap-3">
                  {quickActions.map((a) => (
                    <button
                      key={a.label}
                      onClick={a.onClick}
                      className="flex items-center justify-between rounded-full border border-border bg-background/80 px-4 py-3 text-xs font-semibold uppercase tracking-[0.25em] hover:bg-text hover:text-background"
                    >
                      <span className="flex items-center gap-2"><a.icon className="h-4 w-4" />{a.label}</span>
                      <AiOutlineArrowRight className="h-4 w-4" />
                    </button>
                  ))}

                  <div className="rounded-2xl border border-border bg-background/80 p-3 text-sm text-text-secondary">
                      {nextEvent ? (
                        <div>
                          <div className="text-xs uppercase tracking-[0.25em]">Next</div>
                          <div className="mt-2 font-semibold">{nextEvent.name}</div>
                          <div className="text-xs mt-1 text-text-secondary">{nextEvent.date ? new Date(nextEvent.date).toLocaleDateString() : 'TBA'}</div>
                        </div>
                      ) : (
                        <div>No upcoming events</div>
                      )}
                    </div>

                    
                </div>
              </div>
            </div>

            {/* Bottom area rendered below the hero; larger circles now centered */}
            <div className="mt-6 flex items-center justify-center gap-8">
              {stats.map(s => (
                <div key={s.label} className="flex flex-col items-center justify-center w-24 h-24 rounded-full border border-border bg-background/20 text-center text-sm">
                  <div className="text-sm text-text-secondary uppercase tracking-[0.06em]">{s.label.split(':')[0]}</div>
                  <div className="mt-1 text-2xl font-semibold">{s.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            {/* Fixed-height My Events panel with internal horizontal scroller */}
            <div className="rounded-3xl border border-border bg-surface/70 p-6 h-[460px] flex flex-col overflow-hidden w-full max-w-[720px]">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">My Events</h3>
                <span className="text-xs text-text-secondary">{registeredEvents.length}</span>
              </div>

              <div className="mt-4 flex-1">
                {registeredEvents.length === 0 ? (
                  <div className="text-sm text-text-secondary">You haven't joined any events yet.</div>
                ) : (
                  <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-x-auto overflow-y-hidden -mx-3 mt-3 scrollbar-hide snap-x snap-mandatory scroll-smooth"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                    >
                      <div className="flex gap-4 px-3 items-start">
                        {registeredEvents.slice(0, 8).map(reg => (
                          <div key={`${reg.team_id}-${reg.event.id}`} className="w-56 flex-shrink-0 snap-start">
                            <EventCard event={reg.event} isRegistered={true} teamName={reg.team_name} />
                          </div>
                        ))}
                        {registeredEvents.length > 8 && (
                          <div className="w-56 flex-shrink-0 flex items-center justify-center rounded-xl border border-border bg-background/70 snap-start">
                            <button onClick={() => navigate('/profile')} className="text-sm font-semibold">View all</button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* optional: small pager or hint */}
                    <div className="mt-3 text-xs text-text-secondary">Swipe right to view more</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Discover becomes full-width below */}
        <section className="rounded-3xl border border-border bg-surface/70 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Discover more events</h2>
            <div className="flex items-center gap-3">
              <button onClick={() => setShowFilters(prev => !prev)} className="rounded-full border border-border px-3 py-2 text-xs">{showFilters ? 'Hide' : 'Filter'}</button>
            </div>
          </div>

          {showFilters && (
            <div className="mb-4 rounded-2xl border border-border bg-background/70 p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <select className="form-input" value={eventStatus} onChange={(e) => setEventStatus(e.target.value as any)}>
                  <option value="all">All</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="upcoming">Upcoming</option>
                </select>
                <select className="form-input" value={eventType} onChange={(e) => setEventType(e.target.value as any)}>
                  <option value="all">All</option>
                  <option value="technical">Technical</option>
                  <option value="non-technical">Non-Technical</option>
                </select>
                <div></div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              [...Array(6)].map((_, i) => (
                <div key={i} className="h-40 rounded-2xl border border-border bg-background/40 animate-pulse"></div>
              ))
            ) : filteredEvents.length > 0 ? (
              filteredEvents.map(event => (
                <EventCard key={event.id} event={event} isRegistered={registeredEvents.some(r => r.event.id === event.id)} />
              ))
            ) : (
              <div className="col-span-full text-center text-text-secondary p-8 rounded-2xl border border-border bg-background/70">No events found</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;