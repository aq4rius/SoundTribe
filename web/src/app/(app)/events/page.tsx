'use client';
import { useState, useEffect, useCallback } from 'react';
import { getEventsAction } from '@/actions/events';
import { getGenres } from '@/actions/genres';
import EventCard from '@/components/events/event-card';
import Pagination from '@/components/common/pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { EventCardSkeleton } from '@/components/shared/skeletons';
import { Calendar } from 'lucide-react';

interface EventFilters {
  search: string;
  genres: string[];
  location: string;
  dateFrom: string;
  dateTo: string;
  paymentMin: string;
  paymentMax: string;
  paymentType: string;
  status: string;
}

type EventResult = {
  id: string;
  title: string;
  location: string;
  description: string;
  eventDate: Date | string;
};

export default function EventsPage() {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    genres: [],
    location: '',
    dateFrom: '',
    dateTo: '',
    paymentMin: '',
    paymentMax: '',
    paymentType: '',
    status: '',
  });
  const [genreOptions, setGenreOptions] = useState<{ id: string; name: string }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<EventResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getEventsAction({
        search: filters.search || undefined,
        genres: filters.genres.length > 0 ? filters.genres : undefined,
        location: filters.location || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        paymentMin: filters.paymentMin || undefined,
        paymentMax: filters.paymentMax || undefined,
        paymentType: filters.paymentType || undefined,
        status: filters.status || undefined,
        page: currentPage,
        limit: 9,
      });
      if (result.success) {
        setEvents(result.data.data as EventResult[]);
        setTotalPages(result.data.totalPages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    // Load genres and initial events in parallel on mount
    const loadInitial = async () => {
      const [genresResult] = await Promise.all([
        getGenres().catch(() => [] as { id: string; name: string }[]),
        fetchEvents(),
      ]);
      setGenreOptions(genresResult);
    };
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (key: keyof EventFilters, value: EventFilters[keyof EventFilters]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      genres: [],
      location: '',
      dateFrom: '',
      dateTo: '',
      paymentMin: '',
      paymentMax: '',
      paymentType: '',
      status: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-clip-text text-transparent">
        Events
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Filter Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="card bg-base-100 p-6 rounded-lg shadow sticky top-4">
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            <div className="space-y-4">
              {/* Search Input */}
              <div className="form-control">
                <input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              {/* Genre Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Genres</span>
                </label>
                <div className="space-y-1">
                  {genreOptions.map((genre) => (
                    <label key={genre.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(filters.genres ?? []).includes(genre.id)}
                        onChange={() => {
                          const current = filters.genres ?? [];
                          const newGenres = current.includes(genre.id)
                            ? current.filter((id) => id !== genre.id)
                            : [...current, genre.id];
                          handleFilterChange('genres', newGenres);
                        }}
                        className="checkbox checkbox-sm"
                      />
                      <span>{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Location Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Location</span>
                </label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="Enter location"
                />
              </div>
              {/* Date Range */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">From Date</span>
                </label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              <div className="form-control">
                <label className="label">
                  <span className="label-text">To Date</span>
                </label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="input input-bordered w-full"
                />
              </div>
              {/* Payment Range */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Payment Range</span>
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={filters.paymentMin}
                    onChange={(e) => handleFilterChange('paymentMin', e.target.value)}
                    placeholder="Min"
                    className="input input-bordered w-1/2"
                  />
                  <input
                    type="number"
                    value={filters.paymentMax}
                    onChange={(e) => handleFilterChange('paymentMax', e.target.value)}
                    placeholder="Max"
                    className="input input-bordered w-1/2"
                  />
                </div>
              </div>
              {/* Payment Type */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Payment Type</span>
                </label>
                <select
                  value={filters.paymentType}
                  onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">All</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              {/* Status */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Status</span>
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="select select-bordered w-full"
                >
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <button onClick={handleResetFilters} className="btn btn-outline btn-sm w-full mt-2">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        {/* Events Grid with Pagination */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          ) : events.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-12 w-12" />}
              title="No events found"
              description="Try adjusting your filters or check back later for new events."
            />
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          )}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </div>
  );
}
