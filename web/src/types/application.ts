/**
 * Application types — mirrors server/src/models/Application.ts
 *
 * An Application is submitted by an artist to an event posting.
 */

export type ApplicationStatus = 'pending' | 'accepted' | 'rejected';

export interface IApplication {
  _id: string;
  applicant: string | { _id: string; username: string };
  artistProfile: string | { _id: string; stageName: string };
  eventPosting: string | { _id: string; title: string };
  coverLetter: string;
  status: ApplicationStatus;
  proposedRate?: number;
  availability: string[];
  createdAt: string;
  updatedAt: string;
}
