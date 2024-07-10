// server/src/controllers/artistProfileController.ts

import { Request, Response } from 'express';
import ArtistProfile, { IArtistProfile } from '../models/ArtistProfile';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

export const createArtistProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?._id;
    const existingProfile = await ArtistProfile.findOne({ user: userId });
    if (existingProfile) {
      return res.status(400).send('Artist profile already exists for this user');
    }

    const newProfile: IArtistProfile = new ArtistProfile({
      ...req.body,
      user: userId
    });
    await newProfile.save();
    res.status(201).json(newProfile);
  } catch (error) {
    res.status(500).send('Error creating artist profile');
  }
};

export const getArtistProfile = async (req: Request, res: Response) => {
  try {
    const profile = await ArtistProfile.findById(req.params.id).populate('genres');
    if (!profile) {
      return res.status(404).send('Artist profile not found');
    }
    res.json(profile);
  } catch (error) {
    res.status(500).send('Error fetching artist profile');
  }
};

export const updateArtistProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await ArtistProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).send('Artist profile not found');
    }
    if (profile.user.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to update this profile');
    }

    const updatedProfile = await ArtistProfile.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).send('Error updating artist profile');
  }
};

export const deleteArtistProfile = async (req: AuthRequest, res: Response) => {
  try {
    const profile = await ArtistProfile.findById(req.params.id);
    if (!profile) {
      return res.status(404).send('Artist profile not found');
    }
    if (profile.user.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to delete this profile');
    }

    await ArtistProfile.findByIdAndDelete(req.params.id);
    res.send('Artist profile deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting artist profile');
  }
};

export const searchArtistProfiles = async (req: Request, res: Response) => {
  try {
    const { genre, instrument, location } = req.query;
    let query: any = {};

    if (genre) query.genres = genre;
    if (instrument) query.instruments = { $in: [instrument] };
    if (location) query.location = new RegExp(location as string, 'i');

    const profiles = await ArtistProfile.find(query).populate('genres');
    res.json(profiles);
  } catch (error) {
    res.status(500).send('Error searching artist profiles');
  }
};