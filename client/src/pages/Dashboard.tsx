import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ProfileSetup from '../components/profile/ProfileSetup';
import EditProfile from '../components/profile/EditProfile';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  if (!user?.profileCompleted) {
    return <ProfileSetup />;
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
      {user && (
        <div className="mt-4">
          <p className="text-lg">Welcome, {user.username}!</p>
          <p>Email: {user.email}</p>
          <p>Role: {user.role}</p>
          <EditProfile/>
          {/* Add more user information here */}
        </div>
      )}
    </div>
  );
};

export default Dashboard;