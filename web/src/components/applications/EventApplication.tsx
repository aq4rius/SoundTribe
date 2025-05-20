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
        // Fetch applications for this event
        const appRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/applications/event/${event._id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!appRes.ok) throw new Error('Failed to fetch applications');
        const allApplications = await appRes.json();
        setApplications(Array.isArray(allApplications) ? allApplications : []);
        // Set userApplication if exists
        if (user && Array.isArray(allApplications)) {
          const found = allApplications.find((a: any) => a.applicant?._id === user.id);
          setUserApplication(found || null);
        }
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message || 'Error fetching artist profile or applications');
        setIsLoading(false);
      }
    }
    if (user) fetchData();
    else setIsLoading(false);
  }, [event._id, user, event.postedBy?.email]);

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
              // Refetch user applications and all applications for event
              // (re-run the effect by updating a dummy state)
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 100); // quick re-fetch
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
              // Refetch applications for event after status update
              setIsLoading(true);
              setTimeout(() => setIsLoading(false), 100);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventApplication;
