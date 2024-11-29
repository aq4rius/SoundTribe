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
import ArtistCard from "../components/artists/ArtistCard";
import EventCard from "../components/events/EventCard";
import { Application } from '../types';
import { getUserApplications } from '../services/application';
import ApplicationsList from '../components/applications/ApplicationsList';


const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [artistProfiles, setArtistProfiles] = useState<ArtistProfile[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [userApplications, setUserApplications] = useState<Application[]>([]);

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
		  const [profiles, userEvents, applications] = await Promise.all([
			getUserArtistProfiles(),
			getUserEvents(),
			getUserApplications()
		  ]);
		  setArtistProfiles(profiles);
		  setEvents(userEvents);
		  setUserApplications(applications);
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
    <EventCard 
      key={event._id}
      event={event}
      mode="full"
      onDelete={handleDeleteEvent}
    />
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
						<div key={profile._id} className="mt-4">
							<ArtistCard artist={profile} mode="full" />
							<div className="mt-2 space-x-2">
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
					))}
				</div>
<div className="mt-8">
  <h2 className="text-2xl font-bold mb-4">My Applications</h2>
  <ApplicationsList applications={userApplications} />
</div>
			</div>
		</div>
	);
};

export default Dashboard;
