import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArtistProfile } from '../../types';
import { updateArtistProfile, getArtistProfileById } from '../../services/artistProfile';

const EditArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ArtistProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (id) {
        const fetchedProfile = await getArtistProfileById(id);
        setProfile(fetchedProfile);
      }
    };
    fetchProfile();
  }, [id]);
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (profile && id) {
      await updateArtistProfile(id, profile);
      navigate('/dashboard');
    }
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={profile.stageName}
        onChange={(e) => setProfile({ ...profile, stageName: e.target.value })}
      />
      <textarea
        value={profile.biography}
        onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
      />
      {/* Add more fields as needed */}
      <button type="submit">Update Profile</button>
    </form>
  );
};

export default EditArtistProfile;
