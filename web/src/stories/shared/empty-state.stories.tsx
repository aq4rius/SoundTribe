import type { Meta, StoryObj } from '@storybook/react';
import { EmptyState } from '@/components/shared/empty-state';

const meta = {
  title: 'Shared/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof EmptyState>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Minimal empty state — title only. */
export const TitleOnly: Story = {
  args: {
    title: 'No results found',
  },
};

/** With description text. */
export const WithDescription: Story = {
  args: {
    title: 'No events yet',
    description: 'Check back later or create your own event to get started.',
  },
};

/** With an icon element. */
export const WithIcon: Story = {
  args: {
    title: 'No notifications',
    description: "You're all caught up!",
    icon: <span className="text-4xl">🔔</span>,
  },
};

/** Full empty state with icon, description, and action button. */
export const WithAction: Story = {
  args: {
    title: 'No artists found',
    description: 'Try adjusting your search filters.',
    icon: <span className="text-4xl">🎵</span>,
    action: (
      <button className="px-4 py-2 bg-fuchsia-600 text-white rounded-lg text-sm font-medium">
        Browse all artists
      </button>
    ),
  },
};
