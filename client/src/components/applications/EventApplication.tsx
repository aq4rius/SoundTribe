// client/src/components/applications/EventApplication.tsx

import React, { useState, useEffect } from 'react';
import { Event, Application, ArtistProfile } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { getUserApplications, getApplicationsForEvent } from '../../services/application';
import { getUserArtistProfiles } from '../../services/artistProfile';
import ApplicationForm from './ApplicationForm';
import ApplicationsList from './ApplicationsList';
import ErrorAlert from '../common/ErrorAlert';

interface EventApplicationProps {
  event: Event;
}

const EventApplication: React.FC<EventApplicationProps> = ({ event }) => {
  const { user } = useAuth();
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const [userApplication, setUserApplication] = useState<Application | null>(null);
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [applicationsData, userApplicationsData, artistProfilesData] = await Promise.all([
          user?.email === event.postedBy.email ? getApplicationsForEvent(event._id) : [],
          getUserApplications(),
          getUserArtistProfiles()
        ]);

        setApplications(applicationsData);
        const userApp = userApplicationsData.find((app: Application) => app.eventPosting._id === event._id);
        setUserApplication(userApp || null);
        
        // Get the first artist profile (assuming one profile per user for now)
        if (artistProfilesData.length > 0) {
          setArtistProfile(artistProfilesData[0]);
        }
      } catch (error: any) {
        setError(error.response?.data?.message || error.message || 'Error fetching data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [event._id, user, event.postedBy.email]);

  const isEventOwner = user?.email === event.postedBy.email;
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
              getUserApplications().then(apps => {
                const userApp = apps.find((app: Application) => app.eventPosting._id === event._id);
                setUserApplication(userApp || null);
              });
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
              getApplicationsForEvent(event._id).then(setApplications);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default EventApplication;
