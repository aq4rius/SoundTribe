import type { Meta, StoryObj } from '@storybook/react';
import Pagination from '@/components/common/pagination';

const meta = {
  title: 'Common/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

/** First page of many. Previous button is disabled. */
export const FirstPage: Story = {
  args: {
    currentPage: 1,
    totalPages: 5,
    onPageChange: () => {},
  },
};

/** Middle page — both Previous and Next are enabled. */
export const MiddlePage: Story = {
  args: {
    currentPage: 3,
    totalPages: 5,
    onPageChange: () => {},
  },
};

/** Last page — Next button is disabled. */
export const LastPage: Story = {
  args: {
    currentPage: 5,
    totalPages: 5,
    onPageChange: () => {},
  },
};

/** Single page — both buttons disabled, only one page indicator. */
export const SinglePage: Story = {
  args: {
    currentPage: 1,
    totalPages: 1,
    onPageChange: () => {},
  },
};
