import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/Button';
import { getRegisteredEvents, getOngoingEvents, getUpcomingEvents, fetchInvitations } from '../api';
import type { RegisteredEvent, EventListItem, InviteWithDetails } from '../types/user';
import EventCard from '../components/EventCard';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

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
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="flex items-center"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/inbox')}
              className="relative"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4m16 0l-2-2m-12 2l2-2" />
              </svg>
              Inbox
              {invitations.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {invitations.length}
                </span>
              )}
            </Button>
            
            <Button variant="outline" onClick={handleLogout}>
              Logout
            </Button>
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
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
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
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
                <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
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
                <svg
                  className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                  />
                </svg>
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              <svg className="w-16 h-16 mx-auto text-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
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