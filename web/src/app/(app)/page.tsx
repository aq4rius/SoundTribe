import Link from 'next/link';
import HeroSection from '@/components/home/hero-section';
import ArtistCard from '@/components/artists/artist-card';
import EventCard from '@/components/events/event-card';
import { getArtistProfilesAction } from '@/actions/artist-profiles';
import { getEventsAction } from '@/actions/events';

export default async function Home() {
  const [artistsResult, eventsResult] = await Promise.all([
    getArtistProfilesAction({ page: 1, limit: 3 }),
    getEventsAction({ page: 1, limit: 3, status: 'open' }),
  ]);

  const featuredArtists = artistsResult.success ? artistsResult.data.profiles : [];
  const upcomingEvents = eventsResult.success ? eventsResult.data.data : [];

  return (
    <main className="relative w-full overflow-x-hidden bg-black text-white">

      {/* Section 1: Hero */}
      <HeroSection />

      {/* Section 2: Stats bar */}
      <section className="relative z-10 bg-white/5 border-y border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '500+', label: 'Artists' },
            { value: '200+', label: 'Events Posted' },
            { value: '50+', label: 'Cities' },
            { value: '1,000+', label: 'Connections Made' },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-3xl font-extrabold bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-white/60 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3: Featured Artists */}
      <section className="relative z-10 py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold">Featured Artists</h2>
              <p className="text-white/60 mt-1">Discover talented musicians near you</p>
            </div>
            <Link
              href="/artists"
              className="text-sm text-fuchsia-400 hover:text-fuchsia-300 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          {featuredArtists.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtists.map((artist) => (
                <ArtistCard key={artist.id} artist={artist} />
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-center py-12">
              No artists yet &mdash; be the first to join!
            </p>
          )}
        </div>
      </section>

      {/* Section 4: Upcoming Events */}
      <section className="relative z-10 py-20 px-4 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-extrabold">Upcoming Events</h2>
              <p className="text-white/60 mt-1">Find your next gig or collaboration</p>
            </div>
            <Link
              href="/events"
              className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              View all &rarr;
            </Link>
          </div>
          {upcomingEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-center py-12">
              No open events yet &mdash; check back soon!
            </p>
          )}
        </div>
      </section>

    </main>
  );
}
