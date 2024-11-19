import React, { useState, useEffect, useMemo } from 'react';
import debounce from 'lodash/debounce';
import { searchArtistProfiles } from '../services/artistProfile';
import { getAllGenres } from '../services/genre';
import { ArtistProfile, Genre } from '../types';
import ArtistCard from '../components/artists/ArtistCard';
import Pagination from '../components/common/Pagination';

const ITEMS_PER_PAGE = 9;

const AllArtists: React.FC = () => {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [filters, setFilters] = useState({
    searchTerm: '',
    selectedGenres: [] as string[],
    instruments: [] as string[],
    experienceMin: 0,
    rateMin: 0,
    rateMax: 1000,
    location: '',
  });

  const debouncedFetch = useMemo(
    () =>
      debounce(async (currentFilters, page) => {
        setIsLoading(true);
        try {
          const [artistsResponse, genresData] = await Promise.all([
            searchArtistProfiles({ 
              ...currentFilters, 
              page: page, 
              limit: ITEMS_PER_PAGE 
            }),
            getAllGenres()
          ]);
          
          setArtists(artistsResponse.data || []);
          setTotalItems(artistsResponse.total || 0);
          setGenres(genresData || []);
        } catch (err) {
          setError('Failed to load data');
        } finally {
          setIsLoading(false);
        }
      }, 300),
    []
  );

  useEffect(() => {
    debouncedFetch(filters, currentPage);
    return () => {
      debouncedFetch.cancel();
    };
  }, [filters, currentPage, debouncedFetch]);


  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
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
      <div className="flex gap-6">
        {/* Filter Sidebar */}
        <div className="w-64 flex-shrink-0">
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            
            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search artists..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                className="w-full px-3 py-2 border rounded"
              />
            </div>

            {/* Genre Filter */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Genres</h4>
              {genres.map((genre) => (
                <label key={genre._id} className="flex items-center mb-2">
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
                  {genre.name}
                </label>
              ))}
            </div>

            {/* Experience Range */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Minimum Experience (years)</h4>
              <input
                type="number"
                value={filters.experienceMin}
                onChange={(e) => handleFilterChange('experienceMin', Number(e.target.value))}
                className="w-full px-3 py-2 border rounded"
                min="0"
              />
            </div>

            {/* Rate Range */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Hourly Rate Range ($)</h4>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.rateMin}
                  onChange={(e) => handleFilterChange('rateMin', Number(e.target.value))}
                  className="w-1/2 px-3 py-2 border rounded"
                  min="0"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={filters.rateMax}
                  onChange={(e) => handleFilterChange('rateMax', Number(e.target.value))}
                  className="w-1/2 px-3 py-2 border rounded"
                  min="0"
                  placeholder="Max"
                />
              </div>
            </div>

            {/* Location Filter */}
            <div className="mb-4">
              <h4 className="font-medium mb-2">Location</h4>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
                className="w-full px-3 py-2 border rounded"
                placeholder="Enter location"
              />
            </div>
          </div>
        </div>

        {/* Artists Grid with Pagination */}
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {artists.map(artist => (
              <ArtistCard key={artist._id} artist={artist} />
            ))}
          </div>
          
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default AllArtists;
