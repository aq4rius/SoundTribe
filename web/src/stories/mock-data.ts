/**
 * Shared mock data for Storybook stories.
 *
 * Uses plain objects that match component prop interfaces.
 * No Prisma runtime imports — these are pure data fixtures.
 */

// ─── Events ────────────────────────────────────────────────────────────────────

export const mockEvent = {
  id: 'evt-001',
  title: 'Sunset Music Festival',
  location: 'Austin, TX',
  description:
    'A three-day outdoor festival featuring artists from across genres. Open-air stages, food trucks, and collaborative jam sessions.',
  eventDate: new Date('2025-09-15T18:00:00Z'),
};

export const mockEventMinimal = {
  id: 'evt-002',
  title: 'Open Mic Night',
  location: null,
  description: null,
  eventDate: null,
};

export const mockEventLong = {
  id: 'evt-003',
  title: 'International Composition Workshop & Performance Series — Extended Edition',
  location: 'Sydney Opera House, Sydney, Australia',
  description:
    'A week-long series of workshops, masterclasses, and performances exploring contemporary composition techniques. Features guest lecturers from conservatories around the world.',
  eventDate: new Date('2025-12-01T10:00:00Z'),
};

// ─── Artists ───────────────────────────────────────────────────────────────────

export const mockArtist = {
  id: 'art-001',
  stageName: 'Luna Vox',
  location: 'Berlin, DE',
  biography:
    'Multi-instrumentalist and producer blending electronic textures with classical training. Has performed at venues across Europe and collaborated with orchestras and DJs alike.',
  profileImage: null,
};

export const mockArtistWithImage = {
  id: 'art-002',
  stageName: 'DJ Harmonic',
  location: 'Los Angeles, CA',
  biography: 'Electronic music producer specializing in ambient and downtempo.',
  profileImage: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg',
};

export const mockArtistMinimal = {
  id: 'art-003',
  stageName: 'Anon',
  location: null,
  biography: null,
  profileImage: null,
};

// ─── Notifications ─────────────────────────────────────────────────────────────

export const mockNotifications = [
  {
    id: 'notif-001',
    type: 'application_submitted',
    message: 'New application received for Sunset Music Festival',
    read: false,
    relatedEntityId: 'evt-001',
    relatedEntityType: 'event_posting',
    createdAt: new Date('2025-06-10T14:30:00Z'),
  },
  {
    id: 'notif-002',
    type: 'new_message',
    message: 'Luna Vox sent you a message',
    read: false,
    relatedEntityId: 'conv-001',
    relatedEntityType: 'conversation',
    createdAt: new Date('2025-06-10T13:15:00Z'),
  },
  {
    id: 'notif-003',
    type: 'application_status',
    message: 'Your application for Open Mic Night was accepted',
    read: true,
    relatedEntityId: 'evt-002',
    relatedEntityType: 'event_posting',
    createdAt: new Date('2025-06-09T09:00:00Z'),
  },
];
