// client/src/components/profile/EditProfile.tsx

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, deleteUserProfile } from "../../services/user";
import { useAuth } from "../../contexts/AuthContext";
import ErrorAlert from '../common/ErrorAlert';

const EditProfile: React.FC = () => {
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
		isVisible: boolean;
	} | null>(null);

	const [userInfo, setUserInfo] = useState({
    username: "",
    firstName: "",
    lastName: "",
    location: "",
    bio: "",
    favoriteGenres: [] as string[],
    preferredContentTypes: [] as string[],
    notificationPreferences: {
      email: true,
      push: true
    },
    privacySettings: {
      showEmail: false,
      showLocation: true
    }
  });

	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const navigate = useNavigate();
	const { login, logout } = useAuth();

	useEffect(() => {
		const fetchUserProfile = async () => {
			try {
				const profile = await getUserProfile();
				setUserInfo(profile);
			} catch (error) {
				setNotification({
					type: "error",
					message: "Failed to fetch profile",
					isVisible: true,
				});
			}
		};
		fetchUserProfile();
	}, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		// Validation
		if (!userInfo.username.trim()) {
			setError('Username is required.');
			return;
		}
		if (!userInfo.firstName.trim()) {
			setError('First name is required.');
			return;
		}
		if (!userInfo.lastName.trim()) {
			setError('Last name is required.');
			return;
		}
		setIsLoading(true);
		try {
			const updatedUser = await updateUserProfile(userInfo);
			if (updatedUser) {
				login(localStorage.getItem("token") || "", updatedUser);
				setNotification({
					type: "success",
					message: "Profile updated successfully!",
					isVisible: true,
				});
				setTimeout(() => navigate("/dashboard"), 1500);
			}
		} catch (error: any) {
			setNotification({
				type: "error",
				message: error.response?.data?.message || error.message || "Failed to update profile",
				isVisible: true,
			});
			setError(error.response?.data?.message || error.message || 'Failed to update profile');
		}
		setIsLoading(false);
	};

	const Notification = () => {
		if (!notification?.isVisible) return null;
		const baseStyles =
			"fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50";
		const typeStyles =
			notification.type === "success"
				? "bg-green-500 text-white"
				: "bg-red-500 text-white";
		return (
			<div className={`${baseStyles} ${typeStyles}`}>
				{notification.message}
			</div>
		);
	};

	const handleDeleteAccount = async () => {
		if (
			window.confirm(
				"Are you sure you want to delete your account? This action cannot be undone."
			)
		) {
			try {
				await deleteUserProfile();
				logout();
				navigate("/");
			} catch (error) {
				setNotification({
					type: "error",
					message: "Failed to delete account",
					isVisible: true,
				});
			}
		}
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
        <div>
          <label className="block text-sm font-medium mb-1">Notification Preferences</label>
          <div className="space-x-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={userInfo.notificationPreferences.email}
                onChange={(e) => setUserInfo({
                  ...userInfo,
                  notificationPreferences: {
                    ...userInfo.notificationPreferences,
                    email: e.target.checked
                  }
                })}
                className="mr-2"
              />
              Email Notifications
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={userInfo.notificationPreferences.push}
                onChange={(e) => setUserInfo({
                  ...userInfo,
                  notificationPreferences: {
                    ...userInfo.notificationPreferences,
                    push: e.target.checked
                  }
                })}
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
                checked={userInfo.privacySettings.showEmail}
                onChange={(e) => setUserInfo({
                  ...userInfo,
                  privacySettings: {
                    ...userInfo.privacySettings,
                    showEmail: e.target.checked
                  }
                })}
                className="mr-2"
              />
              Show Email
            </label>
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={userInfo.privacySettings.showLocation}
                onChange={(e) => setUserInfo({
                  ...userInfo,
                  privacySettings: {
                    ...userInfo.privacySettings,
                    showLocation: e.target.checked
                  }
                })}
                className="mr-2"
              />
              Show Location
            </label>
          </div>
        </div>
        {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
        {isLoading && <div>Saving...</div>}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDeleteAccount}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Delete Account
          </button>
          <div className="space-x-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
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
        </div>
      </form>
    </div>
  );
};

export default EditProfile;
