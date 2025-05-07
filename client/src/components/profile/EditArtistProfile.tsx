// client/src/components/profile/EditArtistProfile.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArtistProfile } from "../../types";
import {
	updateArtistProfile,
	getArtistProfileById,
} from "../../services/artistProfile";
import { getAllGenres } from "../../services/genre";
import ErrorAlert from '../common/ErrorAlert';

const EditArtistProfile: React.FC = () => {
	const { id } = useParams<{ id: string }>();
	const navigate = useNavigate();
	const [profile, setProfile] = useState<ArtistProfile & { portfolioItems?: Array<{ isEditing?: boolean }> } | null>(null);
	const [availableGenres, setAvailableGenres] = useState<
		{ _id: string; name: string }[]
	>([]);
	const [notification, setNotification] = useState<{
		type: "success" | "error";
		message: string;
		isVisible: boolean;
	} | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchData = async () => {
			if (id) {
				const [fetchedProfile, genres] = await Promise.all([
					getArtistProfileById(id),
					getAllGenres(),
				]);
				setProfile(fetchedProfile);
				setAvailableGenres(genres);
			}
		};
		fetchData();
	}, [id]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		if (!profile) return;
		// Validation
		if (!profile.stageName.trim()) {
			setError('Stage name is required.');
			return;
		}
		if (!profile.location.trim()) {
			setError('Location is required.');
			return;
		}
		if (!profile.genres || profile.genres.length === 0) {
			setError('At least one genre must be selected.');
			return;
		}
		setIsLoading(true);
		try {
			await updateArtistProfile(id!, profile);
			setNotification({
				type: "success",
				message: "Profile updated successfully!",
				isVisible: true,
			});
			setTimeout(() => navigate("/dashboard"), 1500);
		} catch (err: any) {
			setNotification({
				type: "error",
				message: err.response?.data?.message || err.message || "Failed to update profile",
				isVisible: true,
			});
			setError(err.response?.data?.message || err.message || 'Failed to update profile');
			setTimeout(() => setNotification(null), 3000);
		} finally {
			setIsLoading(false);
		}
	};

	const handleGenreChange = (genreId: string) => {
		if (!profile) return;

		setProfile((prev) => {
			if (!prev) return null;
			const genres = prev.genres.map((g) => g._id);
			const newGenres = genres.includes(genreId)
				? prev.genres.filter((g) => g._id !== genreId)
				: [
						...prev.genres,
						{
							_id: genreId,
							name: availableGenres.find((g) => g._id === genreId)?.name || "",
						},
				  ];

			return {
				...prev,
				genres: newGenres,
			};
		});
	};

	const handleSocialMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (!profile) return;
		const { name, value } = e.target;
		setProfile((prev) => ({
			...prev!,
			socialMediaLinks: {
				...prev!.socialMediaLinks,
				[name]: value,
			},
		}));
	};

	if (!profile) return <div>Loading...</div>;

	const Notification = () => {
		if (!notification?.isVisible) return null;

		const baseStyles =
			"fixed top-5 right-5 px-6 py-3 rounded-lg shadow-lg z-50 transform transition-transform duration-300 ease-in-out";
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
	

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Notification />
			{error && <ErrorAlert message={error} onClose={() => setError(null)} />}
			{isLoading && <div>Saving...</div>}
			<input
				type="text"
				name="stageName"
				value={profile.stageName}
				onChange={(e) => setProfile({ ...profile, stageName: e.target.value })}
				placeholder="Stage Name"
				required
				className="w-full px-3 py-2 border rounded"
			/>
			<textarea
				name="biography"
				value={profile.biography}
				onChange={(e) => setProfile({ ...profile, biography: e.target.value })}
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
							checked={profile.genres.some((g) => g._id === genre._id)}
							onChange={() => handleGenreChange(genre._id)}
						/>
						<label htmlFor={genre._id}>{genre.name}</label>
					</div>
				))}
			</div>
			<input
				type="text"
				name="instruments"
				value={profile.instruments.join(", ")}
				onChange={(e) =>
					setProfile({ ...profile, instruments: e.target.value.split(", ") })
				}
				placeholder="Instruments (comma-separated)"
				className="w-full px-3 py-2 border rounded"
			/>
			<input
				type="number"
				name="yearsOfExperience"
				value={profile.yearsOfExperience}
				onChange={(e) =>
					setProfile({
						...profile,
						yearsOfExperience: parseInt(e.target.value),
					})
				}
				placeholder="Years of Experience"
				required
				className="w-full px-3 py-2 border rounded"
			/>
			<input
				type="text"
				name="location"
				value={profile.location}
				onChange={(e) => setProfile({ ...profile, location: e.target.value })}
				placeholder="Location"
				required
				className="w-full px-3 py-2 border rounded"
			/>
			<input
				type="text"
				name="websiteUrl"
				value={profile.websiteUrl}
				onChange={(e) => setProfile({ ...profile, websiteUrl: e.target.value })}
				placeholder="Website URL"
				className="w-full px-3 py-2 border rounded"
			/>
			<div className="space-y-2">
				<input
					type="text"
					name="facebook"
					value={profile.socialMediaLinks?.facebook || ""}
					onChange={handleSocialMediaChange}
					placeholder="Facebook URL"
					className="w-full px-3 py-2 border rounded"
				/>
				<input
					type="text"
					name="instagram"
					value={profile.socialMediaLinks?.instagram || ""}
					onChange={handleSocialMediaChange}
					placeholder="Instagram URL"
					className="w-full px-3 py-2 border rounded"
				/>
				<input
					type="text"
					name="twitter"
					value={profile.socialMediaLinks?.twitter || ""}
					onChange={handleSocialMediaChange}
					placeholder="Twitter URL"
					className="w-full px-3 py-2 border rounded"
				/>
				<input
					type="text"
					name="youtube"
					value={profile.socialMediaLinks?.youtube || ""}
					onChange={handleSocialMediaChange}
					placeholder="YouTube URL"
					className="w-full px-3 py-2 border rounded"
				/>
			</div>
			<div className="space-y-4">
    <h3 className="font-semibold">Portfolio Items</h3>
    {profile.portfolioItems?.map((item, index) => (
        <div key={index} className="p-4 border rounded">
            {item.isEditing ? (
                <>
                    <input
                        type="text"
                        value={item.title}
                        onChange={(e) => {
                            const newItems = [...(profile.portfolioItems || [])];
                            newItems[index] = { ...item, title: e.target.value };
                            setProfile({ ...profile, portfolioItems: newItems });
                        }}
                        placeholder="Title"
                        className="w-full px-3 py-2 border rounded mb-2"
                    />
                    <textarea
                        value={item.description}
                        onChange={(e) => {
                            const newItems = [...(profile.portfolioItems || [])];
                            newItems[index] = { ...item, description: e.target.value };
                            setProfile({ ...profile, portfolioItems: newItems });
                        }}
                        placeholder="Description"
                        className="w-full px-3 py-2 border rounded mb-2"
                    />
                    <input
                        type="text"
                        value={item.mediaUrl}
                        onChange={(e) => {
                            const newItems = [...(profile.portfolioItems || [])];
                            newItems[index] = { ...item, mediaUrl: e.target.value };
                            setProfile({ ...profile, portfolioItems: newItems });
                        }}
                        placeholder="Media URL"
                        className="w-full px-3 py-2 border rounded mb-2"
                    />
                    <select
                        value={item.mediaType}
                        onChange={(e) => {
                            const newItems = [...(profile.portfolioItems || [])];
                            newItems[index] = {
                                ...item,
                                mediaType: e.target.value as "audio" | "video" | "image",
                            };
                            setProfile({ ...profile, portfolioItems: newItems });
                        }}
                        className="w-full px-3 py-2 border rounded mb-2"
                    >
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
                        <option value="image">Image</option>
                    </select>
                    <button
                        type="button"
                        onClick={() => {
                            const newItems = [...(profile.portfolioItems || [])];
                            newItems[index] = { ...item, isEditing: false };
                            setProfile({ ...profile, portfolioItems: newItems });
                        }}
                        className="bg-green-500 text-white px-4 py-2 rounded mr-2"
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
                        onClick={() => {
                            const newItems = [...(profile.portfolioItems || [])];
                            newItems[index] = { ...item, isEditing: true };
                            setProfile({ ...profile, portfolioItems: newItems });
                        }}
                        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
                    >
                        Edit
                    </button>
                </>
            )}
            <button
                type="button"
                onClick={() => {
                    const newItems = profile.portfolioItems?.filter((_, i) => i !== index);
                    setProfile({ ...profile, portfolioItems: newItems });
                }}
                className="bg-red-500 text-white px-4 py-2 rounded"
            >
                Remove
            </button>
        </div>
    ))}
    <button
        type="button"
        onClick={() => {
            const newItem = {
                title: "",
                description: "",
                mediaUrl: "",
                mediaType: "image" as const,
                isEditing: true,
            };
            setProfile({
                ...profile,
                portfolioItems: [...(profile.portfolioItems || []), newItem],
            });
        }}
        className="bg-green-500 text-white px-4 py-2 rounded"
    >
        Add Portfolio Item
    </button>
</div>

			<div>
				<label className="block mb-2">Availability</label>
				<input
					type="checkbox"
					name="isAvailable"
					checked={profile.availability.isAvailable}
					onChange={(e) =>
						setProfile((prev) => ({
							...prev!,
							availability: {
								...prev!.availability,
								isAvailable: e.target.checked,
							},
						}))
					}
					className="mr-2"
				/>
				<span>Available for hire</span>
			</div>
			<div className="mt-4">
				<label className="block mb-2">Available Dates</label>
				<input
					type="date"
					onChange={(e) => {
						const newDate = new Date(e.target.value);
						const currentDates = profile.availability.availableDates || [];
						if (
							!currentDates.some(
								(date) => date.toDateString() === newDate.toDateString()
							)
						) {
							setProfile({
								...profile,
								availability: {
									...profile.availability,
									availableDates: [...currentDates, newDate],
								},
							});
						}
					}}
					className="w-full px-3 py-2 border rounded mb-2"
				/>
				<div className="space-y-2">
					{profile.availability.availableDates?.map((date, index) => (
						<div key={index} className="flex justify-between items-center">
							<span>{new Date(date).toLocaleDateString()}</span>
							<button
								type="button"
								onClick={() => {
									const newDates = profile.availability.availableDates?.filter(
										(_, i) => i !== index
									);
									setProfile({
										...profile,
										availability: {
											...profile.availability,
											availableDates: newDates,
										},
									});
								}}
								className="bg-red-500 text-white px-2 py-1 rounded"
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
				value={profile.ratePerHour}
				onChange={(e) =>
					setProfile({ ...profile, ratePerHour: parseInt(e.target.value) })
				}
				placeholder="Rate per Hour"
				className="w-full px-3 py-2 border rounded"
			/>

			<div className="flex justify-end space-x-4">
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
		</form>
	);
};

export default EditArtistProfile;
