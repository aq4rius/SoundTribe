'use client';
import { useEffect, useState, useCallback } from 'react';
import { getArtistProfilesAction } from '@/actions/artist-profiles';
import { getGenres } from '@/actions/genres';
import ArtistCard from '@/components/artists/artist-card';
import Pagination from '@/components/common/pagination';
import { EmptyState } from '@/components/shared/empty-state';
import { ArtistCardSkeleton } from '@/components/shared/skeletons';
import { Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

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
  id: string;
  name: string;
}

type ArtistResult = {
  id: string;
  stageName: string;
  location: string | null;
  profileImage: string | null;
  instruments: string[];
  ratePerHour: number | null;
  genres: { id: string; name: string }[];
};

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
  const [artists, setArtists] = useState<ArtistResult[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArtists = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getArtistProfilesAction({
        search: filters.search || undefined,
        genres: filters.genres.length > 0 ? filters.genres : undefined,
        location: filters.location || undefined,
        instruments: filters.instruments
          ? filters.instruments.split(',').map((i) => i.trim()).filter(Boolean)
          : undefined,
        page: currentPage,
        limit: 9,
      });
      if (result.success) {
        setArtists(result.data.profiles as ArtistResult[]);
        setTotalPages(result.data.totalPages);
      }
    } finally {
      setIsLoading(false);
    }
  }, [filters, currentPage]);

  useEffect(() => {
    // Load genres and initial artists in parallel on mount
    const loadInitial = async () => {
      const [genresResult] = await Promise.all([
        getGenres().catch(() => [] as Genre[]),
        fetchArtists(),
      ]);
      setGenreOptions(genresResult);
    };
    loadInitial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchArtists();
  }, [fetchArtists]);

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
          <Card className="sticky top-24">
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              {/* Search Input */}
              <div className="space-y-1">
                <Input
                  type="text"
                  placeholder="Search artists..."
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
                        checked={filters.genres.includes(genre.id)}
                        onChange={() => {
                          const newGenres = filters.genres.includes(genre.id)
                            ? filters.genres.filter((id) => id !== genre.id)
                            : [...filters.genres, genre.id];
                          handleFilterChange('genres', newGenres);
                        }}
                        className="accent-primary h-4 w-4"
                      />
                      <span>{genre.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Experience Range */}
              <div className="space-y-1">
                <Label>Minimum Experience (years)</Label>
                <Input
                  type="number"
                  value={filters.experienceMin}
                  onChange={(e) => handleFilterChange('experienceMin', e.target.value)}
                  min="0"
                />
              </div>
              {/* Rate Range */}
              <div className="space-y-1">
                <Label>Hourly Rate Range ($)</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={filters.rateMin}
                    onChange={(e) => handleFilterChange('rateMin', e.target.value)}
                    min="0"
                    placeholder="Min"
                  />
                  <Input
                    type="number"
                    value={filters.rateMax}
                    onChange={(e) => handleFilterChange('rateMax', e.target.value)}
                    min="0"
                    placeholder="Max"
                  />
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
              {/* Instruments Filter */}
              <div className="space-y-1">
                <Label>Instruments</Label>
                <Input
                  type="text"
                  value={filters.instruments}
                  onChange={(e) => handleFilterChange('instruments', e.target.value)}
                  placeholder="e.g. guitar, drums"
                />
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleResetFilters}>
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        </div>
        {/* Artists Grid with Pagination */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 9 }).map((_, i) => (
                <ArtistCardSkeleton key={i} />
              ))}
            </div>
          ) : artists.length === 0 ? (
            <EmptyState
              icon={<Users className="h-12 w-12" />}
              title="No artists found"
              description="Try adjusting your filters or check back later for new artists."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
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
