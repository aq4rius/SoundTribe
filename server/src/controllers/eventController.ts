import { Request, Response } from 'express';
import EventPosting, { IEventPosting } from '../models/Event';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

export const createEventPosting = async (req: AuthRequest, res: Response) => {
  try {
    const newEventPosting: IEventPosting = new EventPosting({
      ...req.body,
      postedBy: req.user?.id
    });
    await newEventPosting.save();
    res.status(201).json(newEventPosting);
  } catch (error) {
    res.status(500).send('Error creating event posting');
  }
};

export const getEventPosting = async (req: Request, res: Response) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.id).populate('genres postedBy');
    if (!eventPosting) {
      return res.status(404).send('Event posting not found');
    }
    res.json(eventPosting);
  } catch (error) {
    res.status(500).send('Error fetching event posting');
  }
};

export const updateEventPosting = async (req: AuthRequest, res: Response) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.id);
    if (!eventPosting) {
      return res.status(404).send('Event posting not found');
    }
    if (eventPosting.postedBy.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to update this event posting');
    }

    const updatedEventPosting = await EventPosting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedEventPosting);
  } catch (error) {
    res.status(500).send('Error updating event posting');
  }
};

export const deleteEventPosting = async (req: AuthRequest, res: Response) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.id);
    if (!eventPosting) {
      return res.status(404).send('Event posting not found');
    }
    if (eventPosting.postedBy.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to delete this event posting');
    }

    await EventPosting.findByIdAndDelete(req.params.id);
    res.send('Event posting deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting event posting');
  }
};

export const searchEventPostings = async (req: Request, res: Response) => {
  try {
    const { genre, instrument, location, status } = req.query;
    let query: any = {};

    if (genre) query.genres = genre;
    if (instrument) query.requiredInstruments = { $in: [instrument] };
    if (location) query.location = new RegExp(location as string, 'i');
    if (status) query.status = status;

    const eventPostings = await EventPosting.find(query).populate('genres postedBy');
    res.json(eventPostings);
  } catch (error) {
    res.status(500).send('Error searching event postings');
  }
};

export const getUserEvents = async (req: AuthRequest, res: Response) => {
  try {
    const events = await EventPosting.find({ postedBy: req.user?._id })
      .populate('genres postedBy');
    res.json(events);
  } catch (error) {
    res.status(500).send('Error fetching user events');
  }
};