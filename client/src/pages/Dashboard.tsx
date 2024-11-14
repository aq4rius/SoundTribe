import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ProfileSetup from "../components/profile/ProfileSetup";
import EditProfile from "../components/profile/EditProfile";
import {
    getUserArtistProfiles,
    deleteArtistProfile,
} from "../services/artistProfile";
import { ArtistProfile } from "../types";

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [artistProfiles, setArtistProfiles] = useState<ArtistProfile[]>([]);

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

    useEffect(() => {
        const fetchArtistProfiles = async () => {
          const profiles = await getUserArtistProfiles();
          console.log('Fetched profiles:', profiles);
          setArtistProfiles(profiles);
        };
        fetchArtistProfiles();
      }, []);
      

    if (!user?.profileCompleted) {
        return <ProfileSetup />;
    }

    return (
        <div className="max-w-8xl mx-auto py-3 sm:px-10 lg:px-10">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            {user && (
                <div className="mt-4">
                    <p className="text-lg">Welcome, {user.username}!</p>
                    <p>Email: {user.email}</p>
                    <p>Role: {user.role}</p>
                    <EditProfile />
                    {artistProfiles.length > 0 ? (
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 mt-10">
                                Artist Profiles
                            </h2>
                            {artistProfiles.map((profile) => (
                                <div key={profile._id} className="mt-4 p-4 border rounded">
                                    <h3 className="text-lg font-semibold">{profile.stageName}</h3>
                                    <p>{profile.biography}</p>
                                    
                                        <button
                                            className="mt-2 bg-red-500 text-white py-1 px-2 rounded"
                                            onClick={() => handleDeleteProfile(profile._id)}
                                        >
                                            Delete
                                        </button>
                                    <button
                                        className="mt-2 bg-blue-500 text-white py-1 px-2 rounded"
                                        onClick={() => navigate(`/edit-artist-profile/${profile._id}`)}
                                    >
                                        Edit
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <button
                            className="mt-4 bg-blue-500 text-white py-2 px-4 rounded"
                            onClick={() => navigate("/create-artist-profile")}
                        >
                            Create an Artist Profile
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
