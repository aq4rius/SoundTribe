// client/src/pages/Dashboard.tsx

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
import { Application } from "../types";
import { getUserApplications } from "../services/application";
import ApplicationsList from "../components/applications/ApplicationsList";
import ErrorAlert from '../components/common/ErrorAlert';
import Chat from '../components/common/Chat';

const Dashboard: React.FC = () => {
	const { user } = useAuth();
	const navigate = useNavigate();
	const [artistProfiles, setArtistProfiles] = useState<ArtistProfile[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [userApplications, setUserApplications] = useState<Application[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deleteError, setDeleteError] = useState<string | null>(null);

	const handleDeleteProfile = async (profileId: string) => {
		if (window.confirm("Are you sure you want to delete this profile?")) {
			try {
				await deleteArtistProfile(profileId);
				setArtistProfiles((profiles) =>
					profiles.filter((p) => p._id !== profileId)
				);
			} catch (error: any) {
				setDeleteError(error.response?.data?.message || error.message || "Error deleting profile");
			}
		}
	};

	const handleDeleteEvent = async (eventId: string) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			try {
				await deleteEvent(eventId);
				setEvents(events.filter((event) => event._id !== eventId));
			} catch (error: any) {
				setDeleteError(error.response?.data?.message || error.message || "Error deleting event");
			}
		}
	};

	useEffect(() => {
		const fetchData = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const [profiles, userEvents, applications] = await Promise.all([
					getUserArtistProfiles(),
					getUserEvents(),
					getUserApplications(),
				]);
				setArtistProfiles(profiles);
				setEvents(userEvents);
				setUserApplications(applications);
			} catch (err: any) {
				setError(err.response?.data?.message || err.message || "Failed to load dashboard data");
			} finally {
				setIsLoading(false);
			}
		};
		fetchData();
	}, []);

	if (!user?.profileCompleted) {
		return <ProfileSetup />;
	}

	if (isLoading) return <div>Loading...</div>;
	if (error) return <ErrorAlert message={error} />;

	return (
		<div className="max-w-7xl mx-auto py-3 px-2 md:px-8">
			<h1 className="text-3xl font-bold mb-6">Dashboard</h1>

			{/* Basic User Info Section */}
			<div className="card bg-base-100 shadow mb-8">
				<div className="card-body">
					<div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 gap-4">
						<h2 className="card-title">Basic Information</h2>
						<button
							onClick={() => navigate("/edit-profile")}
							className="btn btn-outline btn-primary btn-sm"
						>
							Edit Profile
						</button>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
			</div>

			{/* Events Section */}
			<div className="mb-8">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-xl font-semibold">Events</h2>
					<button
						onClick={() => navigate("/create-event")}
						className="btn btn-success btn-sm"
					>
						Create New Event
					</button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
			<div className="mb-8">
				<div className="flex justify-between items-center mb-2">
					<h2 className="text-xl font-semibold">Artist Profiles</h2>
					<button
						onClick={() => navigate("/create-artist-profile")}
						className="btn btn-success btn-sm"
					>
						Create New Artist Profile
					</button>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					{artistProfiles.map((profile) => (
						<div key={profile._id}>
							<ArtistCard artist={profile} mode="full" />
							<div className="mt-2 flex gap-2">
								<button
									onClick={() =>
										navigate(`/edit-artist-profile/${profile._id}`)
									}
									className="btn btn-outline btn-primary btn-xs"
								>
									Edit
								</button>
								<button
									onClick={() => handleDeleteProfile(profile._id)}
									className="btn btn-outline btn-error btn-xs"
								>
									Delete
								</button>
							</div>
						</div>
					))}
				</div>
			</div>

			{/* Applications Section */}
			<div className="mb-8">
				<h2 className="text-xl font-semibold mb-2">My Applications</h2>
				<ApplicationsList applications={userApplications} />
			</div>
			{deleteError && <ErrorAlert message={deleteError} onClose={() => setDeleteError(null)} />}
		</div>
	);
};

export default Dashboard;
