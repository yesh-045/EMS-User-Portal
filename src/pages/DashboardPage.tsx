import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { getRegisteredEvents, getOngoingEvents, getUpcomingEvents, fetchInvitations } from '../api';
import type { RegisteredEvent, EventListItem, InviteWithDetails } from '../types/user';
import EventCard from '../components/EventCard';
import { 
  AiOutlineCheckCircle, 
  AiOutlineCalendar, 
  AiOutlineTeam, 
  AiOutlineSearch,
  AiOutlineFilter
} from 'react-icons/ai';

const DashboardPage: React.FC = () => {
  const { user} = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [allEvents, setAllEvents] = useState<EventListItem[]>([]);
  const [invitations, setInvitations] = useState<InviteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [eventStatus, setEventStatus] = useState<'all' | 'ongoing' | 'upcoming'>('all');
  const [eventType, setEventType] = useState<'all' | 'technical' | 'non-technical'>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [regRes, ongoing, upcoming, invitationsRes] = await Promise.all([
          getRegisteredEvents(),
          getOngoingEvents(),
          getUpcomingEvents(),
          fetchInvitations().catch(() => ({ data: [] })) // Handle if invitations fail
        ]);
        
        setRegisteredEvents(regRes.data);
        setAllEvents([...ongoing.data, ...upcoming.data]);
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

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-text">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-text-secondary mt-1">
              Manage your events and team invitations
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Registered Events</p>
                <p className="text-2xl font-bold text-text">{registeredEvents.length}</p>
              </div>
              <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center">
                <AiOutlineCheckCircle className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Available Events</p>
                <p className="text-2xl font-bold text-text">{allEvents.length}</p>
              </div>
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <AiOutlineCalendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-surface rounded-lg p-4 border border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary text-sm">Team Invitations</p>
                <p className="text-2xl font-bold text-text">{invitations.length}</p>
              </div>
              <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                <AiOutlineTeam className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>
        </div>

        {/* Registered Events Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-text">Your Registered Events</h2>
            {registeredEvents.length > 0 && (
              <span className="text-sm text-text-secondary">
                {registeredEvents.length} event{registeredEvents.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
          
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-text-secondary">Loading events...</span>
            </div>
          ) : registeredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 place-items-center">
              {registeredEvents.map((registration) => (
                <EventCard
                  key={registration.team_id}
                  event={registration.event}
                  isRegistered={true}
                  teamName={registration.team_name}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-lg p-8 text-center border border-border">
              <AiOutlineCheckCircle className="w-16 h-16 mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">No registered events yet</p>
              <p className="text-text-secondary text-sm mt-1">Browse events below to get started</p>
            </div>
          )}
        </section>

        {/* All Events Section with Filters */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-2xl font-bold text-text">All Events</h2>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <span className="mr-2">Filter</span>
                <AiOutlineFilter
                  className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                />
              </Button>
            </div>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="bg-surface p-4 rounded-lg border border-border space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Event Status
                  </label>
                  <select
                    className="w-full bg-input-bg border border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value as any)}
                  >
                    <option value="all">All Status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-2">
                    Event Type
                  </label>
                  <select
                    className="w-full bg-input-bg border border-border rounded-lg p-3 text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as any)}
                  >
                    <option value="all">All Types</option>
                    <option value="technical">Technical</option>
                    <option value="non-technical">Non-Technical</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Events Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
              <span className="ml-3 text-text-secondary">Loading events...</span>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 place-items-center">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  isRegistered={registeredEvents.some(
                    reg => reg.event.id === event.id
                  )}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface rounded-lg p-8 text-center border border-border">
              <AiOutlineSearch className="w-16 h-16 mx-auto text-text-secondary mb-4" />
              <p className="text-text-secondary text-lg">No events found</p>
              <p className="text-text-secondary text-sm mt-1">
                Try adjusting your filters or check back later for new events
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;