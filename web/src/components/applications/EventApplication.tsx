// EventApplication migrated from client/src/components/applications/EventApplication.tsx
'use client';

import { useState, useEffect } from 'react';
import ApplicationForm from './ApplicationForm';
import ApplicationsList from './ApplicationsList';
import ErrorAlert from '../common/ErrorAlert';
import { useAuth } from '@/hooks/useAuth';

interface EventApplicationProps {
  event: any;
}

const EventApplication: React.FC<EventApplicationProps> = ({ event }) => {
  const { user, token } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [userApplication, setUserApplication] = useState<any | null>(null);
  const [artistProfile, setArtistProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    async function fetchData() {
      try {
        // Fetch user's artist profiles
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/artist-profiles/my`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error('Failed to fetch artist profiles');
        const profiles = await res.json();
        setArtistProfile(Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null);
        // Determine if user is event owner
        const isOwner = user && event.postedBy && (user.email === event.postedBy.email || user.id === event.postedBy._id);
        let allApplications: any[] = [];
        let userApp: any = null;
        if (isOwner) {
          // Fetch all applications for this event
          const appRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/event/${event._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!appRes.ok) throw new Error('Failed to fetch applications');
          allApplications = await appRes.json();
          setApplications(Array.isArray(allApplications) ? allApplications : []);
        } else if (user) {
          // Fetch only user's applications
          const myAppRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/my-applications`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (myAppRes.ok) {
            const myApps = await myAppRes.json();
            userApp = myApps.find((a: any) => a.eventPosting?._id === event._id);
            setUserApplication(userApp || null);
          }
        }
        if (isOwner) {
          setUserApplication(null); // Owners don't apply
        }
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error fetching artist profile or applications');
        setIsLoading(false);
      }
    }
    if (user) fetchData();
    else setIsLoading(false);
  }, [event._id, user, event.postedBy?.email, event.postedBy?._id, refreshKey]);

  // Placeholder logic for event owner and application status
  const isEventOwner = user && event.postedBy && user.email === event.postedBy.email;
  const canApply = event.status === 'open' && !isEventOwner && !userApplication && artistProfile;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="mt-8 space-y-6">
      {!artistProfile && !isEventOwner && (
        <div className="text-center p-4 bg-yellow-50 text-yellow-700 rounded">
          You need to create an artist profile before applying to events.
        </div>
      )}
      {canApply && (
        <button
          onClick={() => setShowApplicationForm(true)}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Apply for this Event
        </button>
      )}
      {showApplicationForm && artistProfile && (
        <div className="mt-6 bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-2">Submit Application</h2>
          <ApplicationForm
            event={event}
            artistProfile={artistProfile}
            onSuccess={() => {
              setShowApplicationForm(false);
              setRefreshKey((k) => k + 1); // force refetch
            }}
            onCancel={() => setShowApplicationForm(false)}
          />
        </div>
      )}
      {userApplication && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Application</h2>
          <ApplicationsList applications={[userApplication]} />
        </div>
      )}
      {isEventOwner && applications.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Applications ({applications.length})</h2>
          <ApplicationsList
            applications={applications}
            isEventOwner={true}
            onStatusUpdate={() => {
              setRefreshKey((k) => k + 1); // force refetch
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventApplication;
