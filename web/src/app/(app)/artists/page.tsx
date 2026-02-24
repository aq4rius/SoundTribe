'use client';
import { useEffect, useState } from 'react';
import { useArtists } from '@/hooks/use-artists';
import ArtistCard from '@/components/artists/artist-card';
import Pagination from '@/components/common/pagination';
import { getAllGenres } from '@/services/genre';
import type { IArtistProfile } from '@/types';

interface ArtistFilters {
  search: string;
  genres: string[];
  location: string;
  instruments: string;
  experienceMin: string;
  rateMin: string;
  rateMax: string;
}

interface Genre {
  _id: string;
  name: string;
}

export default function ArtistsPage() {
  const [filters, setFilters] = useState<ArtistFilters>({
    search: '',
    genres: [],
    location: '',
    instruments: '',
    experienceMin: '',
    rateMin: '',
    rateMax: '',
  });
  const [genreOptions, setGenreOptions] = useState<Genre[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const { data, isLoading } = useArtists(filters, currentPage, 9);
  const artists = data?.data || [];
  const totalPages = data?.totalPages || 1;

  useEffect(() => {
    async function fetchGenres() {
      try {
        const genres = await getAllGenres();
        setGenreOptions(genres);
      } catch (e) {
        setGenreOptions([]);
      }
    }
    fetchGenres();
  }, []);

  const handleFilterChange = (key: string, value: string | string[]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      search: '',
      genres: [],
      location: '',
      instruments: '',
      experienceMin: '',
      rateMin: '',
      rateMax: '',
    });
    setCurrentPage(1);
  };

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        Artists
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
                  placeholder="Search artists..."
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
                        checked={filters.genres.includes(genre._id)}
                        onChange={() => {
                          const newGenres = filters.genres.includes(genre._id)
                            ? filters.genres.filter((id) => id !== genre._id)
                            : [...filters.genres, genre._id];
                          handleFilterChange('genres', newGenres);
                        }}
                        className="checkbox checkbox-sm"
                      />
                      <span>{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Experience Range */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Minimum Experience (years)</span>
                </label>
                <input
                  type="number"
                  value={filters.experienceMin}
                  onChange={(e) => handleFilterChange('experienceMin', e.target.value)}
                  className="input input-bordered w-full"
                  min="0"
                />
              </div>
              {/* Rate Range */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Hourly Rate Range ($)</span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={filters.rateMin}
                    onChange={(e) => handleFilterChange('rateMin', e.target.value)}
                    className="input input-bordered w-1/2"
                    min="0"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.rateMax}
                    onChange={(e) => handleFilterChange('rateMax', e.target.value)}
                    className="input input-bordered w-1/2"
                    min="0"
                    placeholder="Max"
                  />
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
              {/* Instruments Filter */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Instruments</span>
                </label>
                <input
                  type="text"
                  value={filters.instruments}
                  onChange={(e) => handleFilterChange('instruments', e.target.value)}
                  className="input input-bordered w-full"
                  placeholder="e.g. guitar, drums"
                />
              </div>
              <button onClick={handleResetFilters} className="btn btn-outline btn-sm w-full mt-2">
                Reset Filters
              </button>
            </div>
          </div>
        </div>
        {/* Artists Grid with Pagination */}
        <div className="flex-1">
          {isLoading ? (
            <div className="text-center py-16 text-lg text-white/60 animate-pulse">
              Loading artists...
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist: IArtistProfile, i: number) => (
                <ArtistCard key={i} artist={artist} />
              ))}
            </div>
          )}
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>
    </div>
  );
}
