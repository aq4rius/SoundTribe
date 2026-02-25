'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import type { MessageData } from './message-thread';
import { addReactionAction, deleteMessageAction } from '@/actions/messages';
import type { EntityType, MessageStatus } from '@prisma/client';
import { Check, CheckCheck, Clock, Copy, SmilePlus, Trash2 } from 'lucide-react';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '🎵', '🔥', '👏', '😮', '😢'];

interface MessageBubbleProps {
  message: MessageData;
  isOwn: boolean;
  showStatus: boolean;
  senderEntityId: string;
  senderEntityType: EntityType;
}

export default function MessageBubble({
  message,
  isOwn,
  showStatus,
  senderEntityId,
  senderEntityType,
}: MessageBubbleProps) {
  const [showReactions, setShowReactions] = useState(false);
  const [showContextMenu, setShowContextMenu] = useState(false);
  const contextRef = useRef<HTMLDivElement>(null);

  const handleReaction = async (emoji: string) => {
    await addReactionAction(message.id, emoji, senderEntityId, senderEntityType);
    setShowReactions(false);
  };

  const handleDelete = async () => {
    if (window.confirm('Delete this message?')) {
      await deleteMessageAction(message.id);
    }
    setShowContextMenu(false);
  };

  const handleCopy = () => {
    if (message.content) {
      navigator.clipboard.writeText(message.content);
    }
    setShowContextMenu(false);
  };

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const reactions = (message.reactions ?? []) as Array<{
    emoji: string;
    entityId: string;
    entityType: string;
  }>;

  // Group reactions by emoji
  const reactionCounts = reactions.reduce(
    (acc, r) => {
      acc[r.emoji] = (acc[r.emoji] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div
      className={`flex mb-2 ${isOwn ? 'justify-end' : 'justify-start'}`}
      onContextMenu={(e) => {
        e.preventDefault();
        setShowContextMenu(true);
      }}
    >
      <div className={`relative max-w-[70%] group ${isOwn ? 'items-end' : 'items-start'}`}>
        {/* Attachment */}
        {message.attachmentUrl && (
          <div className="mb-1">
            {message.attachmentType?.startsWith('image/') ||
            message.attachmentUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <Image
                src={message.attachmentUrl}
                alt="attachment"
                width={320}
                height={192}
                className="max-w-full max-h-48 rounded-lg border border-white/10"
              />
            ) : message.attachmentType?.startsWith('audio/') ||
              message.attachmentUrl.match(/\.(mp3|wav|ogg|m4a)$/i) ? (
              <audio
                controls
                src={message.attachmentUrl}
                className="max-w-full"
              />
            ) : (
              <a
                href={message.attachmentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-primary hover:bg-white/10 transition-colors"
              >
                📎 Download file
              </a>
            )}
          </div>
        )}

        {/* Message bubble */}
        {message.content && (
          <div
            className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
              isOwn
                ? 'bg-primary text-white rounded-br-md'
                : 'bg-white/10 text-white/90 rounded-bl-md'
            }`}
          >
            {message.content}
          </div>
        )}

        {/* Reactions */}
        {Object.keys(reactionCounts).length > 0 && (
          <div className={`flex gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
            {Object.entries(reactionCounts).map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-xs hover:bg-white/10 transition-colors"
              >
                {emoji} {count > 1 && <span className="text-white/50">{count}</span>}
              </button>
            ))}
          </div>
        )}

        {/* Time + Status */}
        <div className={`flex items-center gap-1 mt-0.5 ${isOwn ? 'justify-end' : 'justify-start'}`}>
          <span className="text-[10px] text-white/30">{time}</span>
          {showStatus && <StatusIcon status={message.status} />}
        </div>

        {/* Hover action: reaction picker trigger */}
        <button
          onClick={() => setShowReactions(!showReactions)}
          className={`absolute top-1 ${isOwn ? '-left-8' : '-right-8'} opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-white/10`}
          aria-label="Add reaction"
        >
          <SmilePlus className="h-4 w-4 text-white/40" />
        </button>

        {/* Reaction picker */}
        {showReactions && (
          <div
            className={`absolute ${isOwn ? 'right-0' : 'left-0'} -top-10 flex gap-1 bg-zinc-800 border border-white/10 rounded-full px-2 py-1 shadow-lg z-10`}
          >
            {REACTION_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleReaction(emoji)}
                className="text-lg hover:scale-125 transition-transform p-0.5"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {/* Context menu */}
        {showContextMenu && (
          <>
            <div
              className="fixed inset-0 z-20"
              onClick={() => setShowContextMenu(false)}
            />
            <div
              ref={contextRef}
              className={`absolute ${isOwn ? 'right-0' : 'left-0'} top-full mt-1 bg-zinc-800 border border-white/10 rounded-lg shadow-lg z-30 py-1 min-w-[140px]`}
            >
              {message.content && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-white/70 hover:bg-white/10"
                >
                  <Copy className="h-3.5 w-3.5" /> Copy text
                </button>
              )}
              {isOwn && (
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-white/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function StatusIcon({ status }: { status: MessageStatus }) {
  switch (status) {
    case 'sent':
      return <Check className="h-3 w-3 text-white/30" />;
    case 'delivered':
      return <CheckCheck className="h-3 w-3 text-white/30" />;
    case 'read':
      return <CheckCheck className="h-3 w-3 text-primary" />;
    default:
      return <Clock className="h-3 w-3 text-white/20" />;
  }
}
