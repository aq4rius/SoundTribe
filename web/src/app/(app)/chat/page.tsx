'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ConversationList from '@/components/chat/conversation-list';
import MessageThread from '@/components/chat/message-thread';
import type { ConversationItem, SenderEntity } from '@/components/chat/conversation-list';
import type { EntityType } from '@prisma/client';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

function ChatContent() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get('conversationId');
  const recipientId = searchParams.get('recipientId');
  const recipientType = searchParams.get('recipientType');
  const recipientName = searchParams.get('recipientName');

  const [selectedSender, setSelectedSender] = useState<SenderEntity | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [mobileShowThread, setMobileShowThread] = useState(!!initialConversationId);

  // When navigated from an artist profile, auto-open a new conversation thread
  useEffect(() => {
    if (recipientId && !initialConversationId) {
      const tempConv: ConversationItem = {
        id: `new-${recipientId}`,
        otherEntity: {
          id: recipientId,
          type: (recipientType ?? 'artist_profile') as EntityType,
          name: recipientName ? decodeURIComponent(recipientName) : 'Artist',
          image: null,
        },
        lastMessage: null,
        unreadCount: 0,
        lastMessageAt: null,
      };
      setSelectedConversation(tempConv);
      setMobileShowThread(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationItem) => {
    setSelectedConversation(conversation);
    setMobileShowThread(true);
  }, []);

  const handleSelectSender = useCallback((sender: SenderEntity | null) => {
    setSelectedSender(sender);
    // Don't reset selectedConversation — sender is auto-selected once on mount
  }, []);

  const handleBackToList = () => {
    setMobileShowThread(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-5rem)]">
      <div className="flex h-full border border-border rounded-xl overflow-hidden bg-card">
        {/* Conversation list — hidden on mobile when thread is open */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 ${
            mobileShowThread ? 'hidden md:flex md:flex-col' : 'flex flex-col'
          }`}
        >
          <ConversationList
            selectedConversationId={selectedConversation?.id ?? initialConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={() => {}}
            selectedSender={selectedSender}
            onSelectSender={handleSelectSender}
          />
        </div>

        {/* Message thread — full width on mobile, flex on desktop */}
        <div
          className={`flex-1 flex flex-col ${
            mobileShowThread ? '' : 'hidden md:flex'
          }`}
        >
          {selectedConversation && selectedSender ? (
            <>
              {/* Mobile back button */}
              <div className="md:hidden border-b border-border px-3 py-2">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px]"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              </div>
              <MessageThread
                conversationId={selectedConversation.id}
                sender={selectedSender}
                otherEntityName={selectedConversation.otherEntity.name}
                otherEntityType={selectedConversation.otherEntity.type}
                otherEntityId={selectedConversation.otherEntity.id}
              />
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground px-6 text-center">
              <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
              <p className="text-lg font-medium text-foreground">No conversation selected</p>
              <p className="text-sm mt-1 mb-6 max-w-xs">
                Pick a conversation from the list, or browse artists to start messaging.
              </p>
              <Button variant="outline" size="sm" asChild>
                <Link href="/artists">Browse Artists</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto h-[calc(100vh-5rem)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white/40" />
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
