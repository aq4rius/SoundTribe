import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtistProfile } from '../../services/artistProfile';
import { getAllGenres } from '../../services/genre';
import { updateUserProfile } from '../../services/user';

const CreateArtistProfile: React.FC = () => {
  const navigate = useNavigate();
  const [availableGenres, setAvailableGenres] = useState<{_id: string, name: string}[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [artistInfo, setArtistInfo] = useState({
    stageName: '',
    biography: '',
    instruments: [] as string[],
    yearsOfExperience: 0,
    location: '',
    websiteUrl: '',
    socialMediaLinks: {
      facebook: '',
      instagram: '',
      twitter: '',
      youtube: '',
    },
    profileImage: '',
    portfolioItems: [],
    availability: {
      isAvailable: true,
      availableDates: [],
    },
    ratePerHour: 0,
  });

  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await getAllGenres();
      setAvailableGenres(genres);
    };
    fetchGenres();
  }, []);

  const handleGenreChange = (genreId: string) => {
    setSelectedGenres(prev => 
      prev.includes(genreId) 
        ? prev.filter(id => id !== genreId)
        : [...prev, genreId]
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setArtistInfo(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setArtistInfo(prevState => ({
      ...prevState,
      socialMediaLinks: {
        ...prevState.socialMediaLinks,
        [name]: value,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArtistProfile({ ...artistInfo, genres: selectedGenres });
      // Update user's artistProfileCompleted flag
      await updateUserProfile({ artistProfileCompleted: true });
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating artist profile:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="stageName"
        value={artistInfo.stageName}
        onChange={handleInputChange}
        placeholder="Stage Name"
        required
        className="w-full px-3 py-2 border rounded"
      />
      <textarea
        name="biography"
        value={artistInfo.biography}
        onChange={handleInputChange}
        placeholder="Biography"
        className="w-full px-3 py-2 border rounded"
      />
      <div>
        <label>Genres:</label>
        {availableGenres.map(genre => (
          <div key={genre._id}>
            <input
              type="checkbox"
              id={genre._id}
              checked={selectedGenres.includes(genre._id)}
              onChange={() => handleGenreChange(genre._id)}
            />
            <label htmlFor={genre._id}>{genre.name}</label>
          </div>
        ))}
      </div>
      <input
        type="text"
        name="instruments"
        value={artistInfo.instruments.join(', ')}
        onChange={(e) => setArtistInfo(prevState => ({ ...prevState, instruments: e.target.value.split(', ') }))}
        placeholder="Instruments (comma-separated)"
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="number"
        name="yearsOfExperience"
        value={artistInfo.yearsOfExperience}
        onChange={handleInputChange}
        placeholder="Years of Experience"
        required
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="text"
        name="location"
        value={artistInfo.location}
        onChange={handleInputChange}
        placeholder="Location"
        required
        className="w-full px-3 py-2 border rounded"
      />
      <input
        type="text"
        name="websiteUrl"
        value={artistInfo.websiteUrl}
        onChange={handleInputChange}
        placeholder="Website URL"
        className="w-full px-3 py-2 border rounded"
      />
      <div className="space-y-2">
        <input
          type="text"
          name="facebook"
          value={artistInfo.socialMediaLinks.facebook}
          onChange={handleSocialMediaChange}
          placeholder="Facebook URL"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="instagram"
          value={artistInfo.socialMediaLinks.instagram}
          onChange={handleSocialMediaChange}
          placeholder="Instagram URL"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="twitter"
          value={artistInfo.socialMediaLinks.twitter}
          onChange={handleSocialMediaChange}
          placeholder="Twitter URL"
          className="w-full px-3 py-2 border rounded"
        />
        <input
          type="text"
          name="youtube"
          value={artistInfo.socialMediaLinks.youtube}
          onChange={handleSocialMediaChange}
          placeholder="YouTube URL"
          className="w-full px-3 py-2 border rounded"
        />
      </div>
      <input
        type="text"
        name="profileImage"
        value={artistInfo.profileImage}
        onChange={handleInputChange}
        placeholder="Profile Image URL"
        className="w-full px-3 py-2 border rounded"
      />
      <div>
        <label className="block mb-2">Availability</label>
        <input
          type="checkbox"
          name="isAvailable"
          checked={artistInfo.availability.isAvailable}
          onChange={(e) => setArtistInfo(prevState => ({
            ...prevState,
            availability: { ...prevState.availability, isAvailable: e.target.checked }
          }))}
          className="mr-2"
        />
        <span>Available for hire</span>
      </div>
      <input
        type="number"
        name="ratePerHour"
        value={artistInfo.ratePerHour}
        onChange={handleInputChange}
        placeholder="Rate per Hour"
        className="w-full px-3 py-2 border rounded"
      />
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">Create Artist Profile</button>
    </form>
  );
};

export default CreateArtistProfile;
