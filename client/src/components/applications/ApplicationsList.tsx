// client/src/components/applications/ApplicationsList.tsx

import React from 'react';
import { Application } from '../../types';
import { updateApplicationStatus } from '../../services/application';

interface ApplicationsListProps {
  applications: Application[];
  isEventOwner?: boolean;
  onStatusUpdate?: () => void;
}

const ApplicationsList: React.FC<ApplicationsListProps> = ({
  applications,
  isEventOwner = false,
  onStatusUpdate
}) => {
  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    try {
      await updateApplicationStatus(applicationId, status);
      onStatusUpdate?.();
    } catch (error) {
      console.error('Failed to update application status:', error);
    }
  };

  return (
    <div className="space-y-4">
      {applications.map((application) => (
        <div key={application._id} className="bg-base-100 rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-primary">{isEventOwner ? 'Applications' : 'My Application'}</h2>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold text-primary">
                {isEventOwner ? application.artistProfile.stageName : application.eventPosting.title}
              </h3>
              <p className="text-base-content">
                Submitted on {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              application.status === 'pending' ? 'bg-warning text-warning-content' :
              application.status === 'accepted' ? 'bg-success text-success-content' :
              'bg-error text-error-content'
            }`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-base-content">{application.coverLetter}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-base-content">
              Proposed Rate: ${application.proposedRate}
            </p>
          </div>

          {isEventOwner && application.status === 'pending' && (
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleStatusUpdate(application._id, 'accepted')}
                className="btn btn-success"
              >
                Accept
              </button>
              <button
                onClick={() => handleStatusUpdate(application._id, 'rejected')}
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
