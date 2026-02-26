'use client';

import { useSession } from 'next-auth/react';
import ArtistCard from '@/components/artists/artist-card';
import EventCard from '@/components/events/event-card';
import ApplicationsList from '@/components/applications/applications-list';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getMyArtistProfileAction, deleteArtistProfileAction } from '@/actions/artist-profiles';
import { getMyEventsAction, deleteEventAction } from '@/actions/events';
import { getMyApplicationsAction } from '@/actions/applications';
import { getOnboardingStateAction } from '@/actions/users';
import { EmptyState } from '@/components/shared/empty-state';
import { DashboardSkeleton } from '@/components/shared/skeletons';
import { Calendar, Music, FileText, User, Settings, Pencil, Trash2, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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

  if (!user) return <div className="text-center text-destructive py-12">User not found.</div>;

  const roles = (user.roles as string[]) || [];
  const username = (user.username as string) || (user.email as string) || 'User';
  const profileImage = user.profileImage as string | null;

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
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* ── Welcome Header ── */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Avatar className="h-16 w-16">
            {profileImage && <AvatarImage src={profileImage} alt={username} />}
            <AvatarFallback className="text-xl bg-fuchsia-600 text-white">
              {username[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Welcome back, {username}</h1>
            <div className="flex flex-wrap gap-2 mt-2">
              {roles.map((role) => (
                <Badge key={role} variant="secondary" className="capitalize">
                  {role}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/account-settings"><Settings className="h-4 w-4" /> Settings</Link>
          </Button>
        </div>

        {/* ── Quick Stats ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-fuchsia-600/10">
                  <Music className="h-5 w-5 text-fuchsia-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Artist Profile</p>
                  <p className="text-xl font-bold">{artistProfile ? 'Complete' : 'Not set up'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-600/10">
                  <Calendar className="h-5 w-5 text-cyan-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Events Created</p>
                  <p className="text-xl font-bold">{events.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-600/10">
                  <FileText className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-xl font-bold">{applications.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Quick Actions ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href="/events/create"><Calendar className="h-5 w-5" /><span className="text-xs">Create Event</span></Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href={artistProfile ? `/artists/edit/${artistProfile.id}` : '/artists/create'}>
              <Pencil className="h-5 w-5" /><span className="text-xs">{artistProfile ? 'Edit Profile' : 'Create Profile'}</span>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href="/artists"><User className="h-5 w-5" /><span className="text-xs">Browse Artists</span></Link>
          </Button>
          <Button variant="outline" className="h-auto py-4 flex-col gap-2" asChild>
            <Link href="/events"><Calendar className="h-5 w-5" /><span className="text-xs">Browse Events</span></Link>
          </Button>
        </div>

        {deleteError && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            {deleteError}
          </div>
        )}

        {/* ── Artist Profile Section ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Music className="h-5 w-5" /> Artist Profile</CardTitle>
              {!artistProfile && (
                <Button size="sm" asChild>
                  <Link href="/artists/create"><Plus className="h-4 w-4" /> Create Profile</Link>
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {artistProfile ? (
              <div className="space-y-4">
                <div className="cursor-pointer" onClick={() => router.push(`/artists/${artistProfile.id}`)}>
                  <ArtistCard artist={artistProfile} mode="full" />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => router.push(`/artists/edit/${artistProfile.id}`)}>
                    <Pencil className="h-3 w-3" /> Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDeleteProfile}>
                    <Trash2 className="h-3 w-3" /> Delete
                  </Button>
                </div>
              </div>
            ) : (
              <EmptyState
                icon={<Music className="h-10 w-10" />}
                title="No artist profile yet"
                description="Create a profile to showcase your talent and connect with events."
              />
            )}
          </CardContent>
        </Card>

        {/* ── Events Section ── */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5" /> My Events</CardTitle>
              <Button size="sm" asChild>
                <Link href="/events/create"><Plus className="h-4 w-4" /> Create Event</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {events.length === 0 ? (
              <EmptyState
                icon={<Calendar className="h-10 w-10" />}
                title="No events yet"
                description="Create your first event to start finding artists."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {events.map((event) => (
                  <Card key={event.id} className="overflow-hidden">
                    <div className="cursor-pointer" onClick={() => router.push(`/events/${event.id}`)}>
                      <EventCard event={event} mode="full" />
                    </div>
                    <div className="flex gap-2 px-4 pb-4">
                      <Button variant="outline" size="xs" onClick={() => router.push(`/events/edit/${event.id}`)}>
                        <Pencil className="h-3 w-3" /> Edit
                      </Button>
                      <Button variant="destructive" size="xs" onClick={() => handleDeleteEvent(event.id)}>
                        <Trash2 className="h-3 w-3" /> Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Applications Section ── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><FileText className="h-5 w-5" /> My Applications</CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-10 w-10" />}
                title="No applications yet"
                description="Apply to events to start performing."
              />
            ) : (
              <ApplicationsList applications={applications} />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
