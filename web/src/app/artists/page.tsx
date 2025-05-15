'use client';
import { useState } from 'react';
import { useArtists } from '@/hooks/useArtists';
import ArtistCard from '@/components/artists/ArtistCard';
import Pagination from '@/components/common/Pagination';

export default function ArtistsPage() {
  const [filters, setFilters] = useState({ search: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const { data: artists = [], isLoading } = useArtists(filters);

  return (
    <div className="max-w-6xl mx-auto py-16 px-4">
      <h1 className="text-4xl font-extrabold mb-8 bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
        Artists
      </h1>
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <input
          type="text"
          placeholder="Search artists..."
          value={filters.search}
          onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
          className="px-4 py-2 rounded-lg bg-black/60 border border-white/10 text-white w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-fuchsia-500"
        />
        {/* Add more filters here */}
      </div>
      {isLoading ? (
        <div className="text-center py-16 text-lg text-white/60 animate-pulse">
          Loading artists...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist: any, i: number) => (
            <ArtistCard key={i} artist={artist} />
          ))}
        </div>
      )}
      <Pagination currentPage={currentPage} totalPages={3} onPageChange={setCurrentPage} />
    </div>
  );
}
