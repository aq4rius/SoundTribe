'use client';

import { useSession } from 'next-auth/react';
import ArtistCard from '@/components/artists/artist-card';
import EventCard from '@/components/events/event-card';
import ApplicationsList from '@/components/applications/applications-list';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getMyArtistProfileAction, deleteArtistProfileAction } from '@/actions/artist-profiles';
import { getMyEventsAction, deleteEventAction } from '@/actions/events';
import { getMyApplicationsAction } from '@/actions/applications';
import { getOnboardingStateAction } from '@/actions/users';
import { EmptyState } from '@/components/shared/empty-state';
import { DashboardSkeleton } from '@/components/shared/skeletons';
import { Calendar, Music, FileText } from 'lucide-react';

interface DashboardEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  eventDate: string | Date;
  genres: { id: string; name: string }[];
  paymentType: string;
  paymentAmount: unknown;
  status: string;
  _count?: { applications: number };
}

interface DashboardArtistProfile {
  id: string;
  stageName: string;
  biography: string;
  location: string;
  instruments: string[];
  yearsOfExperience: number;
  genres: { id: string; name: string }[];
  user: { id: string; username: string; profileImage: string | null };
  profileImage?: string | null;
}

interface DashboardApplication {
  id: string;
  status: string;
  coverLetter: string;
  proposedRate: number | null;
  createdAt: Date;
  eventPosting: {
    id: string;
    title: string;
  };
  artistProfile: {
    id: string;
    stageName: string;
  };
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user as Record<string, unknown> | undefined;
  const router = useRouter();
  const [artistProfile, setArtistProfile] = useState<DashboardArtistProfile | null>(null);
  const [events, setEvents] = useState<DashboardEvent[]>([]);
  const [applications, setApplications] = useState<DashboardApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [onboardingLoading, setOnboardingLoading] = useState(true);

  // Check onboarding
  useEffect(() => {
    async function checkOnboarding() {
      const result = await getOnboardingStateAction();
      if (result.success && result.data.onboardingComplete === false) {
        router.push('/onboarding');
        return;
      }
      setOnboardingLoading(false);
    }
    if (user) checkOnboarding();
    else setOnboardingLoading(false);
  }, [user, router]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [profileResult, eventsResult, appsResult] = await Promise.all([
        getMyArtistProfileAction(),
        getMyEventsAction(),
        getMyApplicationsAction(),
      ]);

      if (profileResult.success) {
        setArtistProfile(profileResult.data as DashboardArtistProfile | null);
      }
      if (eventsResult.success) {
        setEvents(eventsResult.data as unknown as DashboardEvent[]);
      }
      if (appsResult.success) {
        setApplications(appsResult.data as unknown as DashboardApplication[]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && !onboardingLoading) fetchData();
  }, [user, onboardingLoading, fetchData]);

  if (onboardingLoading) {
    return <DashboardSkeleton />;
  }

  if (isLoading) return <DashboardSkeleton />;
  if (error) return <div className="text-center text-red-400 py-12">{error}</div>;

  if (!user) return <div className="text-center text-red-400 py-12">User not found.</div>;

  // Delete handlers
  const handleDeleteProfile = async () => {
    if (!artistProfile) return;
    if (!window.confirm('Are you sure you want to delete this artist profile?')) return;
    try {
      const result = await deleteArtistProfileAction(artistProfile.id);
      if (!result.success) throw new Error(result.error);
      setArtistProfile(null);
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error deleting artist profile');
    }
  };
  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      const result = await deleteEventAction(eventId);
      if (!result.success) throw new Error(result.error);
      setEvents((evts) => evts.filter((e) => e.id !== eventId));
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Error deleting event');
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
              onClick={() => router.push('/dashboard/account-settings')}
            >
              Account Settings
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="font-semibold ">Username:</p>
              <p className="">{user.username as string}</p>
            </div>
            <div>
              <p className="font-semibold ">Email:</p>
              <p className="">{user.email as string}</p>
            </div>
            <div>
              <p className="font-semibold ">First Name:</p>
              <p className="">{(user.firstName as string) || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold ">Last Name:</p>
              <p className="">{(user.lastName as string) || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold ">Bio:</p>
              <p className="">{(user.bio as string) || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold ">Roles:</p>
              <p className="">{(user.roles as string[])?.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold ">Location:</p>
              <p className="">
                {(user.locationDetails as Record<string, unknown>)?.city as string || (user.location as string) || 'Not specified'}
                {(user.locationDetails as Record<string, unknown>)?.region ? `, ${(user.locationDetails as Record<string, unknown>).region}` : ''}
              </p>
            </div>
            <div>
              <p className="font-semibold ">Willing to travel:</p>
              <p className="">
                {(user.locationDetails as Record<string, unknown>)?.willingToTravel
                  ? (user.locationDetails as Record<string, unknown>).willingToTravel + ' km'
                  : 'Not specified'}
              </p>
            </div>
            <div>
              <p className="font-semibold ">Genres:</p>
              <p className="">{((user.preferences as Record<string, unknown>)?.genres as string[])?.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold ">Instruments:</p>
              <p className="">{((user.preferences as Record<string, unknown>)?.instruments as string[])?.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold ">Influences:</p>
              <p className="">{((user.preferences as Record<string, unknown>)?.influences as string[])?.join(', ') || 'Not specified'}</p>
            </div>
            <div>
              <p className="font-semibold ">Goals:</p>
              <p className="">{((user.preferences as Record<string, unknown>)?.eventTypes as string[])?.join(', ') || 'Not specified'}</p>
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
            <div className="col-span-full">
              <EmptyState
                icon={<Calendar className="h-10 w-10" />}
                title="No events yet"
                description="Create your first event to start finding artists."
              />
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="hover:shadow-2xl transition-shadow rounded-xl bg-black/80 border border-cyan-900"
              >
                <div onClick={() => router.push(`/events/${event.id}`)} className="cursor-pointer">
                  <EventCard event={event} mode="full" />
                </div>
                <div className="flex gap-2 p-2">
                  <button
                    onClick={() => router.push(`/events/edit/${event.id}`)}
                    className="btn btn-outline btn-primary btn-xs"
                    aria-label={`Edit event ${event.title}`}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteEvent(event.id)}
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

      {/* Artist Profile Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-white">Artist Profile</h2>
          {!artistProfile && (
            <button
              onClick={() => router.push('/artists/create')}
              className="btn btn-success btn-sm"
              aria-label="Create Artist Profile"
            >
              Create Artist Profile
            </button>
          )}
        </div>
        {artistProfile ? (
          <div className="hover:shadow-2xl transition-shadow rounded-xl bg-black/80 border border-fuchsia-900">
            <div
              onClick={() => router.push(`/artists/${artistProfile.id}`)}
              className="cursor-pointer"
            >
              <ArtistCard artist={artistProfile} mode="full" />
            </div>
            <div className="flex gap-2 p-2">
              <button
                onClick={() => router.push(`/artists/edit/${artistProfile.id}`)}
                className="btn btn-outline btn-primary btn-xs"
                aria-label={`Edit artist profile ${artistProfile.stageName}`}
              >
                Edit
              </button>
              <button
                onClick={handleDeleteProfile}
                className="btn btn-outline btn-error btn-xs"
                aria-label={`Delete artist profile ${artistProfile.stageName}`}
              >
                Delete
              </button>
            </div>
          </div>
        ) : (
          <EmptyState
            icon={<Music className="h-10 w-10" />}
            title="No artist profile yet"
            description="Create a profile to showcase your talent and connect with events."
          />
        )}
      </div>
      {/* Applications Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2 text-white">My Applications</h2>
        {applications.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-10 w-10" />}
            title="No applications yet"
            description="Apply to events to start performing."
          />
        ) : (
          <ApplicationsList applications={applications} />
        )}
      </div>
      {deleteError && <div className="text-center text-red-400 py-2">{deleteError}</div>}
    </div>
  );
}
