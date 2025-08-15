import React, { useEffect, useState } from 'react';
import { getRegisteredEvents } from '../api';
import EventCard from './EventCard';
import type { RegisteredEvent } from '../types/user';

const RegisteredEvents: React.FC = () => {
  const [registeredEvents, setRegisteredEvents] = useState<RegisteredEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const response = await getRegisteredEvents();
        setRegisteredEvents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch registered events');
        setLoading(false);
      }
    };

    fetchRegisteredEvents();
  }, []);

  if (loading) {
    return (
      <div className="w-full p-4 text-center text-text-secondary">
        Loading registered events...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-4 text-center text-red-500">
        {error}
      </div>
    );
  }

  if (registeredEvents.length === 0) {
    return (
      <div className="w-full p-4 text-center text-text-secondary">
        No registered events found
      </div>
    );
  }

  return (
    <section className="mb-8">
      <h2 className="text-2xl font-bold mb-4 text-text">Registered Events</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {registeredEvents.map((event) => (
          <EventCard
            key={`${event.team_id}-${event.event.id}`}
            id={event.event.id}
            name={event.event.name}
            about={event.event.about}
            date={event.event.date}
            venue={event.event.venue}
            event_type={event.event.event_type}
            event_category={event.event.event_category}
            team_name={event.team_name}
            isRegistered={true}
            club_name={null} // Add club name if available in your data
          />
        ))}
      </div>
    </section>
  );
};

export default RegisteredEvents;
