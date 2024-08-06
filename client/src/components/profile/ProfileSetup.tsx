import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserProfile, createArtistProfile } from "../../services/user";
import { useAuth } from "../../contexts/AuthContext";

const ProfileSetup: React.FC = () => {
	const [step, setStep] = useState(1);
	const [basicInfo, setBasicInfo] = useState({
    username: "",
		firstName: "",
		lastName: "",
		location: "",
		bio: "",
		favoriteGenres: [],
		preferredContentTypes: [],
	});
	const [isArtist, setIsArtist] = useState(false);
	const [artistInfo, setArtistInfo] = useState({
    stageName: "",
    biography: "",
    genres: "",
    instruments: "",
    yearsOfExperience: 0,
    location: "",
    websiteUrl: "",
    socialMediaLinks: {
        facebook: "",
        instagram: "",
        twitter: "",
        youtube: ""
    },
    profileImage: "",
    portfolioItems: [],
    availability: { isAvailable: true },
    ratePerHour: 0,
});
	const navigate = useNavigate();
	const { login } = useAuth();

  const handleBasicInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("Updating profile with:", basicInfo);
      const updatedUser = await updateUserProfile(basicInfo);
      console.log("Updated user:", updatedUser);
      if (updatedUser) {
        login(localStorage.getItem("token") || "", updatedUser);
        if (updatedUser.basicProfileCompleted) {
          console.log("Basic profile completed. Moving to step 2");
          setStep(2);
        } else {
          console.log("Basic profile not complete.");
          alert("Please fill in all required fields for the basic profile.");
        }
      } else {
        throw new Error("Failed to update user profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

	const handleArtistInfoSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			if (isArtist) {
				await createArtistProfile(artistInfo);
			}
			navigate("/dashboard");
		} catch (error) {
			console.error("Error creating artist profile:", error);
		}
	};

	const renderStep = () => {
		switch (step) {
			case 1:
				return (
					<form onSubmit={handleBasicInfoSubmit}>
						{/* Add form fields for basic info */}
            <input
              type="text"
              placeholder="Username"
              value={basicInfo.username}
              onChange={(e) =>
                setBasicInfo({ ...basicInfo, username: e.target.value })
              }
            />
						<input
							type="text"
							placeholder="First Name"
							value={basicInfo.firstName}
							onChange={(e) =>
								setBasicInfo({ ...basicInfo, firstName: e.target.value })
							}
						/>
						<input
							type="text"
							placeholder="Last Name"
							value={basicInfo.lastName}
							onChange={(e) =>
								setBasicInfo({ ...basicInfo, lastName: e.target.value })
							}
						/>
						<input
							type="text"
							placeholder="Location"
							value={basicInfo.location}
							onChange={(e) =>
								setBasicInfo({ ...basicInfo, location: e.target.value })
							}
						/>
						<input
							type="text"
							placeholder="bio"
							value={basicInfo.bio}
							onChange={(e) =>
								setBasicInfo({ ...basicInfo, bio: e.target.value })
							}
						/>
						{/* Add more fields */}
						<button type="submit">Next</button>
					</form>
				);
			case 2:
				return (
					<div>
						<h2>Do you want to create an artist profile?</h2>
						<button
							onClick={() => {
								setIsArtist(true);
								setStep(3);
							}}
						>
							Yes
						</button>
						<button onClick={() => navigate("/dashboard")}>No</button>
					</div>
				);
			case 3:
  return (
    <form onSubmit={handleArtistInfoSubmit}>
      <input
        type="text"
        placeholder="Stage Name"
        value={artistInfo.stageName}
        onChange={(e) =>
          setArtistInfo({ ...artistInfo, stageName: e.target.value })
        }
      />
      <textarea
        placeholder="Biography"
        value={artistInfo.biography}
        onChange={(e) =>
          setArtistInfo({ ...artistInfo, biography: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Genres"
        value={artistInfo.genres}
        onChange={(e) =>
          setArtistInfo({ ...artistInfo, genres: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Instruments"
        value={artistInfo.instruments}
        onChange={(e) =>
          setArtistInfo({ ...artistInfo, instruments: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Years of Experience"
        value={artistInfo.yearsOfExperience}
        onChange={(e) =>
          setArtistInfo({
            ...artistInfo,
            yearsOfExperience: parseInt(e.target.value),
          })
        }
      />
      <input
        type="text"
        placeholder="Location"
        value={artistInfo.location}
        onChange={(e) =>
          setArtistInfo({ ...artistInfo, location: e.target.value })
        }
      />
      <input
        type="url"
        placeholder="Website URL"
        value={artistInfo.websiteUrl}
        onChange={(e) =>
          setArtistInfo({ ...artistInfo, websiteUrl: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Facebook"
        value={artistInfo.socialMediaLinks.facebook}
        onChange={(e) =>
          setArtistInfo({
            ...artistInfo,
            socialMediaLinks: {
              ...artistInfo.socialMediaLinks,
              facebook: e.target.value,
            },
          })
        }
      />
      <input
        type="text"
        placeholder="Instagram"
        value={artistInfo.socialMediaLinks.instagram}
        onChange={(e) =>
          setArtistInfo({
            ...artistInfo,
            socialMediaLinks: {
              ...artistInfo.socialMediaLinks,
              instagram: e.target.value,
            },
          })
        }
      />
      <input
        type="text"
        placeholder="Twitter"
        value={artistInfo.socialMediaLinks.twitter}
        onChange={(e) =>
          setArtistInfo({
            ...artistInfo,
            socialMediaLinks: {
              ...artistInfo.socialMediaLinks,
              twitter: e.target.value,
            },
          })
        }
      />
      <input
        type="text"
        placeholder="YouTube"
        value={artistInfo.socialMediaLinks.youtube}
        onChange={(e) =>
          setArtistInfo({
            ...artistInfo,
            socialMediaLinks: {
              ...artistInfo.socialMediaLinks,
              youtube: e.target.value,
            },
          })
        }
      />
      <input
        type="text"
        placeholder="Profile Image URL"
        value={artistInfo.profileImage}
        onChange={(e) =>
          setArtistInfo({ ...artistInfo, profileImage: e.target.value })
        }
      />
      <input
        type="number"
        placeholder="Rate Per Hour"
        value={artistInfo.ratePerHour}
        onChange={(e) =>
          setArtistInfo({
            ...artistInfo,
            ratePerHour: parseInt(e.target.value),
          })
        }
      />
      {/* Add more fields for portfolioItems and availability */}
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
