
import React from 'react';
import type { EventListItem, RegisteredEventData } from '../types/user';
import { useNavigate } from 'react-router-dom';
import { AiOutlineCalendar, AiOutlineEnvironment, AiOutlineTag, AiOutlineTeam } from 'react-icons/ai';

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
      className="bg-surface rounded-xl shadow-md overflow-hidden border border-border hover:border-accent hover:shadow-lg transition-all duration-200 cursor-pointer group max-w-sm w-full"
      onClick={handleClick}
    >
      <div className="aspect-[4/3] w-full bg-secondary relative overflow-hidden">
        <img
          src={`${import.meta.env.VITE_BACKEND_URL}/event/eventposter?id=${event.id}`}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
          onError={e => {
            (e.target as HTMLImageElement).src = '/default-event-poster.jpg';
          }}
        />
        {'status' in event && (
          <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium shadow-lg ${
            event.status === 'ongoing' ? 'bg-accent text-primary' :
            event.status === 'upcoming' ? 'bg-accent/80 text-primary' : 'bg-text-secondary text-background'
          }`}>
            {event.status}
          </div>
        )}
        {isRegistered && (
          <div className="absolute top-3 left-3 bg-accent/90 text-primary px-2 py-1 rounded-full text-xs font-medium shadow-lg">
            ✓ Registered
          </div>
        )}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-text line-clamp-1 group-hover:text-accent transition-colors duration-200">
            {event.name}
          </h3>
          <p className="text-text-secondary text-sm mt-1 line-clamp-2 leading-relaxed">
            {event.about}
          </p>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-text-secondary">
            <AiOutlineCalendar className="w-4 h-4 text-accent flex-shrink-0" />
            <span>{event.date ? new Date(event.date).toLocaleDateString() : 'Date TBA'}</span>
          </div>
          <div className="flex items-center gap-2 text-text-secondary">
            <AiOutlineEnvironment className="w-4 h-4 text-accent flex-shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
          {'event_type' in event && (
            <div className="flex items-center gap-2 text-text-secondary">
              <AiOutlineTag className="w-4 h-4 text-accent flex-shrink-0" />
              <span>{event.event_type} • {event.event_category}</span>
            </div>
          )}
          {teamName && (
            <div className="flex items-center gap-2 text-text-secondary">
              <AiOutlineTeam className="w-4 h-4 text-accent flex-shrink-0" />
              <span>Team: {teamName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventCard;
