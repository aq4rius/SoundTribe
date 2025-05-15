// server/src/controllers/artistProfileController.ts

import { Request, Response, NextFunction } from 'express';
import User, { UserRole } from '../models/User';
import ArtistProfile, { IArtistProfile } from '../models/ArtistProfile';
import { AuthRequest } from '../middleware/authMiddleware';
import { AppError } from '../utils/errorHandler';

export const createArtistProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?._id;

    const newProfile: IArtistProfile = new ArtistProfile({
      ...req.body,
      user: userId,
    });

    await newProfile.save();

    res.status(201).json({ artistProfile: newProfile });
  } catch (error) {
    console.error('Error creating artist profile:', error);
    if (error instanceof Error) {
      next(error);
    } else {
      next(error);
    }
  }
};

export const getArtistProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const profile = await ArtistProfile.findById(req.params.id).populate('genres');
    if (!profile) {
      throw new AppError('Artist profile not found', 404);
    }
    res.json(profile);
  } catch (error) {
    next(error);
  }
};

export const updateArtistProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await ArtistProfile.findById(req.params.id);
    if (!profile) {
      throw new AppError('Artist profile not found', 404);
    }
    if (profile.user.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      throw new AppError('Not authorized to update this profile', 403);
    }

    const updatedProfile = await ArtistProfile.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedProfile);
  } catch (error) {
    next(error);
  }
};

export const deleteArtistProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const profile = await ArtistProfile.findById(req.params.id);
    if (!profile) {
      throw new AppError('Artist profile not found', 404);
    }
    if (profile.user.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      throw new AppError('Not authorized to delete this profile', 403);
    }

    await ArtistProfile.findByIdAndDelete(req.params.id);
    res.send('Artist profile deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const getUserArtistProfiles = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const artistProfiles = await ArtistProfile.find({ user: req.user?._id }).populate(
      'genres',
      'name',
    );
    res.json(artistProfiles);
  } catch (error) {
    console.error('Error in getUserArtistProfiles:', error); // Log the real error
    res.status(500).json({
      message: 'Error fetching artist profiles',
      error: error instanceof Error ? error.message : error,
    });
  }
};

export const searchArtistProfiles = async (req: Request, res: Response) => {
  try {
    const {
      searchTerm,
      selectedGenres,
      instruments,
      experienceMin,
      rateMin,
      rateMax,
      location,
      page = 1,
      limit = 9,
    } = req.query;

    let query: any = {};

    if (searchTerm) {
      query.$or = [
        { stageName: new RegExp(searchTerm as string, 'i') },
        { biography: new RegExp(searchTerm as string, 'i') },
      ];
    }

    if (selectedGenres) {
      const genreIds = Array.isArray(selectedGenres) ? selectedGenres : [selectedGenres];
      query.genres = { $in: genreIds };
    }

    if (instruments) {
      query.instruments = { $in: Array.isArray(instruments) ? instruments : [instruments] };
    }

    if (experienceMin) {
      query.yearsOfExperience = { $gte: Number(experienceMin) };
    }

    if (rateMin || rateMax) {
      query.ratePerHour = {};
      if (rateMin) query.ratePerHour.$gte = Number(rateMin);
      if (rateMax) query.ratePerHour.$lte = Number(rateMax);
    }

    if (location) {
      query.location = new RegExp(location as string, 'i');
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [artists, total] = await Promise.all([
      ArtistProfile.find(query)
        .populate('genres')
        .populate('user', 'username email')
        .lean()
        .skip(skip)
        .limit(Number(limit)),
      ArtistProfile.countDocuments(query),
    ]);

    res.json({
      data: artists,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new AppError(`Error searching artist profiles: ${error.message}`, 500);
    }
    throw new AppError('Error searching artist profiles', 500);
  }
};
