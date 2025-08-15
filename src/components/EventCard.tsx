import React from 'react';

interface EventCardProps {
  id: number;
  name: string;
  about: string;
  date: string | Date | null;
  venue: string;
  event_type: string;
  event_category: string;
  poster_url?: string;
  club_name: string | null;
  team_name?: string | null;
  isRegistered?: boolean;
  onRegister?: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  name,
  about,
  date,
  venue,
  event_type,
  event_category,
  poster_url,
  club_name,
  team_name,
  isRegistered,
  onRegister
}) => {
  const formattedDate = date ? new Date(date).toLocaleDateString() : 'TBA';

  return (
    <div className="bg-surface rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-border">
      <div className="relative h-48">
        {poster_url ? (
          <img
            src={poster_url}
            alt={`${name} poster`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-secondary flex items-center justify-center">
            <span className="text-text-secondary">No poster available</span>
          </div>
        )}
        <div className="absolute top-2 right-2">
          <span className="px-2 py-1 text-xs rounded-full bg-primary text-text">
            {event_type}
          </span>
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-text mb-2">{name}</h3>
        <p className="text-text-secondary text-sm mb-2 line-clamp-2">{about}</p>
        <div className="space-y-1 text-sm text-text-secondary">
          <p><span className="font-medium">Date:</span> {formattedDate}</p>
          <p><span className="font-medium">Venue:</span> {venue}</p>
          <p><span className="font-medium">Category:</span> {event_category}</p>
          {club_name && (
            <p><span className="font-medium">Club:</span> {club_name}</p>
          )}
          {team_name && (
            <p><span className="font-medium">Team:</span> {team_name}</p>
          )}
        </div>
        {!isRegistered && onRegister && (
          <button
            onClick={onRegister}
            className="mt-4 w-full py-2 bg-accent text-primary rounded-md hover:bg-button-hover transition-colors duration-200"
          >
            Register
          </button>
        )}
        {isRegistered && (
          <div className="mt-4 text-center py-2 bg-secondary text-text-secondary rounded-md">
            Registered
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
