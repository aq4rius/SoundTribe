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
    const { firstName, lastName, location, bio, favoriteGenres, preferredContentTypes, notificationPreferences, privacySettings } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.location = location || user.location;
    user.bio = bio || user.bio;
    user.favoriteGenres = favoriteGenres || user.favoriteGenres;
    user.preferredContentTypes = preferredContentTypes || user.preferredContentTypes;
    user.notificationPreferences = notificationPreferences || user.notificationPreferences;
    user.privacySettings = privacySettings || user.privacySettings;

    user.profileCompleted = true;

    const updatedUser = await user.save();
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
    res.status(500).json({ message: 'Server error' });
  }
};

export const createArtistProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { stageName, genres, instruments, yearsOfExperience, portfolioItems, availability, ratePerHour } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const artistProfile = new ArtistProfile({
      user: user._id,
      stageName,
      genres,
      instruments,
      yearsOfExperience,
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