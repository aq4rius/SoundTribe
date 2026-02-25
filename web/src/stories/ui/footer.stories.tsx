import type { Meta, StoryObj } from '@storybook/react';
import Footer from '@/components/ui/footer';

const meta = {
  title: 'UI/Footer',
  component: Footer,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Footer>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Default footer with copyright notice. */
export const Default: Story = {};
