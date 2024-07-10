import { Request, Response } from 'express';
import JobPosting, { IJobPosting } from '../models/JobPosting';
import { AuthRequest } from '../middleware/authMiddleware';
import { UserRole } from '../models/User';

export const createJobPosting = async (req: AuthRequest, res: Response) => {
  try {
    const newJobPosting: IJobPosting = new JobPosting({
      ...req.body,
      postedBy: req.user?.id
    });
    await newJobPosting.save();
    res.status(201).json(newJobPosting);
  } catch (error) {
    res.status(500).send('Error creating job posting');
  }
};

export const getJobPosting = async (req: Request, res: Response) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id).populate('genres postedBy');
    if (!jobPosting) {
      return res.status(404).send('Job posting not found');
    }
    res.json(jobPosting);
  } catch (error) {
    res.status(500).send('Error fetching job posting');
  }
};

export const updateJobPosting = async (req: AuthRequest, res: Response) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id);
    if (!jobPosting) {
      return res.status(404).send('Job posting not found');
    }
    if (jobPosting.postedBy.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to update this job posting');
    }

    const updatedJobPosting = await JobPosting.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedJobPosting);
  } catch (error) {
    res.status(500).send('Error updating job posting');
  }
};

export const deleteJobPosting = async (req: AuthRequest, res: Response) => {
  try {
    const jobPosting = await JobPosting.findById(req.params.id);
    if (!jobPosting) {
      return res.status(404).send('Job posting not found');
    }
    if (jobPosting.postedBy.toString() !== req.user?.id && req.user?.role !== UserRole.ADMIN) {
      return res.status(403).send('Not authorized to delete this job posting');
    }

    await JobPosting.findByIdAndDelete(req.params.id);
    res.send('Job posting deleted successfully');
  } catch (error) {
    res.status(500).send('Error deleting job posting');
  }
};

export const searchJobPostings = async (req: Request, res: Response) => {
  try {
    const { genre, instrument, location, status } = req.query;
    let query: any = {};

    if (genre) query.genres = genre;
    if (instrument) query.requiredInstruments = { $in: [instrument] };
    if (location) query.location = new RegExp(location as string, 'i');
    if (status) query.status = status;

    const jobPostings = await JobPosting.find(query).populate('genres postedBy');
    res.json(jobPostings);
  } catch (error) {
    res.status(500).send('Error searching job postings');
  }
};