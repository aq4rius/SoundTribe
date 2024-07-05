import express from 'express';
import Genre, { IGenre } from '../models/Genre';
import { authMiddleware, roleMiddleware } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

const router = express.Router();

// Get all genres
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find();
    res.json(genres);
  } catch (error) {
    res.status(500).send('Server error');
  }
});

// Create a new genre (admin only)
router.post('/', authMiddleware, roleMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    const { name, description } = req.body;
    const newGenre = new Genre({ name, description });
    await newGenre.save();
    res.status(201).json(newGenre);
  } catch (error) {
    res.status(500).send('Error creating new genre');
  }
});

// Update a genre (admin only)
router.put('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), async (req, res) => {
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
});

// Delete a genre (admin only)
router.delete('/:id', authMiddleware, roleMiddleware(UserRole.ADMIN), async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id);
    if (!genre) {
      return res.status(404).send('Genre not found');
    }
    res.send('Genre deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting genre');
  }
});

export default router;