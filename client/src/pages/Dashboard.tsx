import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSetup from '../components/profile/ProfileSetup';
import EditProfile from '../components/profile/EditProfile';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user?.profileCompleted) {
    return <ProfileSetup />;
  }

  return (
    <div className="max-w-8xl mx-auto py-3 sm:px-10 lg:px-10">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      {user && (
        <div className="mt-4">
          <p className="text-lg">Welcome, {user.username}!</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <EditProfile />
          {!user.artistProfileCompleted && (
            <button
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
              onClick={() => navigate('/create-artist-profile')}
            >
              Create an Artist Profile
            </button>
          )}
          {user.artistProfileCompleted && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mt-10">Artist Profile</h2>
              {/* Display artist profile details here */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;