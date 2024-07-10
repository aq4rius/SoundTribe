import { Request, Response } from 'express';
import Application, { IApplication } from '../models/Application';
import JobPosting from '../models/JobPosting';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { isPopulatedJobPosting, isPopulatedUser } from '../utils/typeGuards';

export const submitApplication = async (req: AuthRequest, res: Response) => {
  try {
    const { jobPostingId, artistProfileId, coverLetter, proposedRate, availability } = req.body;

    const jobPosting = await JobPosting.findById(jobPostingId);
    if (!jobPosting || jobPosting.status !== 'open') {
      return res.status(400).send('Invalid or closed job posting');
    }

    const existingApplication = await Application.findOne({
      applicant: req.user?.id,
      jobPosting: jobPostingId
    });
    if (existingApplication) {
      return res.status(400).send('You have already applied to this job posting');
    }

    const newApplication: IApplication = new Application({
      applicant: req.user?.id,
      artistProfile: artistProfileId,
      jobPosting: jobPostingId,
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
      .populate('applicant artistProfile jobPosting');
    if (!application) {
      return res.status(404).send('Application not found');
    }
    
    let isAuthorized = req.user?.role === UserRole.ADMIN;

    if (isPopulatedUser(application.applicant)) {
      isAuthorized = isAuthorized || application.applicant._id.toString() === req.user?.id;
    }

    if (isPopulatedJobPosting(application.jobPosting) && isPopulatedUser(application.jobPosting.postedBy)) {
      isAuthorized = isAuthorized || application.jobPosting.postedBy._id.toString() === req.user?.id;
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
    const application = await Application.findById(req.params.id).populate('jobPosting');
    if (!application) {
      return res.status(404).send('Application not found');
    }
    
    let isAuthorized = req.user?.role === UserRole.ADMIN;

    if (isPopulatedJobPosting(application.jobPosting) && isPopulatedUser(application.jobPosting.postedBy)) {
      isAuthorized = isAuthorized || application.jobPosting.postedBy._id.toString() === req.user?.id;
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

export const getApplicationsForJob = async (req: AuthRequest, res: Response) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.jobId);
    if (!jobPosting) {
      return res.status(404).send('Job posting not found');
    }
    if (jobPosting.postedBy.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to view these applications');
    }
    const applications = await Application.find({ jobPosting: req.params.jobId })
      .populate('applicant artistProfile');
    res.json(applications);
  } catch (error) {
    res.status(500).send('Error fetching applications');
  }
};

export const getUserApplications = async (req: AuthRequest, res: Response) => {
  try {
    const applications = await Application.find({ applicant: req.user?.id })
      .populate('jobPosting');
    res.json(applications);
  } catch (error) {
    res.status(500).send('Error fetching your applications');
  }
};