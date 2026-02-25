import type { Meta, StoryObj } from '@storybook/react';
import ArtistCard from '@/components/artists/artist-card';
import { mockArtist, mockArtistWithImage, mockArtistMinimal } from '../mock-data';

const meta = {
  title: 'Artists/ArtistCard',
  component: ArtistCard,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ArtistCard>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default compact card with fallback avatar initial. */
export const Default: Story = {
  args: { artist: mockArtist },
};

/** Card with a Cloudinary profile image. */
export const WithImage: Story = {
  args: { artist: mockArtistWithImage },
};

/** Full mode shows biography text. */
export const FullMode: Story = {
  args: { artist: mockArtist, mode: 'full' },
};

/** Card with null location and no bio — tests fallback text. */
export const MissingData: Story = {
  args: { artist: mockArtistMinimal },
};

/** Full mode with minimal data. */
export const FullModeMinimal: Story = {
  args: { artist: mockArtistMinimal, mode: 'full' },
};
