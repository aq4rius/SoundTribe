import { Request, Response, NextFunction } from 'express';
import Application, { IApplication } from '../models/Application';
import EventPosting from '../models/Event';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { isPopulatedEventPosting, isPopulatedUser } from '../utils/typeGuards';
import { AppError } from '../utils/errorHandler';

export const submitApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventPostingId, artistProfileId, coverLetter, proposedRate, availability } = req.body;

    const eventPosting = await EventPosting.findById(eventPostingId);
    if (!eventPosting || eventPosting.status !== 'open') {
      throw new AppError('Invalid or closed event posting', 400);
    }

    const existingApplication = await Application.findOne({
      applicant: req.user?._id,
      eventPosting: eventPostingId
    });
    if (existingApplication) {
      throw new AppError('You have already applied to this event posting', 400);
    }

    const newApplication: IApplication = new Application({
      applicant: req.user?.id,
      artistProfile: artistProfileId,
      eventPosting: eventPostingId,
      coverLetter,
      proposedRate,
      availability
    });
    await newApplication.save();
    res.status(201).json(newApplication);
  } catch (error) {
    next(error);
  }
};

export const getApplication = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant artistProfile eventPosting');
    if (!application) {
      throw new AppError('Application not found', 404);
    }
    
    let isAuthorized = req.user?.role === UserRole.ADMIN;

    if (isPopulatedUser(application.applicant)) {
      isAuthorized = isAuthorized || application.applicant._id.toString() === req.user?.id;
    }

    if (isPopulatedEventPosting(application.eventPosting) && isPopulatedUser(application.eventPosting.postedBy)) {
      isAuthorized = isAuthorized || application.eventPosting.postedBy._id.toString() === req.user?.id;
    }

    if (!isAuthorized) {
      throw new AppError('Not authorized to view this application', 403);
    }
    
    res.json(application);
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id)
      .populate({
        path: 'eventPosting',
        populate: { 
          path: 'postedBy',
          select: '_id email'
        }
      });

    if (!application) {
      throw new AppError('Application not found', 404);
    }


    let isAuthorized = req.user?.role === UserRole.ADMIN;

    if (isPopulatedEventPosting(application.eventPosting)) {
      isAuthorized = isAuthorized || application.eventPosting.postedBy._id.toString() === req.user?.id;
    }

    if (!isAuthorized) {
      throw new AppError('Not authorized to update this application', 403);
    }
    
    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) {
    console.error('Update status error:', error);
    next(error);
  }
};




export const getApplicationsForEvent = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.eventId);
    if (!eventPosting) {
      throw new AppError('Event posting not found', 404);
    }
    if (eventPosting.postedBy.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      throw new AppError('Not authorized to view these applications', 403);
    }
    const applications = await Application.find({ eventPosting: req.params.eventId })
      .populate('applicant artistProfile');
    res.json(applications);
  } catch (error) {
    next(error);
  }
};

export const getUserApplications = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const applications = await Application.find({ applicant: req.user?.id })
      .populate('eventPosting');
    return res.json(applications || []);
  } catch (error: any) {
    console.error('=== getUserApplications error ===');
    console.error('Full error:', error);
    return res.status(500).json({ error: error?.message || 'Unknown error occurred' });
  }
};
