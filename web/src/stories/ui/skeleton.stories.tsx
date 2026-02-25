import type { Meta, StoryObj } from '@storybook/react';
import { Skeleton } from '@/components/ui/skeleton';
import { EventCardSkeleton } from '@/components/shared/skeletons/event-card-skeleton';
import { ArtistCardSkeleton } from '@/components/shared/skeletons/artist-card-skeleton';
import { ApplicationCardSkeleton } from '@/components/shared/skeletons/application-card-skeleton';
import { NotificationItemSkeleton } from '@/components/shared/skeletons/notification-item-skeleton';

// ─── Base Skeleton ─────────────────────────────────────────────────────────────

const skeletonMeta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Skeleton>;

export default skeletonMeta;
type Story = StoryObj<typeof skeletonMeta>;

/** Small inline skeleton element. */
export const Default: Story = {
  args: { className: 'h-4 w-32' },
};

/** Large block skeleton. */
export const LargeBlock: Story = {
  args: { className: 'h-24 w-full rounded-xl' },
};

// ─── Card Skeletons ────────────────────────────────────────────────────────────

/** Event card loading skeleton. */
export const EventCard: Story = {
  render: () => (
    <div className="max-w-md">
      <EventCardSkeleton />
    </div>
  ),
};

/** Artist card loading skeleton. */
export const ArtistCard: Story = {
  render: () => (
    <div className="max-w-md">
      <ArtistCardSkeleton />
    </div>
  ),
};

/** Application card loading skeleton. */
export const ApplicationCard: Story = {
  render: () => (
    <div className="max-w-md">
      <ApplicationCardSkeleton />
    </div>
  ),
};

/** Notification item loading skeleton. */
export const NotificationItem: Story = {
  render: () => <NotificationItemSkeleton />,
};
