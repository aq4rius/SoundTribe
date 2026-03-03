'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import {
  getConversationsAction,
  getMyEntitiesAction,
} from '@/actions/messages';
import { EntityType } from '@prisma/client';
import { Loader2, Search } from 'lucide-react';

interface ConversationItem {
  id: string;
  otherEntity: {
    id: string;
    type: EntityType;
    name: string;
    image: string | null;
  };
  lastMessage: {
    id: string;
    content: string | null;
    attachmentUrl: string | null;
    createdAt: Date;
  } | null;
  unreadCount: number;
  lastMessageAt: Date | null;
}

interface SenderEntity {
  id: string;
  name: string;
  type: EntityType;
  image: string | null;
}

interface ConversationListProps {
  selectedConversationId: string | null;
  onSelectConversation: (conversation: ConversationItem) => void;
  onNewConversation: () => void;
  selectedSender: SenderEntity | null;
  onSelectSender: (sender: SenderEntity | null) => void;
}

export default function ConversationList({
  selectedConversationId,
  onSelectConversation,
  // onNewConversation is kept in the interface for API compatibility
  selectedSender,
  onSelectSender,
}: ConversationListProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Auto-select the user's first entity on mount
  useEffect(() => {
    async function autoSelectSender() {
      const result = await getMyEntitiesAction();
      if (result.success) {
        const { artistProfiles, eventPostings } = result.data;
        onSelectSender(artistProfiles[0] ?? eventPostings[0] ?? null);
      } else {
        onSelectSender(null);
      }
    }
    autoSelectSender();
  }, [onSelectSender]);

  // Load conversations when sender changes
  const loadConversations = useCallback(async () => {
    if (!selectedSender) {
      setConversations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const result = await getConversationsAction(
      selectedSender.id,
      selectedSender.type,
    );
    if (result.success) {
      setConversations(result.data);
    }
    setLoading(false);
  }, [selectedSender]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Subscribe to real-time notifications to update unread counts
  useAblyChannel<{ type: string; conversationId: string }>({
    channelName: `notifications:${session?.user?.id ?? ''}`,
    eventName: 'new-notification',
    onMessage: (data) => {
      if (data.type === 'new_message') {
        // If the message is for a conversation that's not selected, bump unread
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === data.conversationId && conv.id !== selectedConversationId
              ? { ...conv, unreadCount: conv.unreadCount + 1 }
              : conv,
          ),
        );
        // Also re-fetch to get updated lastMessage
        loadConversations();
      }
    },
    enabled: !!session?.user?.id,
  });

  const filtered = conversations.filter((conv) =>
    conv.otherEntity.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col h-full border-r border-border">
      {/* Search */}
      <div className="p-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground/50" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-muted/50 border border-input rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/40" />
          </div>
        ) : !selectedSender ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">No profile found</p>
            <p>Create an artist profile to start messaging.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No conversations yet. Message an artist or event organizer to get started.
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full text-left px-4 py-3 border-b border-border/50 transition-colors hover:bg-muted/50 ${
                selectedConversationId === conv.id ? 'bg-primary/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg shrink-0">
                  {conv.otherEntity.image ? (
                    <Image
                      src={conv.otherEntity.image}
                      alt=""
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    conv.otherEntity.type === 'artist_profile' ? '🎤' : '📅'
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm truncate">
                      {conv.otherEntity.name}
                    </span>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-primary text-white rounded-full shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground/70 truncate">
                      {conv.lastMessage?.content
                        ? conv.lastMessage.content
                        : conv.lastMessage?.attachmentUrl
                          ? '[Attachment]'
                          : 'Start a conversation...'}
                    </span>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-muted-foreground/50 shrink-0 ml-2">
                        {formatTime(new Date(conv.lastMessageAt))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return 'Yesterday';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}

export type { ConversationItem, SenderEntity };
