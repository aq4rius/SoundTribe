'use client';

import { useAuth } from '@/hooks/useAuth';
import ProfileSetup from '@/components/profile/ProfileSetup';
import CreateArtistProfile from '@/components/profile/CreateArtistProfile';
import ArtistCard from '@/components/artists/ArtistCard';
import EventCard from '@/components/events/EventCard';
import ApplicationsList from '@/components/applications/ApplicationsList';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, token, setAuth } = useAuth();
  const router = useRouter();
  const [artistProfiles, setArtistProfiles] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [artistRes, eventRes, appRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/my`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/event-postings/user`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/my-applications`,
            { headers: { Authorization: `Bearer ${token}` } },
          ),
        ]);
        if (!artistRes.ok || !eventRes.ok || !appRes.ok)
          throw new Error('Failed to load dashboard data');
        setArtistProfiles(await artistRes.json());
        setEvents(await eventRes.json());
        setApplications(await appRes.json());
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [user, token]);

  // Profile completion logic
  if (user && user.profileCompleted === false) {
    return <ProfileSetup />;
  }

  if (isLoading) return <div className="text-center text-white/80 py-12">Loading dashboard...</div>;
  if (error) return <div className="text-center text-red-400 py-12">{error}</div>;

  if (!user) return <div className="text-center text-red-400 py-12">User not found.</div>;

  // Delete handlers (artist profile/event)
  const handleDeleteProfile = async (profileId: string) => {
    if (!window.confirm('Are you sure you want to delete this artist profile?')) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/${profileId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Error deleting artist profile');
      setArtistProfiles((profiles) => profiles.filter((p) => p._id !== profileId));
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting artist profile');
    }
  };
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/event-postings/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Error deleting event');
      setEvents((evts) => evts.filter((e) => e._id !== eventId));
    } catch (err: any) {
      setDeleteError(err.message || 'Error deleting event');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-3 px-2 md:px-8">
      <h1 className="text-3xl font-bold mb-6 text-white">Dashboard</h1>
      {/* Basic User Info Section */}
      <div className="card bg-black/80 shadow-lg mb-8 border border-white/30">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
            <h2 className="card-title text-white">Basic Information</h2>
            <button
              className="btn btn-outline btn-primary btn-sm"
              onClick={() => router.push('/dashboard/edit-profile')}
            >
              Edit Profile
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold text-black/80">Username:</p>
              <p className="text-black/90">{user.username}</p>
            </div>
            <div>
              <p className="font-semibold text-black/80">Email:</p>
              <p className="text-black/90">{user.email}</p>
            </div>
            <div>
              <p className="font-semibold text-black/80">First Name:</p>
              <p className="text-black/90">{user.firstName || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold text-black/80">Last Name:</p>
              <p className="text-black/90">{user.lastName || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold text-black/80">Location:</p>
              <p className="text-black/90">{user.location || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold text-black/80">Bio:</p>
              <p className="text-black/90">{user.bio || 'No bio provided'}</p>
            </div>
          </div>
        </div>
      </div>
      {/* Events Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2 border-b border-cyan-900 pb-1">
          <h2 className="text-xl font-semibold text-white">Events</h2>
          <button
            onClick={() => router.push('/events/create')}
            className="btn btn-success btn-sm"
            aria-label="Create New Event"
          >
            Create New Event
          </button>
        </div>
        {deleteError && events.length > 0 && (
          <div className="text-center text-red-400 py-2">{deleteError}</div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {events.length === 0 ? (
            <div className="col-span-full text-center text-white/60 py-4">
              No events found. Create your first event!
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event._id}
                className="hover:shadow-2xl transition-shadow rounded-xl bg-black/80 border border-cyan-900"
              >
                <div onClick={() => router.push(`/events/${event._id}`)} className="cursor-pointer">
                  <EventCard event={event} mode="full" />
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => router.push(`/events/edit/${event._id}`)}
                    className="btn btn-outline btn-primary btn-xs"
                    aria-label={`Edit event ${event.title}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event._id)}
                    className="btn btn-outline btn-error btn-xs"
                    aria-label={`Delete event ${event.title}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Artist Profiles Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-white">Artist Profiles</h2>
          <button
            onClick={() => router.push('/artists/create')}
            className="btn btn-success btn-sm"
            aria-label="Create New Artist Profile"
          >
            Create New Artist Profile
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {artistProfiles.length === 0 ? (
            <div className="col-span-full text-center text-white/60 py-4">
              No artist profiles found.
            </div>
          ) : (
            artistProfiles.map((profile) => (
              <div
                key={profile._id}
                className="hover:shadow-2xl transition-shadow rounded-xl bg-black/80 border border-fuchsia-900"
              >
                <div
                  onClick={() => router.push(`/artists/${profile._id}`)}
                  className="cursor-pointer"
                >
                  <ArtistCard artist={profile} mode="full" />
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => router.push(`/artists/edit/${profile._id}`)}
                    className="btn btn-outline btn-primary btn-xs"
                    aria-label={`Edit artist profile ${profile.name}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProfile(profile._id)}
                    className="btn btn-outline btn-error btn-xs"
                    aria-label={`Delete artist profile ${profile.name}`}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      {/* Applications Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white">My Applications</h2>
        <ApplicationsList applications={applications} />
      </div>
      {deleteError && <div className="text-center text-red-400 py-2">{deleteError}</div>}
    </div>
  );
}
