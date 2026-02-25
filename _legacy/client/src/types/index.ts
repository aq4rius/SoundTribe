// client/src/types/index.ts

export interface User {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  location: string;
  bio: string;
  favoriteGenres: string[];
  preferredContentTypes: string[];
  notificationPreferences: {
    email: boolean;
    push: boolean;
  };
  privacySettings: {
    showEmail: boolean;
    showLocation: boolean;
  };
  profileCompleted?: boolean;
  artistProfileCompleted?: boolean;
}

export interface Genre {
  _id: string;
  name: string;
}

export interface Event {
  _id: string;
  postedBy: User;
  title: string;
  description: string;
  genres: Genre[];
  requiredInstruments: string[];
  location: string;
  eventDate: Date;
  duration: number;
  paymentAmount: number;
  paymentType: 'fixed' | 'hourly';
  requiredExperience: number;
  applicationDeadline: Date;
  status: 'open' | 'closed' | 'filled';
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistProfile {
  _id: string;
  user: User;
  stageName: string;
  biography?: string;
  genres: Genre[];
  instruments: string[];
  yearsOfExperience: number;
  location: string;
  websiteUrl?: string;
  socialMediaLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
  profileImage?: string;
  portfolioItems?: Array<{
    title: string;
    description: string;
    mediaUrl: string;
    mediaType: 'audio' | 'video' | 'image';
    isEditing?: boolean;
  }>;
  availability: {
    isAvailable: boolean;
    availableDates?: Date[];
  };
  ratePerHour?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData extends LoginData {
  username: string;
}

export interface Application {
  _id: string;
  applicant: User;
  artistProfile: ArtistProfile;
  eventPosting: Event;
  coverLetter: string;
  status: 'pending' | 'accepted' | 'rejected';
  proposedRate?: number;
  availability: Date[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ArtistFilterType {
  searchTerm: string;
  selectedGenres: string[];
  instruments: string[];
  experienceMin: number;
  rateMin: number;
  rateMax: number;
  location: string;
}

export interface EventFilterType {
  searchTerm: string;
  selectedGenres: string[];
  instruments: string[];
  location: string;
  dateFrom: string;
  dateTo: string;
  paymentMin: number;
  paymentMax: number;
  paymentType: '' | 'fixed' | 'hourly';
  status: string;
}

// Centralized types for API and component props

export interface ApiError {
  message: string;
  status?: number;
}

// Add more types as needed for API responses, requests, and component props
