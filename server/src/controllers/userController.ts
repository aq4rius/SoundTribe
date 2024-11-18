import { Response } from 'express';
import User, { IUser, UserRole } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import ArtistProfile from '../models/ArtistProfile';

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
    user.basicProfileCompleted = requiredBasicFields.every(field => user[field as keyof IUser] && (user[field as keyof IUser] as string).trim() !== '');

    // Update overall profile completion status
    user.profileCompleted = user.basicProfileCompleted && (user.role !== UserRole.ARTIST || user.artistProfileCompleted);

    const updatedUser = await user.save();
    console.log('User updated successfully:', updatedUser);
    res.json(updatedUser.toObject({ virtuals: true }));
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

export const deleteUserProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    
    // Delete all artist profiles associated with the user
    await ArtistProfile.deleteMany({ user: userId });
    
    // Delete the user
    await User.findByIdAndDelete(userId);
    
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting profile' });
  }
};
