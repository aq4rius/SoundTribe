import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../services/user';
import { useAuth } from '../../contexts/AuthContext';


const EditProfile: React.FC = () => {
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
    isVisible: boolean;
  } | null>(null);
  
  const [userInfo, setUserInfo] = useState({
    username: '',
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
    favoriteGenres: [] as string[],
    preferredContentTypes: [] as string[],
  });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserInfo(profile);
      } catch (error) {
        setNotification({
          type: 'error',
          message: 'Failed to fetch profile',
          isVisible: true
        });
      }
    };
    fetchUserProfile();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updatedUser = await updateUserProfile(userInfo);
      if (updatedUser) {
        login(localStorage.getItem('token') || '', updatedUser);
        setNotification({
          type: 'success',
          message: 'Profile updated successfully!',
          isVisible: true
        });
        setTimeout(() => navigate('/dashboard'), 1500);
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update profile',
        isVisible: true
      });
    }
  };

  const Notification = () => {
    if (!notification?.isVisible) return null;
    const baseStyles = "fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50";
    const typeStyles = notification.type === 'success' 
      ? "bg-green-500 text-white" 
      : "bg-red-500 text-white";
    return (
      <div className={`${baseStyles} ${typeStyles}`}>
        {notification.message}
      </div>
    );
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Notification />
      <h1 className="text-2xl font-semibold mb-6">Edit Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Username</label>
          <input
            type="text"
            value={userInfo.username}
            onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            value={userInfo.firstName}
            onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            value={userInfo.lastName}
            onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={userInfo.location}
            onChange={(e) => setUserInfo({ ...userInfo, location: e.target.value })}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea
            value={userInfo.bio}
            onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          />
        </div>
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
