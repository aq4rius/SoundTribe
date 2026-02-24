import { Suspense } from 'react';
import Chat from '@/components/common/chat';

export default function ChatPage() {
  return (
    <div className="max-w-4xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-6">Messenger</h1>
      <Suspense fallback={<div className="text-center text-white/60">Loading chat...</div>}>
        <Chat />
      </Suspense>
    </div>
  );
}
