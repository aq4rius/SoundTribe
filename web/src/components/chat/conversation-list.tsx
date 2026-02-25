'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useAblyChannel } from '@/hooks/use-ably-channel';
import {
  getConversationsAction,
  getMyEntitiesAction,
} from '@/actions/messages';
import { EntityType } from '@prisma/client';
import { Loader2, MessageSquarePlus, Search } from 'lucide-react';

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
  onNewConversation,
  selectedSender,
  onSelectSender,
}: ConversationListProps) {
  const { data: session } = useSession();
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [entities, setEntities] = useState<SenderEntity[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Load user's entities on mount
  useEffect(() => {
    async function loadEntities() {
      const result = await getMyEntitiesAction();
      if (result.success) {
        const all = [...result.data.artistProfiles, ...result.data.eventPostings];
        setEntities(all);
        if (all.length === 1) {
          onSelectSender(all[0]);
        }
      }
    }
    loadEntities();
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
    <div className="flex flex-col h-full border-r border-white/10">
      {/* Sender selector */}
      <div className="p-3 border-b border-white/10">
        <label className="text-xs font-medium text-white/50 uppercase tracking-wider block mb-1.5">
          Send as
        </label>
        <select
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={selectedSender?.id ?? ''}
          onChange={(e) => {
            const entity = entities.find((ent) => ent.id === e.target.value);
            onSelectSender(entity ?? null);
          }}
        >
          <option value="">Select profile or event...</option>
          {entities.map((ent) => (
            <option key={ent.id} value={ent.id}>
              {ent.type === 'artist_profile' ? '🎤' : '📅'} {ent.name}
            </option>
          ))}
        </select>
      </div>

      {/* Search + New conversation */}
      <div className="p-3 border-b border-white/10 flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/30" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button
          onClick={onNewConversation}
          disabled={!selectedSender}
          className="p-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary disabled:opacity-30 transition-colors"
          aria-label="New conversation"
        >
          <MessageSquarePlus className="h-5 w-5" />
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="h-5 w-5 animate-spin text-white/30" />
          </div>
        ) : !selectedSender ? (
          <div className="p-6 text-center text-sm text-white/40">
            Select a profile or event to view conversations.
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-white/40">
            No conversations yet. Message an artist or event organizer to get started.
          </div>
        ) : (
          filtered.map((conv) => (
            <button
              key={conv.id}
              onClick={() => onSelectConversation(conv)}
              className={`w-full text-left px-4 py-3 border-b border-white/5 transition-colors hover:bg-white/5 ${
                selectedConversationId === conv.id ? 'bg-white/10' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-lg shrink-0">
                  {conv.otherEntity.image ? (
                    <img
                      src={conv.otherEntity.image}
                      alt=""
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
                    <span className="text-xs text-white/40 truncate">
                      {conv.lastMessage?.content
                        ? conv.lastMessage.content
                        : conv.lastMessage?.attachmentUrl
                          ? '[Attachment]'
                          : 'Start a conversation...'}
                    </span>
                    {conv.lastMessageAt && (
                      <span className="text-xs text-white/30 shrink-0 ml-2">
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
