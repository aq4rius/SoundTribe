import { Request, Response } from 'express';
import Genre, { IGenre } from '../models/Genre';

export const getAllGenres = async (req: Request, res: Response) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (error) {
    res.status(500).send('Server error');
  }
};

export const createGenre = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const newGenre = new Genre({ name, description });
    await newGenre.save();
    res.status(201).json(newGenre);
  } catch (error) {
    res.status(500).send('Error creating new genre');
  }
};

export const updateGenre = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;
    const genre = await Genre.findByIdAndUpdate(req.params.id, { name, description }, { new: true });
    if (!genre) {
      return res.status(404).send('Genre not found');
    }
    res.json(genre);
  } catch (error) {
    res.status(500).send('Error updating genre');
  }
};

export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) {
      return res.status(404).send('Genre not found');
    }
    res.send('Genre deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting genre');
  }
};