import express from 'express';
import User from '../models/User';
import bcrypt from 'bcrypt';
import { generateToken } from '../utils/jwtUtils';

const router = express.Router();

// Registration endpoint
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    try {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).send('User already exists');
      }
      const user = new User({ email, password });
      await user.save();
      const token = generateToken((user._id as import("bson").ObjectId).toString());
      res.status(201).send({ token });
    } catch (error) {
      res.status(500).send('Error registering new user');
    }
  });

// Login endpoint
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).send('Invalid email or password');
      }
      const token = generateToken((user._id as import("bson").ObjectId).toString());
      res.status(200).send({ token });
    } catch (error) {
      res.status(500).send('Error logging in');
    }
  });

export default router;