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
        <div key={application._id} className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-semibold">
                {isEventOwner ? application.artistProfile.stageName : application.eventPosting.title}
              </h3>
              <p className="text-gray-600">
                Submitted on {new Date(application.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm ${
              application.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
              application.status === 'accepted' ? 'bg-green-100 text-green-800' :
              'bg-red-100 text-red-800'
            }`}>
              {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-700">{application.coverLetter}</p>
          </div>

          <div className="mt-4">
            <p className="text-sm text-gray-600">
              Proposed Rate: ${application.proposedRate}
            </p>
          </div>

          {isEventOwner && application.status === 'pending' && (
            <div className="mt-4 flex space-x-4">
              <button
                onClick={() => handleStatusUpdate(application._id, 'accepted')}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Accept
              </button>
              <button
                onClick={() => handleStatusUpdate(application._id, 'rejected')}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
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
