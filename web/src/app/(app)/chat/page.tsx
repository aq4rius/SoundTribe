'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import ConversationList from '@/components/chat/conversation-list';
import MessageThread from '@/components/chat/message-thread';
import EntitySelector from '@/components/chat/entity-selector';
import type { ConversationItem, SenderEntity } from '@/components/chat/conversation-list';
import { ArrowLeft, MessageSquare, Loader2 } from 'lucide-react';

function ChatContent() {
  const searchParams = useSearchParams();
  const initialConversationId = searchParams.get('conversationId');
  const recipientId = searchParams.get('recipientId');

  const [selectedSender, setSelectedSender] = useState<SenderEntity | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<ConversationItem | null>(null);
  const [showEntitySelector, setShowEntitySelector] = useState(false);
  const [mobileShowThread, setMobileShowThread] = useState(!!initialConversationId);

  // Open entity selector on mount when navigated from an artist/event profile
  useEffect(() => {
    if (recipientId && !initialConversationId) {
      setShowEntitySelector(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSelectConversation = useCallback((conversation: ConversationItem) => {
    setSelectedConversation(conversation);
    setMobileShowThread(true);
  }, []);

  const handleSelectSender = useCallback((sender: SenderEntity | null) => {
    setSelectedSender(sender);
    setSelectedConversation(null);
  }, []);

  const handleBackToList = () => {
    setMobileShowThread(false);
  };

  return (
    <div className="max-w-6xl mx-auto h-[calc(100vh-5rem)]">
      <div className="flex h-full border border-white/10 rounded-xl overflow-hidden bg-zinc-900/50">
        {/* Conversation list — hidden on mobile when thread is open */}
        <div
          className={`w-full md:w-80 lg:w-96 shrink-0 ${
            mobileShowThread ? 'hidden md:flex md:flex-col' : 'flex flex-col'
          }`}
        >
          <ConversationList
            selectedConversationId={selectedConversation?.id ?? initialConversationId}
            onSelectConversation={handleSelectConversation}
            onNewConversation={() => setShowEntitySelector(true)}
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
              <div className="md:hidden border-b border-white/10 px-3 py-2">
                <button
                  onClick={handleBackToList}
                  className="flex items-center gap-1 text-sm text-white/60 hover:text-white/80 min-h-[44px] min-w-[44px]"
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
            <div className="flex-1 flex flex-col items-center justify-center text-white/30">
              <MessageSquare className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="text-sm mt-1">
                Choose a conversation from the list or start a new one.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Entity selector modal for new conversations */}
      <EntitySelector
        isOpen={showEntitySelector}
        onClose={() => setShowEntitySelector(false)}
        onSelect={(entity) => {
          // For "new conversation" — create a temporary conversation item
          // The actual conversation is created on first message send
          setSelectedConversation({
            id: `new-${entity.id}`,
            otherEntity: entity,
            lastMessage: null,
            unreadCount: 0,
            lastMessageAt: null,
          } as ConversationItem);
          setShowEntitySelector(false);
          setMobileShowThread(true);
        }}
        title="Who do you want to message?"
      />
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
