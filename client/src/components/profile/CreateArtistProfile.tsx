// client/src/components/profile/CreateArtistProfile.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createArtistProfile } from '../../services/artistProfile';
import { getAllGenres } from '../../services/genre';
import { updateUserProfile } from '../../services/user';
import ErrorAlert from '../common/ErrorAlert';

const CreateArtistProfile: React.FC = () => {
  const navigate = useNavigate();
  const [availableGenres, setAvailableGenres] = useState<{ _id: string; name: string }[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<
    Array<{
      title: string;
      description: string;
      mediaUrl: string;
      mediaType: 'audio' | 'video' | 'image';
      isEditing: boolean;
    }>
  >([]);
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
      availableDates: [] as Date[],
    },
    ratePerHour: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGenres = async () => {
      const genres = await getAllGenres();
      setAvailableGenres(genres);
    };
    fetchGenres();
  }, []);

  const handleGenreChange = (genreId: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genreId) ? prev.filter((id) => id !== genreId) : [...prev, genreId],
    );
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setArtistInfo((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setArtistInfo((prevState) => ({
      ...prevState,
      socialMediaLinks: {
        ...prevState.socialMediaLinks,
        [name]: value,
      },
    }));
  };

  const handleAddPortfolioItem = () => {
    setPortfolioItems([
      ...portfolioItems,
      {
        title: '',
        description: '',
        mediaUrl: '',
        mediaType: 'image',
        isEditing: true,
      },
    ]);
  };

  const toggleEditMode = (index: number) => {
    const updatedItems = [...portfolioItems];
    updatedItems[index] = {
      ...updatedItems[index],
      isEditing: !updatedItems[index].isEditing,
    };
    setPortfolioItems(updatedItems);
  };

  const handlePortfolioItemChange = (index: number, field: string, value: string) => {
    const updatedItems = [...portfolioItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    setPortfolioItems(updatedItems);
  };

  const handleDateSelection = (date: Date) => {
    setArtistInfo((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        availableDates: [...prev.availability.availableDates, date],
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    // Validation
    if (!artistInfo.stageName.trim()) {
      setError('Stage name is required.');
      return;
    }
    if (!artistInfo.location.trim()) {
      setError('Location is required.');
      return;
    }
    if (selectedGenres.length === 0) {
      setError('At least one genre must be selected.');
      return;
    }
    setIsLoading(true);
    try {
      // Filter out empty portfolio items
      const validPortfolioItems = portfolioItems.filter(
        (item) => item.title.trim() !== '' && item.mediaUrl.trim() !== '',
      );

      await createArtistProfile({
        ...artistInfo,
        genres: selectedGenres,
        portfolioItems: validPortfolioItems,
      });
      await updateUserProfile({ artistProfileCompleted: true });
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.response?.data?.message || error.message || 'Error creating artist profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <ErrorAlert message={error} onClose={() => setError(null)} />}
      {isLoading && <div>Saving...</div>}
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
        {availableGenres.map((genre) => (
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
        onChange={(e) =>
          setArtistInfo((prevState) => ({
            ...prevState,
            instruments: e.target.value.split(', '),
          }))
        }
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
          onChange={(e) =>
            setArtistInfo((prevState) => ({
              ...prevState,
              availability: {
                ...prevState.availability,
                isAvailable: e.target.checked,
              },
            }))
          }
          className="mr-2"
        />
        <span>Available for hire</span>
      </div>
      <div className="mt-2">
        <input
          type="date"
          onChange={(e) => handleDateSelection(new Date(e.target.value))}
          className="w-full px-3 py-2 border rounded"
        />
        <div className="mt-2">
          Selected dates:
          {artistInfo.availability.availableDates.map((date, index) => (
            <div key={index} className="flex items-center">
              <span>{date.toLocaleDateString()}</span>
              <button
                type="button"
                onClick={() => {
                  const newDates = artistInfo.availability.availableDates.filter(
                    (_, i) => i !== index,
                  );
                  setArtistInfo((prev) => ({
                    ...prev,
                    availability: {
                      ...prev.availability,
                      availableDates: newDates,
                    },
                  }));
                }}
                className="ml-2 text-red-500"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>
      <input
        type="number"
        name="ratePerHour"
        value={artistInfo.ratePerHour}
        onChange={handleInputChange}
        placeholder="Rate per Hour"
        className="w-full px-3 py-2 border rounded"
      />
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Portfolio Items</h3>
        {portfolioItems.map((item, index) => (
          <div key={index} className="space-y-2 p-4 border rounded">
            {item.isEditing ? (
              <>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) => handlePortfolioItemChange(index, 'title', e.target.value)}
                  placeholder="Title"
                  className="w-full px-3 py-2 border rounded"
                />
                <textarea
                  value={item.description}
                  onChange={(e) => handlePortfolioItemChange(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  value={item.mediaUrl}
                  onChange={(e) => handlePortfolioItemChange(index, 'mediaUrl', e.target.value)}
                  placeholder="Media URL"
                  className="w-full px-3 py-2 border rounded"
                />
                <select
                  value={item.mediaType}
                  onChange={(e) => handlePortfolioItemChange(index, 'mediaType', e.target.value)}
                  className="w-full px-3 py-2 border rounded"
                >
                  <option value="image">Image</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                </select>
                <button
                  type="button"
                  onClick={() => toggleEditMode(index)}
                  className="mt-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 mr-2"
                >
                  Save Item
                </button>
              </>
            ) : (
              <>
                <h4 className="font-bold">{item.title}</h4>
                <p>{item.description}</p>
                <p>Media Type: {item.mediaType}</p>
                <p>URL: {item.mediaUrl}</p>
                <button
                  type="button"
                  onClick={() => toggleEditMode(index)}
                  className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
                >
                  Edit
                </button>
              </>
            )}
            <button
              type="button"
              onClick={() => {
                const updatedItems = portfolioItems.filter((_, i) => i !== index);
                setPortfolioItems(updatedItems);
              }}
              className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Delete Item
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddPortfolioItem}
          className="w-fit bg-gray-200 text-gray-700 py-2 rounded hover:bg-gray-300"
        >
          Add Portfolio Item
        </button>
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
          Create Artist Profile
        </button>
      </div>
    </form>
  );
};

export default CreateArtistProfile;
