'use client';

import { useState, useEffect } from 'react';
import { getMyEntitiesAction } from '@/actions/messages';
import type { SenderEntity } from './conversation-list';
import type { EntityType } from '@prisma/client';
import { Loader2, X } from 'lucide-react';

interface EntitySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (entity: {
    id: string;
    name: string;
    type: EntityType;
    image: string | null;
  }) => void;
  /** Type of entities to show. If omitted, shows all. */
  filterType?: EntityType;
  /** Title for the modal */
  title?: string;
}

/**
 * Modal/drawer for selecting which entity to message.
 * Used when starting a new conversation — shows available
 * ArtistProfiles and EventPostings the user doesn't own.
 */
export default function EntitySelector({
  isOpen,
  onClose,
  onSelect,
  filterType,
  title = 'Start a new conversation',
}: EntitySelectorProps) {
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState<SenderEntity[]>([]);
  const [events, setEvents] = useState<SenderEntity[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    async function load() {
      setLoading(true);
      // For now, load the user's own entities. In a future iteration,
      // this could search all entities to message someone new.
      const result = await getMyEntitiesAction();
      if (result.success) {
        setArtists(result.data.artistProfiles);
        setEvents(result.data.eventPostings);
      }
      setLoading(false);
    }
    load();
  }, [isOpen]);

  if (!isOpen) return null;

  const showArtists = !filterType || filterType === 'artist_profile';
  const showEvents = !filterType || filterType === 'event_posting';

  const filteredArtists = showArtists
    ? artists.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    : [];
  const filteredEvents = showEvents
    ? events.filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-x-4 top-[20%] max-w-md mx-auto bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 max-h-[60vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-semibold text-sm">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-white/10">
          <input
            type="text"
            placeholder="Search entities..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
        </div>

        {/* Entity list */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center h-24">
              <Loader2 className="h-5 w-5 animate-spin text-white/30" />
            </div>
          ) : (
            <>
              {filteredArtists.length === 0 && filteredEvents.length === 0 && (
                <div className="text-center text-sm text-white/40 py-8">
                  No entities found. Create a profile or event first.
                </div>
              )}

              {filteredArtists.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider">
                    Artist Profiles
                  </div>
                  {filteredArtists.map((artist) => (
                    <button
                      key={artist.id}
                      onClick={() => onSelect(artist)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                        {artist.image ? (
                          <img src={artist.image} alt="" className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          '🎤'
                        )}
                      </div>
                      <span className="text-sm">{artist.name}</span>
                    </button>
                  ))}
                </>
              )}

              {filteredEvents.length > 0 && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-white/40 uppercase tracking-wider mt-2">
                    Event Postings
                  </div>
                  {filteredEvents.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => onSelect(event)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
                        📅
                      </div>
                      <span className="text-sm">{event.name}</span>
                    </button>
                  ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
