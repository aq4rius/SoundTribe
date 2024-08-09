import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, updateUserProfile } from '../../services/user';
import { useAuth } from '../../contexts/AuthContext';

const EditProfile: React.FC = () => {
  const [userInfo, setUserInfo] = useState({
    username: '',
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
    favoriteGenres: [],
    preferredContentTypes: [],
  });
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await getUserProfile();
        setUserInfo(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
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
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-semibold text-gray-900 mt-10" >Edit Profile</h1>
      <p>Update your profile information below:</p>
      <br/>
      <label className="text-1xl font-semibold text-gray-900 mt-10" htmlFor="username">Username:<br/></label>
      <input
        type="text"
        placeholder="Username"
        value={userInfo.username}
        onChange={(e) => setUserInfo({ ...userInfo, username: e.target.value })}
      /><br/>
      <label className="text-1xl font-semibold text-gray-900 mt-10" htmlFor="firstName">First Name:<br/></label>
      <input
        type="text"
        placeholder="First Name"
        value={userInfo.firstName}
        onChange={(e) => setUserInfo({ ...userInfo, firstName: e.target.value })}
      /><br/>
      <label className="text-1xl font-semibold text-gray-900 mt-10" htmlFor="lastName">Last Name:<br/></label>
      <input
        type="text"
        placeholder="Last Name"
        value={userInfo.lastName}
        onChange={(e) => setUserInfo({ ...userInfo, lastName: e.target.value })}
      /><br/>
      <label className="text-1xl font-semibold text-gray-900 mt-10" htmlFor="location">Location:<br/></label>
      <input
        type="text"
        placeholder="Location"
        value={userInfo.location}
        onChange={(e) => setUserInfo({ ...userInfo, location: e.target.value })}
      /><br/>
      <label className="text-1xl font-semibold text-gray-900 mt-10"  htmlFor="bio">Bio:<br/></label>
      <textarea
        placeholder="Bio"
        value={userInfo.bio}
        onChange={(e) => setUserInfo({ ...userInfo, bio: e.target.value })}
      /><br/>
      {/* Add more fields for favoriteGenres and preferredContentTypes */}
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default EditProfile;