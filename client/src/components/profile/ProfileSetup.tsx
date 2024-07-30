import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateUserProfile, createArtistProfile } from '../../services/user';
import { useAuth } from '../../contexts/AuthContext';

const ProfileSetup: React.FC = () => {
  const [step, setStep] = useState(1);
  const [basicInfo, setBasicInfo] = useState({
    firstName: '',
    lastName: '',
    location: '',
    bio: '',
    favoriteGenres: [],
    preferredContentTypes: []
  });
  const [isArtist, setIsArtist] = useState(false);
  const [artistInfo, setArtistInfo] = useState({
    stageName: '',
    genres: [],
    instruments: [],
    yearsOfExperience: 0,
    portfolioItems: [],
    availability: { isAvailable: true },
    ratePerHour: 0
  });
  const navigate = useNavigate();
  const { user, login } = useAuth();

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log('Updating profile with:', basicInfo);
      const updatedUser = await updateUserProfile(basicInfo);
      console.log('Updated user:', updatedUser);
      login(localStorage.getItem('token') || '', updatedUser);
      setStep(2);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleArtistInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isArtist) {
        await createArtistProfile(artistInfo);
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating artist profile:', error);
    }
  };

  const renderStep = () => {
    switch(step) {
      case 1:
        return (
          <form onSubmit={handleBasicInfoSubmit}>
            {/* Add form fields for basic info */}
            <input
              type="text"
              placeholder="First Name"
              value={basicInfo.firstName}
              onChange={(e) => setBasicInfo({...basicInfo, firstName: e.target.value})}
            />
            {/* Add more fields */}
            <button type="submit">Next</button>
          </form>
        );
      case 2:
        return (
          <div>
            <h2>Do you want to create an artist profile?</h2>
            <button onClick={() => { setIsArtist(true); setStep(3); }}>Yes</button>
            <button onClick={() => navigate('/dashboard')}>No</button>
          </div>
        );
      case 3:
        return (
          <form onSubmit={handleArtistInfoSubmit}>
            {/* Add form fields for artist info */}
            <input
              type="text"
              placeholder="Stage Name"
              value={artistInfo.stageName}
              onChange={(e) => setArtistInfo({...artistInfo, stageName: e.target.value})}
            />
            {/* Add more fields */}
            <button type="submit">Complete Profile</button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <h1>Complete Your Profile</h1>
      {renderStep()}
    </div>
  );
};

export default ProfileSetup;