import React, { useState, useEffect, useMemo, useRef } from "react";
import debounce from "lodash/debounce";
import { searchEventPostings } from "../services/event";
import { getAllGenres } from "../services/genre";
import { Event, Genre } from "../types";
import EventCard from "../components/events/EventCard";
import Pagination from "../components/common/Pagination";

const ITEMS_PER_PAGE = 9;

const AllEvents: React.FC = () => {
	const [events, setEvents] = useState<Event[]>([]);
	const [genres, setGenres] = useState<Genre[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [currentPage, setCurrentPage] = useState(1);
	const [totalItems, setTotalItems] = useState(0);
	const abortControllerRef = useRef<AbortController | null>(null);

	const [filters, setFilters] = useState({
		searchTerm: "",
		selectedGenres: [] as string[],
		instruments: [] as string[],
		location: "",
		dateFrom: "",
		dateTo: "",
		paymentMin: 0,
		paymentMax: 1000,
		paymentType: "" as "" | "fixed" | "hourly",
		status: "open",
	});

	useEffect(() => {
		const fetchGenres = async () => {
			try {
				const genresData = await getAllGenres();
				setGenres(genresData);
			} catch (error) {
				console.error(
					"Failed to fetch genres:",
					error instanceof Error ? error.message : "Unknown error"
				);
			}
		};
		fetchGenres();
	}, []);

	const fetchEvents = useMemo(
		() =>
			debounce(async (currentFilters, page) => {
				if (abortControllerRef.current) {
					abortControllerRef.current.abort();
				}

				abortControllerRef.current = new AbortController();

				setIsLoading(true);
				try {
					const eventsResponse = await searchEventPostings(
						{
							...currentFilters,
							page,
							limit: ITEMS_PER_PAGE,
						},
						abortControllerRef.current.signal
					);

					setEvents(eventsResponse.data || []);
					setTotalItems(eventsResponse.total || 0);
				} catch (error) {
					if (error instanceof Error && error.name !== "AbortError") {
						setError("Failed to load events");
					}
				} finally {
					setIsLoading(false);
				}
			}, 300),
		[]
	);

	useEffect(() => {
		fetchEvents(filters, currentPage);

		return () => {
			fetchEvents.cancel();
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, [filters, currentPage, fetchEvents]);

	const handleFilterChange = (key: string, value: any) => {
		setFilters((prev) => ({
			...prev,
			[key]: value,
		}));
		setCurrentPage(1);
	};

	const handlePageChange = (page: number) => {
		setCurrentPage(page);
	};

	if (isLoading) return <div>Loading...</div>;
	if (error) return <div className="text-red-500">{error}</div>;

	const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

	return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-8">Available Events</h1>
          
          <div className="flex flex-col md:flex-row gap-6">
            {/* Filters Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
              <div className="bg-white p-6 rounded-lg shadow sticky top-4">
                <h2 className="text-lg font-semibold mb-4">Filters</h2>
                
                <div className="space-y-4">
                  {/* Search input */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Search</label>
                    <input
                      type="text"
                      value={filters.searchTerm}
                      onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                      placeholder="Search events..."
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
      
                  {/* Location filter */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Location</label>
                    <input
                      type="text"
                      value={filters.location}
                      onChange={(e) => handleFilterChange('location', e.target.value)}
                      placeholder="Enter location"
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
      
                  {/* Date range */}
                  <div>
                    <label className="block text-sm font-medium mb-1">From Date</label>
                    <input
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">To Date</label>
                    <input
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    />
                  </div>
      
                  {/* Payment range */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Range</label>
                    <div className="flex space-x-2">
                      <input
                        type="number"
                        value={filters.paymentMin}
                        onChange={(e) => handleFilterChange('paymentMin', Number(e.target.value))}
                        placeholder="Min"
                        className="w-1/2 px-3 py-2 border rounded"
                      />
                      <input
                        type="number"
                        value={filters.paymentMax}
                        onChange={(e) => handleFilterChange('paymentMax', Number(e.target.value))}
                        placeholder="Max"
                        className="w-1/2 px-3 py-2 border rounded"
                      />
                    </div>
                  </div>
      
                  {/* Payment type */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Payment Type</label>
                    <select
                      value={filters.paymentType}
                      onChange={(e) => handleFilterChange('paymentType', e.target.value)}
                      className="w-full px-3 py-2 border rounded"
                    >
                      <option value="">All</option>
                      <option value="fixed">Fixed</option>
                      <option value="hourly">Hourly</option>
                    </select>
                  </div>
      
                  {/* Genres */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Genres</label>
                    <div className="space-y-1">
                      {genres.map(genre => (
                        <label key={genre._id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.selectedGenres.includes(genre._id)}
                            onChange={() => {
                              const newGenres = filters.selectedGenres.includes(genre._id)
                                ? filters.selectedGenres.filter(id => id !== genre._id)
                                : [...filters.selectedGenres, genre._id];
                              handleFilterChange('selectedGenres', newGenres);
                            }}
                            className="mr-2"
                          />
                          <span>{genre.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
      
                  {/* Reset filters button */}
                  <button
                    onClick={() => setFilters({
                      searchTerm: '',
                      selectedGenres: [],
                      instruments: [],
                      location: '',
                      dateFrom: '',
                      dateTo: '',
                      paymentMin: 0,
                      paymentMax: 1000,
                      paymentType: '',
                      status: 'open'
                    })}
                    className="w-full px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Reset Filters
                  </button>
                </div>
              </div>
            </div>
      
            {/* Events Grid */}
            <div className="flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    mode="compact"
                  />
                ))}
              </div>
      
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      );
};

export default AllEvents;
