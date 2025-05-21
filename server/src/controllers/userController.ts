// server/src/controllers/userController.ts

import { Response, NextFunction } from 'express';
import User, { IUser, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import ArtistProfile from '../models/ArtistProfile';
import { AppError } from '../utils/errorHandler';

export const getUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('-password');
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.json(user);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
};

export const updateUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const {
      username,
      firstName,
      lastName,
      location,
      bio,
      favoriteGenres,
      preferredContentTypes,
      notificationPreferences,
      privacySettings,
    } = req.body;
    const user = await User.findById(req.user?._id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    // Update the fields
    if (username) user.username = username;
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (favoriteGenres) user.favoriteGenres = favoriteGenres;
    if (preferredContentTypes) user.preferredContentTypes = preferredContentTypes;
    if (notificationPreferences) user.notificationPreferences = notificationPreferences;
    if (privacySettings) user.privacySettings = privacySettings;

    // Check if all required basic fields are filled
    const requiredBasicFields = ['username', 'firstName', 'lastName', 'location', 'bio'];
    user.basicProfileCompleted = requiredBasicFields.every(
      (field) => user[field as keyof IUser] && (user[field as keyof IUser] as string).trim() !== '',
    );

    // Update overall profile completion status
    user.profileCompleted =
      user.basicProfileCompleted && (user.role !== UserRole.ARTIST || user.artistProfileCompleted);

    // --- Ensure profileCompleted is set to true after update if all required fields are present ---
    // (already handled above)

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      profileCompleted: updatedUser.profileCompleted,
      artistProfileCompleted: updatedUser.artistProfileCompleted,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      location: updatedUser.location,
      bio: updatedUser.bio,
      favoriteGenres: updatedUser.favoriteGenres,
      preferredContentTypes: updatedUser.preferredContentTypes,
      notificationPreferences: updatedUser.notificationPreferences,
      privacySettings: updatedUser.privacySettings,
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    next(new AppError('Server error', 500));
  }
};

export const deleteUserProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    // Delete all artist profiles associated with the user
    await ArtistProfile.deleteMany({ user: userId });

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    next(new AppError('Error deleting profile', 500));
  }
};
