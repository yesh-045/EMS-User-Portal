import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { getRegisteredEvents, getOngoingEvents, getUpcomingEvents, fetchInvitations } from '../api';
import type { RegisteredEvent, EventListItem, InviteWithDetails } from '../types/user';
import EventCard from '../components/EventCard';
import RegisteredEvents from '../components/RegisteredEvents';
import {
  AiOutlineCheckCircle,
  AiOutlineCalendar,
  AiOutlineTeam,
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineTrophy,
  AiOutlineClockCircle
} from 'react-icons/ai';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-transparent rounded-2xl"></div>
          <div className="relative card glass-effect">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="animate-slide-up">
                <h1 className="text-4xl lg:text-5xl font-bold mb-2">
                  {getGreeting()}, <span className="gradient-text">{user?.name || 'Student'}</span>!
                </h1>
                <p className="text-text-secondary text-lg">
                  Ready to explore new events and manage your activities?
                </p>
              </div>
              <div className="flex items-center space-x-3 animate-scale-in">
                <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                  <AiOutlineTrophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-sm text-text-secondary">Your Progress</div>
                  <div className="text-lg font-semibold">{registeredEvents.length} Events Joined</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registered Events Section */}
        <section className="animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="card-header">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <AiOutlineCheckCircle className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold">My Events</h2>
            </div>
          </div>
          <RegisteredEvents />
        </section>

        {/* All Events Section with Filters */}
        <section className="space-y-6 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div className="card-header">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-secondary rounded-lg flex items-center justify-center">
                  <AiOutlineCalendar className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold">Discover Events</h2>
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`btn btn-outline ${showFilters ? 'btn-primary' : ''}`}
              >
                <AiOutlineFilter className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Enhanced Filter Options */}
          {showFilters && (
            <div className="card glass-effect animate-slide-up">
              <div className="card-header">
                <h3 className="card-title">Filter Events</h3>
                <p className="card-description">Customize your event discovery experience</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="form-group">
                  <label className="form-label">
                    <AiOutlineClockCircle className="w-4 h-4 inline mr-2" />
                    Event Status
                  </label>
                  <select
                    className="form-input"
                    value={eventStatus}
                    onChange={(e) => setEventStatus(e.target.value as any)}
                  >
                    <option value="all">All Status</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="upcoming">Upcoming</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">
                    <AiOutlineTrophy className="w-4 h-4 inline mr-2" />
                    Event Type
                  </label>
                  <select
                    className="form-input"
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
            <div className="card">
              <div className="flex flex-col items-center justify-center py-16">
                <div className="loading-spinner mb-4"></div>
                <p className="text-text-secondary text-lg">Loading amazing events for you...</p>
              </div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredEvents.map((event, index) => (
                <div
                  key={event.id}
                  className="animate-scale-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <EventCard
                    event={event}
                    isRegistered={registeredEvents.some(
                      reg => reg.event.id === event.id
                    )}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="card text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                <AiOutlineSearch className="w-12 h-12 text-text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Events Found</h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                We couldn't find any events matching your current filters. Try adjusting your search criteria or check back later for new events.
              </p>
              <button
                onClick={() => {
                  setEventStatus('all');
                  setEventType('all');
                  setShowFilters(false);
                }}
                className="btn btn-primary"
              >
                Clear Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default DashboardPage;