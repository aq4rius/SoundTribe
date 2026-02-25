// ApplicationsList — displays a list of applications with accept/reject controls
'use client';

import { useState } from 'react';
import ErrorAlert from '../common/error-alert';
import { updateApplicationStatusAction } from '@/actions/applications';

interface ApplicationItem {
  id: string;
  status: string;
  coverLetter: string;
  proposedRate: number | null;
  createdAt: Date;
  artistProfile?: { id: string; stageName: string };
}

interface ApplicationsListProps {
  applications: ApplicationItem[];
  isEventOwner?: boolean;
  onStatusUpdate?: () => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  isEventOwner = false,
  onStatusUpdate,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await updateApplicationStatusAction(applicationId, status);
      if (!result.success) {
        setError(result.error);
      } else {
        onStatusUpdate?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update application status');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {isLoading && <div>Updating...</div>}
      {applications.map((application) => (
        <div key={application.id} className="bg-base-100 rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {isEventOwner
                  ? application.artistProfile?.stageName ?? 'Unknown Artist'
                  : 'My Application'}
              </h3>
              <p className="text-base-content">
                Submitted on{' '}
                {application.createdAt
                  ? new Date(application.createdAt).toLocaleDateString()
                  : 'Unknown'}
              </p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm ${
                application.status === 'pending'
                  ? 'bg-warning text-warning-content'
                  : application.status === 'accepted'
                    ? 'bg-success text-success-content'
                    : 'bg-error text-error-content'
              }`}
            >
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </div>
          </div>
          <div className="mt-4">
            <p className="text-base-content">{application.coverLetter}</p>
          </div>
          <div className="mt-4">
            <p className="text-sm text-base-content">
              Proposed Rate: ${application.proposedRate ?? 'N/A'}
            </p>
          </div>
          {isEventOwner && application.status === 'pending' && (
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleStatusUpdate(application.id, 'accepted')}
                className="btn btn-success"
              >
                Accept
              </button>
              <button
                onClick={() => handleStatusUpdate(application.id, 'rejected')}
                className="btn btn-error"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ApplicationsList;
