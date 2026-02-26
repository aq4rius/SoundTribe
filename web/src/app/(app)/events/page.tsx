'use client';
import { useState, useEffect, useCallback } from 'react';
import { getEventsAction } from '@/actions/events';
import { getGenres } from '@/actions/genres';
import EventCard from '@/components/events/event-card';
import Pagination from '@/components/common/pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { EventCardSkeleton } from '@/components/shared/skeletons';
import { Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
          <Card className="sticky top-24">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              {/* Search Input */}
              <div className="space-y-1">
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              {/* Genre Filter */}
              <div className="space-y-1">
                <Label>Genres</Label>
                <div className="space-y-1">
                  {genreOptions.map((genre) => (
                    <label key={genre.id} className="flex items-center gap-2 text-sm">
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
                        className="accent-primary h-4 w-4"
                      />
                      <span>{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Location Filter */}
              <div className="space-y-1">
                <Label>Location</Label>
                <Input
                  type="text"
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  placeholder="Enter location"
                />
              </div>
              {/* Date Range */}
              <div className="space-y-1">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                />
              </div>
              {/* Payment Range */}
              <div className="space-y-1">
                <Label>Payment Range</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={filters.paymentMin}
                    onChange={(e) => handleFilterChange('paymentMin', e.target.value)}
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    value={filters.paymentMax}
                    onChange={(e) => handleFilterChange('paymentMax', e.target.value)}
                    placeholder="Max"
                  />
                </div>
              </div>
              {/* Payment Type */}
              <div className="space-y-1">
                <Label>Payment Type</Label>
                <select
                  value={filters.paymentType}
                  onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All</option>
                  <option value="fixed">Fixed</option>
                  <option value="hourly">Hourly</option>
                </select>
              </div>
              {/* Status */}
              <div className="space-y-1">
                <Label>Status</Label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">All</option>
                  <option value="open">Open</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
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
