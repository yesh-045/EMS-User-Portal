import React from 'react';

export type EventFilterType = 'all' | 'ongoing' | 'upcoming' | 'technical' | 'non-technical';

interface EventFiltersProps {
  activeFilter: EventFilterType;
  onFilterChange: (filter: EventFilterType) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({ activeFilter, onFilterChange }) => {
  const filters: EventFilterType[] = ['all', 'ongoing', 'upcoming', 'technical', 'non-technical'];

  return (
    <div className="flex flex-wrap gap-2 justify-end mb-4">
      {filters.map((filter) => (
        <button
          key={filter}
          onClick={() => onFilterChange(filter)}
          className={`px-4 py-2 rounded-full text-sm transition-colors duration-200 ${
            activeFilter === filter
              ? 'bg-accent text-primary'
              : 'bg-surface text-text-secondary hover:bg-button-hover'
          }`}
        >
          {filter.charAt(0).toUpperCase() + filter.slice(1)}
        </button>
      ))}
    </div>
  );
};

export default EventFilters;
