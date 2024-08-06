export interface User {
    id: string;
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

  export interface ArtistProfile {
    id: string;
    user: User;
    stageName: string;
    biography?: string;
    genres: string[];
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
    firstName: string;
    lastName: string;
  }