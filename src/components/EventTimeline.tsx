import React, { useState, useMemo } from 'react';
import type { EventListItem, RegisteredEvent } from '../types/user';
import { useNavigate } from 'react-router-dom';

interface EventTimelineProps {
  registeredEvents: RegisteredEvent[];
  allEvents: EventListItem[];
}

type TimelineMode = 'registered' | 'all';

const EventTimeline: React.FC<EventTimelineProps> = ({ registeredEvents, allEvents }) => {
  const [mode, setMode] = useState<TimelineMode>('registered');
  const navigate = useNavigate();

  // Process events for timeline display
  const timelineEvents = useMemo(() => {
    const events = mode === 'registered' 
      ? registeredEvents.map(reg => ({
          id: reg.event.id,
          name: reg.event.name,
          date: reg.event.date,
          venue: reg.event.venue,
          description: reg.event.about,
          teamName: reg.team_name,
          isRegistered: true,
          event_type: reg.event.event_type,
          event_category: reg.event.event_category
        }))
      : allEvents.map(event => ({
          id: event.id,
          name: event.name,
          date: event.date,
          venue: event.venue,
          description: event.about,
          isRegistered: registeredEvents.some(reg => reg.event.id === event.id),
          teamName: registeredEvents.find(reg => reg.event.id === event.id)?.team_name || null,
          event_type: event.event_type,
          event_category: event.event_category,
          status: event.status
        }));

    // Sort by date (recent first)
    return events.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }, [mode, registeredEvents, allEvents]);

  // Group events by month
  const groupedEvents = useMemo(() => {
    const groups: Record<string, typeof timelineEvents> = {};
    
    timelineEvents.forEach(event => {
      if (!event.date) {
        const key = 'TBA';
        if (!groups[key]) groups[key] = [];
        groups[key].push(event);
        return;
      }
      
      const date = new Date(event.date);
      const key = `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
      
      if (!groups[key]) groups[key] = [];
      groups[key].push(event);
    });
    
    return groups;
  }, [timelineEvents]);

  // Function to determine the status color
  const getStatusColor = (event: any) => {
    if (event.isRegistered) return 'bg-accent';
    if (event.status === 'ongoing') return 'bg-green-500';
    if (event.status === 'upcoming') return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const handleEventClick = (eventId: number) => {
    navigate(`/events/${eventId}`);
  };

  return (
    <div className="bg-surface rounded-xl shadow-lg border border-border p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-bold text-text">Event Timeline</h2>
        
        {/* Toggle Switch */}
        <div className="bg-background border border-border rounded-full p-1 flex items-center">
          <button
            onClick={() => setMode('registered')}
            className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
              mode === 'registered'
                ? 'bg-accent text-primary'
                : 'text-text-secondary hover:bg-button-hover'
            }`}
          >
            My Events
          </button>
          <button
            onClick={() => setMode('all')}
            className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
              mode === 'all'
                ? 'bg-accent text-primary'
                : 'text-text-secondary hover:bg-button-hover'
            }`}
          >
            All Events
          </button>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border"></div>

        {Object.entries(groupedEvents).length > 0 ? (
          <div className="space-y-6 pl-14 relative">
            {Object.entries(groupedEvents).map(([month, events]) => (
              <div key={month} className="mb-8">
                {/* Month marker */}
                <div className="absolute left-0 rounded-full w-8 h-8 bg-accent/10 flex items-center justify-center border border-accent z-10">
                  <span className="text-xs font-bold text-accent">
                    {month === 'TBA' ? 'TBA' : month.substring(0, 3)}
                  </span>
                </div>
                
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-text">{month}</h3>
                </div>

                {/* Events for this month */}
                <div className="space-y-4">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="relative bg-background rounded-lg p-4 border border-border hover:border-accent transition-all cursor-pointer"
                      onClick={() => handleEventClick(event.id)}
                    >
                      {/* Event status dot */}
                      <div className="absolute left-[-25px] top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border-2 border-background z-10" 
                        style={{ backgroundColor: event.isRegistered ? 'var(--color-accent)' : 
                                (event.status === 'ongoing' ? '#10b981' : 
                                event.status === 'upcoming' ? '#3b82f6' : '#6b7280') }}
                      ></div>
                      
                      <div className="flex flex-col sm:flex-row justify-between">
                        <div className="space-y-1">
                          <h4 className="text-md font-semibold text-text flex items-center">
                            {event.name}
                            {event.isRegistered && (
                              <span className="ml-2 text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">
                                Registered
                              </span>
                            )}
                          </h4>
                          
                          <p className="text-sm text-text-secondary line-clamp-2">
                            {event.description}
                          </p>
                          
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-text-secondary">
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}
                            </span>
                            
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              {event.venue}
                            </span>
                            
                            <span className="flex items-center">
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              {event.event_type} • {event.event_category}
                            </span>
                            
                            {event.teamName && (
                              <span className="flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                Team: {event.teamName}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-text-secondary">
            {mode === 'registered' ? 'No registered events found' : 'No events found'}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventTimeline;