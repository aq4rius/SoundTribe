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
    if (notificationPreferences) user.notificationPreferences = notificationPreferences;
    if (privacySettings) user.privacySettings = privacySettings;

    const updatedUser = await user.save();
    res.json({
      id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      roles: updatedUser.roles,
      firstName: updatedUser.firstName,
      lastName: updatedUser.lastName,
      location: updatedUser.location,
      bio: updatedUser.bio,
      preferences: updatedUser.preferences,
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

// Onboarding: Get onboarding state
export const getUserOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(req.user?._id).select('roles onboardingStep onboardingComplete preferences locationDetails notificationPreferences firstName lastName location bio');
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    res.json(user);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
};

// Onboarding: Update onboarding state
export const updateUserOnboarding = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { roles, onboardingStep, onboardingComplete, preferences, locationDetails, notificationPreferences } = req.body;
    console.log('PATCH /api/users/onboarding called');
    console.log('Request body:', req.body);
    const user = await User.findById(req.user?._id);
    if (!user) {
      console.log('User not found');
      return next(new AppError('User not found', 404));
    }
    if (roles) user.roles = roles;
    if (typeof onboardingStep === 'number') user.onboardingStep = onboardingStep;
    if (typeof onboardingComplete === 'boolean') user.onboardingComplete = onboardingComplete;
    if (preferences) {
      console.log('Updating preferences:', preferences);
      user.preferences = preferences;
    }
    if (locationDetails) user.locationDetails = locationDetails;
    if (notificationPreferences) user.notificationPreferences = notificationPreferences;
    if (req.body.firstName !== undefined) user.firstName = req.body.firstName;
    if (req.body.lastName !== undefined) user.lastName = req.body.lastName;
    if (req.body.location !== undefined) user.location = req.body.location;
    if (req.body.bio !== undefined) user.bio = req.body.bio;
    await user.save();
    res.json({ success: true });
  } catch (error) {
    console.error('Error in updateUserOnboarding:', error);
    next(new AppError('Server error', 500));
  }
};
