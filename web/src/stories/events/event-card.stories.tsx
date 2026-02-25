import type { Meta, StoryObj } from '@storybook/react';
import EventCard from '@/components/events/event-card';
import { mockEvent, mockEventMinimal, mockEventLong } from '../mock-data';

const meta = {
  title: 'Events/EventCard',
  component: EventCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EventCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default compact card linking to the event detail page. */
export const Default: Story = {
  args: { event: mockEvent },
};

/** Full mode shows description and disables the wrapping link. */
export const FullMode: Story = {
  args: { event: mockEvent, mode: 'full' },
};

/** Card with null location and date — tests fallback text. */
export const MissingData: Story = {
  args: { event: mockEventMinimal },
};

/** Very long title and description — tests text overflow. */
export const LongContent: Story = {
  args: { event: mockEventLong, mode: 'full' },
};

/** Full mode with minimal data. */
export const FullModeMinimal: Story = {
  args: { event: mockEventMinimal, mode: 'full' },
};
