export interface User {
    _id: string;
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
  