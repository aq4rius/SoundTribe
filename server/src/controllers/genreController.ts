import { Request, Response, NextFunction } from 'express';
import Genre, { IGenre } from '../models/Genre';
import { AppError } from '../utils/errorHandler';

export const getAllGenres = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (error) {
    next(new AppError('Server error', 500));
  }
};

export const createGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const newGenre = new Genre({ name, description });
    await newGenre.save();
    res.status(201).json(newGenre);
  } catch (error) {
    next(new AppError('Error creating new genre', 500));
  }
};

export const updateGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description } = req.body;
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true },
    );
    if (!genre) {
      throw new AppError('Genre not found', 404);
    }
    res.json(genre);
  } catch (error) {
    next(new AppError('Error updating genre', 500));
  }
};

export const deleteGenre = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) {
      throw new AppError('Genre not found', 404);
    }
    res.status(200).send('Genre deleted successfully');
  } catch (error) {
    next(new AppError('Error deleting genre', 500));
  }
};
