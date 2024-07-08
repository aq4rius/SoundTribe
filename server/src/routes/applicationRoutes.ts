import express from 'express';
import Application, { IApplication } from '../models/Application';
import JobPosting, { IJobPosting } from '../models/JobPosting';
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';
import { isPopulatedJobPosting, isPopulatedUser } from '../utils/typeGuards';

const router = express.Router();

// Submit a new application
router.post('/', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const { jobPostingId, artistProfileId, coverLetter, proposedRate, availability } = req.body;

    // Check if the job posting exists and is still open
    const jobPosting = await JobPosting.findById(jobPostingId);
    if (!jobPosting || jobPosting.status !== 'open') {
      return res.status(400).send('Invalid or closed job posting');
    }

    // Check if the user has already applied to this job posting
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
});

// Get a specific application
router.get('/:id', authMiddleware, async (req: AuthRequest, res) => {
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
  });

// Update application status (for job posters or admins)
router.patch('/:id/status', authMiddleware, async (req: AuthRequest, res) => {
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
  });

// Get all applications for a specific job posting (for job posters or admins)
router.get('/job/:jobId', authMiddleware, async (req: AuthRequest, res) => {
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
});

// Get all applications by the current user
router.get('/my-applications', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const applications = await Application.find({ applicant: req.user?.id })
      .populate('jobPosting');
    res.json(applications);
  } catch (error) {
    res.status(500).send('Error fetching your applications');
  }
});

export default router;