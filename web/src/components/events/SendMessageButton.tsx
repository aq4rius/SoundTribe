'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface SendMessageButtonProps {
  event: {
    _id: string;
    title: string;
    postedBy?: {
      _id?: string;
      email?: string;
      username?: string;
    };
  };
}

const SendMessageButton: React.FC<SendMessageButtonProps> = ({ event }) => {
  const { user } = useAuth();
  const router = useRouter();

  // Check if current user owns this event
  const isOwnEvent = user && event.postedBy && (
    user.email === event.postedBy.email || 
    user.id === event.postedBy._id ||
    user.id === event.postedBy._id
  );

  // Don't show button if user owns the event or user is not logged in
  if (!user || isOwnEvent) {
    return null;
  }

  const handleSendMessage = () => {
    const params = new URLSearchParams({
      receiverId: event._id,
      receiverType: 'Event',
      receiverName: event.title
    });
    
    router.push(`/chat?${params.toString()}`);
  };

  return (
    <button 
      onClick={handleSendMessage}
      className="px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white font-semibold transition"
    >
      Send Message
    </button>
  );
};

export default SendMessageButton;