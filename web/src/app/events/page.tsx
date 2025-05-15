'use client';
import { useState } from 'react';
import { useEvents } from '@/hooks/useEvents';
import EventCard from '@/components/events/EventCard';
import Pagination from '@/components/common/Pagination';

export default function EventsPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const { data: events = [], isLoading } = useEvents(filters);

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-clip-text text-transparent">
        Events
      </h1>
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search events..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="px-4 py-2 rounded-lg bg-black/60 border border-white/10 text-white w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-cyan-400"
        />
        {/* Add more filters here */}
      </div>
      {isLoading ? (
        <div className="text-center py-16 text-lg text-white/60 animate-pulse">
          Loading events...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {events.map((event: any, i: number) => (
            <EventCard key={i} event={event} />
          ))}
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={2} onPageChange={setCurrentPage} />
    </div>
  );
}
