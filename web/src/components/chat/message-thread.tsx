'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useAblyChannel, useAblyPresence } from '@/hooks/use-ably-channel';
import {
  getMessagesAction,
  markMessagesReadAction,
} from '@/actions/messages';
import MessageBubble from './message-bubble';
import MessageInput from './message-input';
import type { SenderEntity } from './conversation-list';
import { Loader2 } from 'lucide-react';
import type { EntityType, MessageStatus } from '@prisma/client';

interface MessageData {
  id: string;
  conversationId: string;
  senderEntityId: string;
  senderEntityType: EntityType;
  content: string | null;
  attachmentUrl: string | null;
  attachmentType: string | null;
  status: MessageStatus;
  reactions: Array<{ emoji: string; entityId: string; entityType: string }> | null;
  isDeleted: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

interface MessageThreadProps {
  conversationId: string;
  sender: SenderEntity;
  otherEntityName: string;
  otherEntityType: EntityType;
  otherEntityId: string;
}

export default function MessageThread({
  conversationId,
  sender,
  otherEntityName,
  otherEntityType,
  otherEntityId,
}: MessageThreadProps) {
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [, setTotal] = useState(0);

  const chatAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isInitialLoad = useRef(true);

  // Presence (typing indicators)
  const { members, updatePresence } = useAblyPresence(conversationId);
  const typingMembers = members.filter(
    (m) => m.clientId !== sender.id && (m.data as { typing?: boolean })?.typing,
  );
  const isOtherTyping = typingMembers.length > 0;

  // Load initial messages (last page)
  const loadMessages = useCallback(async () => {
    setLoading(true);
    isInitialLoad.current = true;

    // First get total to determine last page
    const countResult = await getMessagesAction(conversationId, 1, 1);
    if (!countResult.success) {
      setLoading(false);
      return;
    }

    const totalMessages = countResult.data.total;
    setTotal(totalMessages);
    const pageSize = 50;
    const lastPage = totalMessages > 0 ? Math.ceil(totalMessages / pageSize) : 1;

    const result = await getMessagesAction(conversationId, lastPage, pageSize);
    if (result.success) {
      setMessages(result.data.messages as unknown as MessageData[]);
      setPage(lastPage);
      setHasMore(lastPage > 1);
    }
    setLoading(false);
  }, [conversationId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Mark messages as read on mount and when conversationId changes
  useEffect(() => {
    if (conversationId && sender.id) {
      markMessagesReadAction(conversationId, sender.id);
    }
  }, [conversationId, sender.id]);

  // Scroll to bottom on initial load and new messages
  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' });
      isInitialLoad.current = false;
    }
  }, [messages]);

  // Subscribe to new messages via Ably
  useAblyChannel<{ message: MessageData; conversationId: string }>({
    channelName: `conversation:${conversationId}`,
    eventName: 'new-message',
    onMessage: (data) => {
      setMessages((prev) => {
        // Deduplicate
        if (prev.some((m) => m.id === data.message.id)) return prev;
        return [...prev, data.message];
      });
      // Scroll to bottom for new messages
      setTimeout(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
      // Mark as read if the message is from the other party
      if (data.message.senderEntityId !== sender.id) {
        markMessagesReadAction(conversationId, sender.id);
      }
    },
    enabled: !!conversationId,
  });

  // Subscribe to reaction updates
  useAblyChannel<{ messageId: string; reactions: MessageData['reactions'] }>({
    channelName: `conversation:${conversationId}`,
    eventName: 'reaction-update',
    onMessage: (data) => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === data.messageId ? { ...m, reactions: data.reactions } : m,
        ),
      );
    },
    enabled: !!conversationId,
  });

  // Subscribe to read receipts
  useAblyChannel<{ conversationId: string; readerEntityId: string }>({
    channelName: `conversation:${conversationId}`,
    eventName: 'messages-read',
    onMessage: (data) => {
      if (data.readerEntityId !== sender.id) {
        // The other party read our messages - update status
        setMessages((prev) =>
          prev.map((m) =>
            m.senderEntityId === sender.id && m.status !== 'read'
              ? { ...m, status: 'read' as MessageStatus }
              : m,
          ),
        );
      }
    },
    enabled: !!conversationId,
  });

  // Subscribe to message deletions
  useAblyChannel<{ messageId: string }>({
    channelName: `conversation:${conversationId}`,
    eventName: 'message-deleted',
    onMessage: (data) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    },
    enabled: !!conversationId,
  });

  // Infinite scroll — load more when scrolled to top
  const handleScroll = () => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;
    if (chatArea.scrollTop === 0 && hasMore && !loadingMore) {
      loadOlderMessages();
    }
  };

  const loadOlderMessages = async () => {
    if (page <= 1) return;
    setLoadingMore(true);
    const chatArea = chatAreaRef.current;
    const prevScrollHeight = chatArea?.scrollHeight ?? 0;

    const prevPage = page - 1;
    const result = await getMessagesAction(conversationId, prevPage, 50);
    if (result.success) {
      setMessages((prev) => [...(result.data.messages as unknown as MessageData[]), ...prev]);
      setPage(prevPage);
      setHasMore(prevPage > 1);
      // Preserve scroll position
      setTimeout(() => {
        if (chatArea) {
          chatArea.scrollTop = chatArea.scrollHeight - prevScrollHeight;
        }
      }, 0);
    }
    setLoadingMore(false);
  };

  // Group messages by date for date separators
  const groupedMessages = groupByDate(messages);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-sm">
            {otherEntityType === 'artist_profile' ? '🎤' : '📅'}
          </div>
          <div>
            <h3 className="font-medium text-sm">{otherEntityName}</h3>
            {isOtherTyping && (
              <p className="text-xs text-primary animate-pulse">typing...</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div
        ref={chatAreaRef}
        className="flex-1 overflow-y-auto px-4 py-3"
        onScroll={handleScroll}
      >
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-white/30" />
          </div>
        ) : (
          <>
            {loadingMore && (
              <div className="text-center py-2">
                <Loader2 className="h-4 w-4 animate-spin text-white/30 mx-auto" />
              </div>
            )}
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-white/40">
                No messages yet. Say hello!
              </div>
            ) : (
              groupedMessages.map(({ date, messages: dayMessages }) => (
                <div key={date}>
                  <div className="flex items-center justify-center my-4">
                    <span className="text-xs text-white/30 bg-white/5 px-3 py-1 rounded-full">
                      {date}
                    </span>
                  </div>
                  {dayMessages.map((msg, idx) => {
                    const isOwn = msg.senderEntityId === sender.id;
                    const showStatus =
                      isOwn && idx === dayMessages.length - 1;
                    return (
                      <MessageBubble
                        key={msg.id}
                        message={msg}
                        isOwn={isOwn}
                        showStatus={showStatus}
                        senderEntityId={sender.id}
                        senderEntityType={sender.type}
                      />
                    );
                  })}
                </div>
              ))
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Message input */}
      <MessageInput
        conversationId={conversationId}
        sender={sender}
        receiverEntityId={otherEntityId}
        receiverEntityType={otherEntityType}
        onTyping={updatePresence}
      />
    </div>
  );
}

function groupByDate(messages: MessageData[]) {
  const groups: { date: string; messages: MessageData[] }[] = [];
  let currentDate = '';

  for (const msg of messages) {
    const msgDate = new Date(msg.createdAt).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: msgDate, messages: [msg] });
    } else {
      groups[groups.length - 1].messages.push(msg);
    }
  }

  return groups;
}

export type { MessageData };
