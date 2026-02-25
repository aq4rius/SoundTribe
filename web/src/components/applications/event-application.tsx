// EventApplication — handles apply, view own application, and owner's application list
'use client';

import { useState, useEffect } from 'react';
import ApplicationForm from './application-form';
import ApplicationsList from './applications-list';
import ErrorAlert from '../common/error-alert';
import { useSession } from 'next-auth/react';
import { getMyArtistProfileAction } from '@/actions/artist-profiles';
import {
  getApplicationsForEventAction,
  getMyApplicationsAction,
} from '@/actions/applications';

interface EventApplicationProps {
  eventId: string;
  organizerId: string;
  status: string;
}

const EventApplication: React.FC<EventApplicationProps> = ({ eventId, organizerId, status }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applications, setApplications] = useState<
    { id: string; status: string; coverLetter: string; proposedRate: number | null; createdAt: Date; artistProfile: { id: string; stageName: string } }[]
  >([]);
  const [userApplication, setUserApplication] = useState<{
    id: string;
    status: string;
    coverLetter: string;
    proposedRate: number | null;
    createdAt: Date;
  } | null>(null);
  const [hasArtistProfile, setHasArtistProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const isEventOwner = user?.id === organizerId;

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    async function fetchData() {
      try {
        const profileResult = await getMyArtistProfileAction();
        const hasProfile = profileResult.success && !!profileResult.data;
        setHasArtistProfile(hasProfile);

        if (isEventOwner) {
          const appsResult = await getApplicationsForEventAction(eventId);
          if (appsResult.success) {
            setApplications(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              appsResult.data.map((a: any) => ({
                id: a.id,
                status: a.status,
                coverLetter: a.coverLetter,
                proposedRate: a.proposedRate,
                createdAt: a.createdAt,
                artistProfile: a.artistProfile,
                applicant: a.applicant,
              })),
            );
          }
        } else {
          const myAppsResult = await getMyApplicationsAction();
          if (myAppsResult.success) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const myApp = myAppsResult.data.find(
              (a: any) => a.eventPosting?.id === eventId || a.eventPostingId === eventId,
            );
            if (myApp) {
              setUserApplication({
                id: myApp.id,
                status: myApp.status,
                coverLetter: myApp.coverLetter,
                proposedRate: myApp.proposedRate,
                createdAt: myApp.createdAt,
              });
            }
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading applications');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [user, eventId, isEventOwner, refreshKey]);

  const canApply = status === 'open' && !isEventOwner && !userApplication && hasArtistProfile;

  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorAlert message={error} />;

  return (
    <div className="mt-8 space-y-6">
      {!hasArtistProfile && !isEventOwner && user && (
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
      {showApplicationForm && (
        <div className="mt-6 bg-base-100 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold text-primary mb-2">Submit Application</h2>
          <ApplicationForm
            eventId={eventId}
            onSuccess={() => {
              setShowApplicationForm(false);
              setRefreshKey((k) => k + 1);
            }}
            onCancel={() => setShowApplicationForm(false)}
          />
        </div>
      )}
      {userApplication && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Application</h2>
          <div className="bg-base-100 rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-base-content">
                  Submitted on {new Date(userApplication.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div
                className={`px-3 py-1 rounded-full text-sm ${
                  userApplication.status === 'pending'
                    ? 'bg-warning text-warning-content'
                    : userApplication.status === 'accepted'
                      ? 'bg-success text-success-content'
                      : 'bg-error text-error-content'
                }`}
              >
                {userApplication.status.charAt(0).toUpperCase() + userApplication.status.slice(1)}
              </div>
            </div>
            <p className="mt-4 text-base-content">{userApplication.coverLetter}</p>
            {userApplication.proposedRate != null && (
              <p className="mt-2 text-sm text-base-content">
                Proposed Rate: ${userApplication.proposedRate}
              </p>
            )}
          </div>
        </div>
      )}
      {isEventOwner && applications.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Applications ({applications.length})</h2>
          <ApplicationsList
            applications={applications}
            isEventOwner={true}
            onStatusUpdate={() => setRefreshKey((k) => k + 1)}
          />
        </div>
      )}
    </div>
  );
};

export default EventApplication;
