import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ProfileSetup from "../components/profile/ProfileSetup";
import {
	getUserArtistProfiles,
	deleteArtistProfile,
} from "../services/artistProfile";
import { ArtistProfile } from "../types";
import { getUserEvents, deleteEvent } from "../services/event";
import { Event } from "../types";

const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [artistProfiles, setArtistProfiles] = useState<ArtistProfile[]>([]);
	const [events, setEvents] = useState<Event[]>([]);

	const handleDeleteProfile = async (profileId: string) => {
		if (window.confirm("Are you sure you want to delete this profile?")) {
			try {
				await deleteArtistProfile(profileId);
				setArtistProfiles((profiles) =>
					profiles.filter((p) => p._id !== profileId)
				);
			} catch (error) {
				console.error("Error deleting profile:", error);
			}
		}
	};

	const handleDeleteEvent = async (eventId: string) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			try {
				await deleteEvent(eventId);
				setEvents(events.filter((event) => event._id !== eventId));
			} catch (error) {
				console.error("Error deleting event:", error);
			}
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			const [profiles, userEvents] = await Promise.all([
				getUserArtistProfiles(),
				getUserEvents(),
			]);
			setArtistProfiles(profiles);
			setEvents(userEvents);
		};
		fetchData();
	}, []);

	if (!user?.profileCompleted) {
		return <ProfileSetup />;
	}

	return (
		<div className="max-w-8xl mx-auto py-3 sm:px-10 lg:px-10">
			<h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>

			{/* Basic User Info Section */}
			<div className="mt-6 p-6 bg-white rounded-lg shadow">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold">Basic Information</h2>
					<button
						onClick={() => navigate("/edit-profile")}
						className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
					>
						Edit Profile
					</button>
				</div>
				<div className="mt-4 grid grid-cols-2 gap-4">
					<div>
						<p className="font-semibold">Username:</p>
						<p>{user.username}</p>
					</div>
					<div>
						<p className="font-semibold">Email:</p>
						<p>{user.email}</p>
					</div>
					<div>
						<p className="font-semibold">Location:</p>
						<p>{user.location || "Not specified"}</p>
					</div>
					<div>
						<p className="font-semibold">Bio:</p>
						<p>{user.bio || "No bio provided"}</p>
					</div>
				</div>
			</div>

			{/* Events Section */}
			<div className="mt-8">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold">Events</h2>
					<button
						onClick={() => navigate("/create-event")}
						className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
					>
						Create New Event
					</button>
				</div>

				<div className="mt-4 space-y-6">
					{events.map((event) => (
						<div key={event._id} className="p-6 bg-white rounded-lg shadow">
							<div className="flex justify-between items-start">
								<h3 className="text-lg font-semibold">{event.title}</h3>
								<div className="space-x-2">
									<button
										onClick={() => navigate(`/edit-event/${event._id}`)}
										className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
									>
										Edit
									</button>
									<button
										onClick={() => handleDeleteEvent(event._id)}
										className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
									>
										Delete
									</button>
								</div>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-4">
								<div>
									<p className="font-semibold">Description:</p>
									<p>{event.description}</p>
								</div>
								<div>
									<p className="font-semibold">Location:</p>
									<p>{event.location}</p>
								</div>
								<div>
									<p className="font-semibold">Date:</p>
									<p>{new Date(event.eventDate).toLocaleDateString()}</p>
								</div>
								<div>
									<p className="font-semibold">Duration:</p>
									<p>{event.duration} hours</p>
								</div>
								<div>
									<p className="font-semibold">Payment:</p>
									<p>
										${event.paymentAmount} ({event.paymentType})
									</p>
								</div>
								<div>
									<p className="font-semibold">Required Instruments:</p>
									<p>{event.requiredInstruments.join(", ")}</p>
								</div>
								<div>
									<p className="font-semibold">Genres:</p>
									<p>{event.genres.map((genre) => genre.name).join(", ")}</p>
								</div>
								<div>
									<p className="font-semibold">Status:</p>
									<p className="capitalize">{event.status}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Artist Profiles Section */}
			<div className="mt-8">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-semibold">Artist Profiles</h2>
					<button
						onClick={() => navigate("/create-artist-profile")}
						className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
					>
						Create New Artist Profile
					</button>
				</div>

				<div className="mt-4 space-y-6">
					{artistProfiles.map((profile) => (
						<div key={profile._id} className="p-6 bg-white rounded-lg shadow">
							<div className="flex justify-between items-start">
								<h3 className="text-lg font-semibold">{profile.stageName}</h3>
								<div className="space-x-2">
									<button
										onClick={() =>
											navigate(`/edit-artist-profile/${profile._id}`)
										}
										className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
									>
										Edit
									</button>
									<button
										onClick={() => handleDeleteProfile(profile._id)}
										className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
									>
										Delete
									</button>
								</div>
							</div>

							<div className="mt-4 grid grid-cols-2 gap-4">
								<div>
									<p className="font-semibold">Biography:</p>
									<p>{profile.biography || "No biography provided"}</p>
								</div>
								<div>
									<p className="font-semibold">Genres:</p>
									<p>
										{profile.genres.map((genre) => genre.name).join(", ") ||
											"No genres specified"}
									</p>
								</div>

								<div>
									<p className="font-semibold">Instruments:</p>
									<p>
										{profile.instruments.join(", ") ||
											"No instruments specified"}
									</p>
								</div>
								<div>
									<p className="font-semibold">Experience:</p>
									<p>{profile.yearsOfExperience} years</p>
								</div>
								<div>
									<p className="font-semibold">Rate:</p>
									<p>${profile.ratePerHour}/hour</p>
								</div>
								<div>
									<p className="font-semibold">Location:</p>
									<p>{profile.location}</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
