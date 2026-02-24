'use client';
import { useState, useEffect } from 'react';
import { searchEventPostings, getAllGenres } from '@/services/event';
import { useEvents } from '@/hooks/use-events';
import EventCard from '@/components/events/event-card';
import Pagination from '@/components/common/pagination';
import type { IGenre, IEventPosting, EventFilters } from '@/types';

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
  const [genreOptions, setGenreOptions] = useState<IGenre[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [events, setEvents] = useState<IEventPosting[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function fetchGenres() {
      try {
        const genres = await getAllGenres();
        setGenreOptions(genres);
      } catch {
        setGenreOptions([]);
      }
    }
    fetchGenres();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    searchEventPostings({
      searchTerm: filters.search,
      selectedGenres: filters.genres,
      location: filters.location,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo,
      paymentMin: filters.paymentMin,
      paymentMax: filters.paymentMax,
      paymentType: filters.paymentType,
      status: filters.status,
      page: currentPage,
      limit: 9,
    })
      .then((data) => {
        setEvents(data.data || []);
        setTotalPages(data.totalPages || 1);
      })
      .finally(() => setIsLoading(false));
  }, [filters, currentPage]);

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
                    <label key={genre._id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={(filters.genres ?? []).includes(genre._id)}
                        onChange={() => {
                          const current = filters.genres ?? [];
                          const newGenres = current.includes(genre._id)
                            ? current.filter((id) => id !== genre._id)
                            : [...current, genre._id];
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
            <div className="text-center py-16 text-lg text-white/60 animate-pulse">
              Loading events...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {events.map((event: IEventPosting, i: number) => (
                <EventCard key={i} event={event} />
              ))}
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}
