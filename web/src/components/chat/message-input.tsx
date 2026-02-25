'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { sendMessageAction } from '@/actions/messages';
import type { SenderEntity } from './conversation-list';
import type { EntityType } from '@prisma/client';
import { Loader2, Paperclip, Send, Smile } from 'lucide-react';

const MAX_CHARS = 2000;
const EMOJI_GRID = [
  '😀', '😂', '😊', '🥰', '😎', '🤔', '😮', '🙏',
  '👍', '👎', '❤️', '🔥', '🎵', '🎸', '🎹', '🎤',
  '🥁', '🎷', '🎺', '🎻', '🎶', '🎧', '🎼', '🎯',
  '✨', '💯', '🙌', '👏', '🤝', '💪', '🌟', '⚡',
];

interface MessageInputProps {
  conversationId: string;
  sender: SenderEntity;
  receiverEntityId: string;
  receiverEntityType: EntityType;
  onTyping: (data: Record<string, unknown>) => Promise<void>;
}

export default function MessageInput({
  conversationId,
  sender,
  receiverEntityId,
  receiverEntityType,
  onTyping,
}: MessageInputProps) {
  const [content, setContent] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [sending, setSending] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced typing indicator
  const handleTyping = useCallback(() => {
    onTyping({ typing: true });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping({ typing: false });
    }, 3000);
  }, [onTyping]);

  // Clear typing on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping({ typing: false });
    };
  }, [onTyping]);

  const handleSend = async () => {
    if ((!content.trim() && !file) || sending) return;

    setSending(true);
    try {
      // TODO(phase-5): Upload file to Cloudinary, get URL back
      // For now, only text messages are supported
      await sendMessageAction({
        conversationId,
        senderEntityId: sender.id,
        senderEntityType: sender.type,
        receiverEntityId,
        receiverEntityType,
        content: content.trim() || undefined,
        attachmentUrl: undefined,
        attachmentType: undefined,
      });

      setContent('');
      setFile(null);
      setShowEmoji(false);

      // Clear typing indicator
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      onTyping({ typing: false });
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEmojiClick = (emoji: string) => {
    setContent((prev) => prev + emoji);
    textareaRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    // Validate file size (10MB max)
    if (selected.size > 10 * 1024 * 1024) {
      alert('File size must be under 10MB');
      return;
    }

    setFile(selected);
  };

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const canSend = (content.trim().length > 0 || file) && !isOverLimit && !sending;

  return (
    <div className="border-t border-white/10 bg-white/[0.02]">
      {/* File preview */}
      {file && (
        <div className="px-4 pt-3 flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg text-sm">
            <Paperclip className="h-3.5 w-3.5 text-white/40" />
            <span className="text-white/60 max-w-[200px] truncate">{file.name}</span>
            <button
              onClick={() => setFile(null)}
              className="text-white/40 hover:text-white/70 ml-1"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Emoji picker */}
      {showEmoji && (
        <div className="px-4 pt-3">
          <div className="grid grid-cols-8 gap-1 p-2 bg-zinc-800 border border-white/10 rounded-lg">
            {EMOJI_GRID.map((emoji) => (
              <button
                key={emoji}
                onClick={() => handleEmojiClick(emoji)}
                className="text-xl p-1 hover:bg-white/10 rounded transition-colors"
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input row */}
      <div className="flex items-end gap-2 p-3">
        {/* Emoji button */}
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className={`p-2 rounded-lg transition-colors ${
            showEmoji
              ? 'bg-primary/20 text-primary'
              : 'text-white/40 hover:text-white/60 hover:bg-white/5'
          }`}
          aria-label="Toggle emoji picker"
        >
          <Smile className="h-5 w-5" />
        </button>

        {/* File attachment button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-lg text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors"
          aria-label="Attach file"
        >
          <Paperclip className="h-5 w-5" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
        />

        {/* Textarea */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              handleTyping();
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 max-h-32"
            style={{
              height: 'auto',
              minHeight: '40px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
            }}
          />
          {charCount > MAX_CHARS * 0.9 && (
            <span
              className={`absolute bottom-1 right-2 text-[10px] ${
                isOverLimit ? 'text-red-400' : 'text-white/30'
              }`}
            >
              {charCount}/{MAX_CHARS}
            </span>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={handleSend}
          disabled={!canSend}
          className="p-2.5 rounded-xl bg-primary text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
          aria-label="Send message"
        >
          {sending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Send className="h-5 w-5" />
          )}
        </button>
      </div>
    </div>
  );
}
