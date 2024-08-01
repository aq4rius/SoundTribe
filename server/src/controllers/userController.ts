import { Response } from 'express';
import User, { IUser, UserRole } from '../models/User';
import ArtistProfile from '../models/ArtistProfile';
import { AuthRequest } from '../middleware/authMiddleware';

export const getUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    console.log('Updating profile for user:', req.user);
    console.log('Update data:', req.body);
    const { username, firstName, lastName, location, bio, favoriteGenres, preferredContentTypes, notificationPreferences, privacySettings } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only update the fields that are provided
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (favoriteGenres) user.favoriteGenres = favoriteGenres;
    if (preferredContentTypes) user.preferredContentTypes = preferredContentTypes;
    if (notificationPreferences) user.notificationPreferences = notificationPreferences;
    if (privacySettings) user.privacySettings = privacySettings;

    // Check if all required fields are filled
    const requiredFields = [user.username, user.firstName, user.lastName, user.location, user.bio];
    user.profileCompleted = requiredFields.every(field => field && field.trim() !== '');

    const updatedUser = await user.save();
    console.log('User updated successfully:', updatedUser);
    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profileCompleted: updatedUser.profileCompleted,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      location: updatedUser.location,
      bio: updatedUser.bio
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createArtistProfile = async (req: AuthRequest, res: Response) => {
  try {
    const {
      stageName,
      biography,
      genres,
      instruments,
      yearsOfExperience,
      location,
      websiteUrl,
      socialMediaLinks,
      profileImage,
      portfolioItems,
      availability,
      ratePerHour
    } = req.body;

    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const artistProfile = new ArtistProfile({
      user: user._id,
      stageName,
      biography,
      genres,
      instruments,
      yearsOfExperience,
      location,
      websiteUrl,
      socialMediaLinks,
      profileImage,
      portfolioItems,
      availability,
      ratePerHour
    });

    await artistProfile.save();

    user.role = UserRole.ARTIST;
    await user.save();

    res.status(201).json(artistProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

export const getArtistProfile = async (req: AuthRequest, res: Response) => {
  try {
    const artistProfile = await ArtistProfile.findOne({ user: req.user?._id });
    if (!artistProfile) {
      return res.status(404).json({ message: 'Artist profile not found' });
    }
    res.json(artistProfile);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};