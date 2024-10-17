import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtistProfile } from '../../services/artistProfile';

const CreateArtistProfile: React.FC = () => {
  const navigate = useNavigate();
  const [artistInfo, setArtistInfo] = useState({
    stageName: '',
    biography: '',
    genres: [],
    instruments: [],
    yearsOfExperience: 0,
    location: '',
    websiteUrl: '',
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
    ratePerHour: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArtistProfile(artistInfo);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating artist profile:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setArtistInfo(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="stageName"
        value={artistInfo.stageName}
        onChange={handleInputChange}
        placeholder="Stage Name"
      />
      <input
        type="text"
        name="biography"
        value={artistInfo.biography}
        onChange={handleInputChange}
        placeholder="Biography"
      />
      {/* Add more input fields for other properties */}
      <button type="submit">Create Artist Profile</button>
    </form>
  );
};

export default CreateArtistProfile;
