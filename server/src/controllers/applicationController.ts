import { Request, Response } from 'express';
import Application, { IApplication } from '../models/Application';
import EventPosting from '../models/Event';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { isPopulatedEventPosting, isPopulatedUser } from '../utils/typeGuards';

export const submitApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { eventPostingId, artistProfileId, coverLetter, proposedRate, availability } = req.body;

    const eventPosting = await EventPosting.findById(eventPostingId);
    if (!eventPosting || eventPosting.status !== 'open') {
      return res.status(400).send('Invalid or closed event posting');
    }

    const existingApplication = await Application.findOne({
      applicant: req.user?.id,
      eventPosting: eventPostingId
    });
    if (existingApplication) {
      return res.status(400).send('You have already applied to this event posting');
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
    res.status(500).send('Error submitting application');
  }
};

export const getApplication = async (req: AuthRequest, res: Response) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('applicant artistProfile eventPosting');
    if (!application) {
      return res.status(404).send('Application not found');
    }
    
    let isAuthorized = req.user?.role === UserRole.ADMIN;

    if (isPopulatedUser(application.applicant)) {
      isAuthorized = isAuthorized || application.applicant._id.toString() === req.user?.id;
    }

    if (isPopulatedEventPosting(application.eventPosting) && isPopulatedUser(application.eventPosting.postedBy)) {
      isAuthorized = isAuthorized || application.eventPosting.postedBy._id.toString() === req.user?.id;
    }

    if (!isAuthorized) {
      return res.status(403).send('Not authorized to view this application');
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).send('Error fetching application');
  }
};

export const updateApplicationStatus = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const application = await Application.findById(req.params.id).populate('eventPosting');
    if (!application) {
      return res.status(404).send('Application not found');
    }
    
    let isAuthorized = req.user?.role === UserRole.ADMIN;

    if (isPopulatedEventPosting(application.eventPosting) && isPopulatedUser(application.eventPosting.postedBy)) {
      isAuthorized = isAuthorized || application.eventPosting.postedBy._id.toString() === req.user?.id;
    }

    if (!isAuthorized) {
      return res.status(403).send('Not authorized to update this application');
    }
    
    application.status = status;
    await application.save();
    res.json(application);
  } catch (error) {
    res.status(500).send('Error updating application status');
  }
};

export const getApplicationsForEvent = async (req: AuthRequest, res: Response) => {
  try {
    const eventPosting = await EventPosting.findById(req.params.eventId);
    if (!eventPosting) {
      return res.status(404).send('Event posting not found');
    }
    if (eventPosting.postedBy.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to view these applications');
    }
    const applications = await Application.find({ eventPosting: req.params.eventId })
      .populate('applicant artistProfile');
    res.json(applications);
  } catch (error) {
    res.status(500).send('Error fetching applications');
  }
};

export const getUserApplications = async (req: AuthRequest, res: Response) => {
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
