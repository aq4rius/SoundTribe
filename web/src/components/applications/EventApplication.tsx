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
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [userApplication, setUserApplication] = useState<any | null>(null);
  const [artistProfile, setArtistProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // TODO: Replace with TanStack Query and real API calls
    setIsLoading(false);
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
              // TODO: Refetch user applications
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
              // TODO: Refetch applications for event
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventApplication;
