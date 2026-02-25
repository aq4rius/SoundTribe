import { Request, Response, NextFunction } from 'express';
import EventPosting, { IEventPosting } from '../models/Event';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { AppError } from '../utils/errorHandler';

export const createEventPosting = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const newEventPosting: IEventPosting = new EventPosting({
      ...req.body,
      postedBy: req.user?.id,
    });
    await newEventPosting.save();
    res.status(201).json(newEventPosting);
  } catch (error) {
    next(error);
  }
};

export const getEventPosting = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.id).populate('genres postedBy');
    if (!eventPosting) {
      throw new AppError('Event posting not found', 404);
    }
    res.json(eventPosting);
  } catch (error) {
    next(error);
  }
};

export const updateEventPosting = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.id);
    if (!eventPosting) {
      throw new AppError('Event posting not found', 404);
    }
    if (eventPosting.postedBy.toString() !== req.user?.id && !(req.user?.roles && req.user.roles.includes(UserRole.ADMIN))) {
      throw new AppError('Not authorized to update this event posting', 403);
    }

    const updatedEventPosting = await EventPosting.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json(updatedEventPosting);
  } catch (error) {
    next(error);
  }
};

export const deleteEventPosting = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.id);
    if (!eventPosting) {
      throw new AppError('Event posting not found', 404);
    }
    if (eventPosting.postedBy.toString() !== req.user?.id && !(req.user?.roles && req.user.roles.includes(UserRole.ADMIN))) {
      throw new AppError('Not authorized to delete this event posting', 403);
    }

    await EventPosting.findByIdAndDelete(req.params.id);
    res.send('Event posting deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const searchEventPostings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      searchTerm,
      selectedGenres,
      instruments,
      location,
      dateFrom,
      dateTo,
      paymentMin,
      paymentMax,
      paymentType,
      status,
      page = 1,
      limit = 9,
    } = req.query;

    let query: any = {};

    if (searchTerm) {
      query.$or = [
        { title: new RegExp(searchTerm as string, 'i') },
        { description: new RegExp(searchTerm as string, 'i') },
      ];
    }

    if (selectedGenres) {
      const genreIds = Array.isArray(selectedGenres) ? selectedGenres : [selectedGenres];
      query.genres = { $in: genreIds };
    }

    if (instruments) {
      query.requiredInstruments = {
        $in: Array.isArray(instruments) ? instruments : [instruments],
      };
    }

    if (location) {
      query.location = new RegExp(location as string, 'i');
    }

    if (dateFrom || dateTo) {
      query.eventDate = {};
      if (dateFrom) query.eventDate.$gte = new Date(dateFrom as string);
      if (dateTo) query.eventDate.$lte = new Date(dateTo as string);
    }

    if (paymentMin || paymentMax) {
      query.paymentAmount = {};
      if (paymentMin) query.paymentAmount.$gte = Number(paymentMin);
      if (paymentMax) query.paymentAmount.$lte = Number(paymentMax);
    }

    if (paymentType) {
      query.paymentType = paymentType;
    }

    if (status) {
      query.status = status;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
      EventPosting.find(query)
        .populate('genres')
        .populate('postedBy', 'username email')
        .lean()
        .skip(skip)
        .limit(Number(limit)),
      EventPosting.countDocuments(query),
    ]);

    res.json({
      data: events,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error: any) {
    next(new AppError(`Error searching event postings: ${error.message || 'Unknown error'}`, 500));
  }
};

export const getUserEvents = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const events = await EventPosting.find({ postedBy: req.user?._id }).populate('genres postedBy');
    res.json(events);
  } catch (error) {
    next(error);
  }
};
