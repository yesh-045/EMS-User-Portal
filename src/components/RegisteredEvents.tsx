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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {registeredEvents.map((registration) => (
          <EventCard
            key={`${registration.team_id}-${registration.event.id}`}
            event={registration.event}
            isRegistered={true}
            teamName={registration.team_name}
          />
        ))}
      </div>
    </section>
  );
};

export default RegisteredEvents;
