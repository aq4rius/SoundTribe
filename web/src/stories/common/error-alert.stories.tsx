import type { Meta, StoryObj } from '@storybook/react';
import ErrorAlert from '@/components/common/error-alert';

const meta = {
  title: 'Common/ErrorAlert',
  component: ErrorAlert,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ErrorAlert>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Basic error alert without a close button. */
export const Default: Story = {
  args: {
    message: 'Something went wrong. Please try again later.',
  },
};

/** Error alert with a close button. */
export const Dismissible: Story = {
  args: {
    message: 'Invalid form input. Please check the highlighted fields.',
    onClose: () => {},
  },
};

/** Long error message to test wrapping. */
export const LongMessage: Story = {
  args: {
    message:
      'An unexpected server error occurred while processing your request. The development team has been notified. Please try refreshing the page or contact support if the issue persists.',
    onClose: () => {},
  },
};
