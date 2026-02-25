// client/src/components/profile/ProfileSetup.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile } from '../../services/user';
import { useAuth } from '../../contexts/AuthContext';
import ErrorAlert from '../common/ErrorAlert';

const ProfileSetup: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [basicInfo, setBasicInfo] = useState({
    username: user?.username || '',
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
    favoriteGenres: [] as string[],
    preferredContentTypes: [] as string[],
    notificationPreferences: {
      email: true,
      push: true,
    },
    privacySettings: {
      showEmail: false,
      showLocation: true,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validation
    if (!basicInfo.username.trim()) {
      setError('Username is required.');
      return;
    }
    if (!basicInfo.firstName.trim()) {
      setError('First name is required.');
      return;
    }
    if (!basicInfo.lastName.trim()) {
      setError('Last name is required.');
      return;
    }
    setIsLoading(true);
    try {
      const updatedUser = await updateUserProfile(basicInfo);
      if (updatedUser) {
        login(localStorage.getItem('token') || '', updatedUser);
        if (updatedUser.basicProfileCompleted) {
          navigate('/dashboard');
        } else {
          setError('Please fill in all required fields for the basic profile.');
        }
      }
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Failed to update profile.');
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <h1 className="text-2xl font-semibold mb-6">Complete Your Profile</h1>
      <form onSubmit={handleBasicInfoSubmit} className="space-y-4">
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {isLoading && <div>Saving...</div>}
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={basicInfo.username}
            onChange={(e) => setBasicInfo({ ...basicInfo, username: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={basicInfo.firstName}
            onChange={(e) => setBasicInfo({ ...basicInfo, firstName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={basicInfo.lastName}
            onChange={(e) => setBasicInfo({ ...basicInfo, lastName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={basicInfo.location}
            onChange={(e) => setBasicInfo({ ...basicInfo, location: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={basicInfo.bio}
            onChange={(e) => setBasicInfo({ ...basicInfo, bio: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Notification Preferences</label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={basicInfo.notificationPreferences.email}
                onChange={(e) =>
                  setBasicInfo({
                    ...basicInfo,
                    notificationPreferences: {
                      ...basicInfo.notificationPreferences,
                      email: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              Email Notifications
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={basicInfo.notificationPreferences.push}
                onChange={(e) =>
                  setBasicInfo({
                    ...basicInfo,
                    notificationPreferences: {
                      ...basicInfo.notificationPreferences,
                      push: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              Push Notifications
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Privacy Settings</label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={basicInfo.privacySettings.showEmail}
                onChange={(e) =>
                  setBasicInfo({
                    ...basicInfo,
                    privacySettings: {
                      ...basicInfo.privacySettings,
                      showEmail: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              Show Email
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={basicInfo.privacySettings.showLocation}
                onChange={(e) =>
                  setBasicInfo({
                    ...basicInfo,
                    privacySettings: {
                      ...basicInfo.privacySettings,
                      showLocation: e.target.checked,
                    },
                  })
                }
                className="mr-2"
              />
              Show Location
            </label>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Complete Profile
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
