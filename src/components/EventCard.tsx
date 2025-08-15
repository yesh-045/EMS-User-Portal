
import React from 'react';
import type { EventListItem, RegisteredEventData } from '../types/user';
import { useNavigate } from 'react-router-dom';

interface EventCardProps {
  event: EventListItem | RegisteredEventData;
  isRegistered?: boolean;
  teamName?: string | null;
}

const EventCard: React.FC<EventCardProps> = ({ event, isRegistered, teamName }) => {
  const navigate = useNavigate();
  const handleClick = () => {
    navigate(`/events/${event.id}`);
  };
  return (
    <div
      className="bg-surface rounded-lg shadow-lg overflow-hidden border border-border hover:border-accent transition-all duration-200 cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-video w-full bg-secondary relative">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/events/poster/${event.id}`}
          alt={event.name}
          className="w-full h-full object-cover"
          onError={e => {
            (e.target as HTMLImageElement).src = '/default-event-poster.jpg';
          }}
        />
        {'status' in event && (
          <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-sm font-medium ${
            event.status === 'ongoing' ? 'bg-green-500' :
            event.status === 'upcoming' ? 'bg-blue-500' : 'bg-gray-500'
          } text-white`}>
            {event.status}
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-text truncate">{event.name}</h3>
          {isRegistered && (
            <span className="bg-accent/10 text-accent px-2 py-1 rounded-full text-xs">Registered</span>
          )}
        </div>
        <p className="text-text-secondary text-sm mb-2 line-clamp-2">{event.about}</p>
        <div className="space-y-1 text-sm text-text-secondary">
          <p><span className="font-medium">Date:</span> {event.date ? new Date(event.date).toLocaleDateString() : 'TBA'}</p>
          <p><span className="font-medium">Venue:</span> {event.venue}</p>
          {'event_type' in event && (
            <p><span className="font-medium">Type:</span> {event.event_type} - {event.event_category}</p>
          )}
          {isRegistered && teamName && (
            <p><span className="font-medium">Team:</span> {teamName}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
