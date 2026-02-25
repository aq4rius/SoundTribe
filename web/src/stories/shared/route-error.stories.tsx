import type { Meta, StoryObj } from '@storybook/react';
import { RouteError } from '@/components/shared/route-error';

const meta = {
  title: 'Shared/RouteError',
  component: RouteError,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof RouteError>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default error with message. */
export const Default: Story = {
  args: {
    error: new Error('Failed to load data from server.'),
    reset: () => {},
  },
};

/** Custom title for a specific route error. */
export const CustomTitle: Story = {
  args: {
    error: new Error('Event not found or has been removed.'),
    reset: () => {},
    title: 'Event unavailable',
  },
};
