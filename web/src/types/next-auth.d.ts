import type { DefaultSession } from 'next-auth';
import type { UserRole } from '@prisma/client';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      roles: UserRole[];
      onboardingComplete: boolean;
      onboardingStep: number;
      username: string;
      profileImage: string | null;
    } & DefaultSession['user'];
  }

  interface User {
    id: string;
    roles: UserRole[];
    onboardingComplete: boolean;
    onboardingStep: number;
    username: string;
    profileImage: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    roles: UserRole[];
    onboardingComplete: boolean;
    onboardingStep: number;
    username: string;
    profileImage: string | null;
  }
}
