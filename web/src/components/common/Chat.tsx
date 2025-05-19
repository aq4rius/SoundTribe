// Chat migrated from client/src/components/common/Chat.tsx
'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMyEntities } from '@/hooks/useMyEntities';
import { useConversations, useMessages } from '@/hooks/useChat';
import { useAuth } from '@/hooks/useAuth';
import { useSendMessage } from '@/hooks/useSendMessage';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

const Chat = () => {
  const { user, token } = useAuth();
  const safeToken = token || undefined;
  const { data: myEntities = [], isLoading: entitiesLoading } = useMyEntities(safeToken);
  const [selectedSender, setSelectedSender] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const { data: conversations = [], isLoading: convLoading } = useConversations(
    selectedSender,
    safeToken,
  );
  const { data: messagesData = { messages: [] }, isLoading: msgLoading } = useMessages(
    selectedSender,
    selectedConversation?.entity,
    safeToken,
  );
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState<{ [key: string]: number }>({});
  const socketRef = useRef<Socket | null>(null);
  const prevSenderRef = useRef<string | null>(null);
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const sendMessageMutation = useSendMessage(safeToken);
  const queryClient = useQueryClient();

  // Set default sender
  useEffect(() => {
    if (!selectedSender && myEntities.length === 1) setSelectedSender(myEntities[0]);
  }, [myEntities, selectedSender]);

  // Set default conversation
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation)
      setSelectedConversation(conversations[0]);
  }, [conversations, selectedConversation]);

  // Defensive: fallback values for messages and conversations
  const safeConversations = Array.isArray(conversations) ? conversations : [];
  const safeMessages = Array.isArray(messagesData?.messages) ? messagesData.messages : [];

  // Only now, after all hooks:
  if (entitiesLoading) {
    return <div className="text-center text-white/80 py-12">Loading chat...</div>;
  }

  const handleSend = () => {
    if ((!input.trim() && !file) || !selectedSender || !selectedConversation) return;
    sendMessageMutation.mutate(
      {
        sender: selectedSender,
        receiver: selectedConversation.entity,
        text: input,
        file,
      },
      {
        onSuccess: () => {
          setInput('');
          setFile(null);
        },
      },
    );
  };

  // Scroll to bottom when messages change (unless user scrolled up)
  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;
    // If user is near the bottom, scroll to bottom
    const isNearBottom = chatArea.scrollHeight - chatArea.scrollTop - chatArea.clientHeight < 100;
    if (isNearBottom) {
      chatArea.scrollTop = chatArea.scrollHeight;
    }
  }, [messagesData.messages, selectedConversation]);

  // Focus input after sending
  useEffect(() => {
    if (!sendMessageMutation.isPending && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sendMessageMutation.isPending]);

  // Focus input on conversation change
  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
  }, [selectedConversation]);

  // Socket.io real-time updates
  useEffect(() => {
    if (!selectedSender) return;
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000', {
      withCredentials: true,
    });
    const room = `${selectedSender.type}:${selectedSender._id}`;
    socket.emit('join-entity', { entityId: selectedSender._id, entityType: selectedSender.type });
    socket.on('new-message', (msg: any) => {
      // Only update if for this conversation
      if (
        selectedConversation &&
        ((msg.sender.id === selectedSender._id &&
          msg.receiver.id === selectedConversation.entity._id) ||
          (msg.receiver.id === selectedSender._id &&
            msg.sender.id === selectedConversation.entity._id))
      ) {
        // Invalidate messages query
        queryClient.invalidateQueries({
          queryKey: [
            'messages',
            selectedSender._id,
            selectedSender.type,
            selectedConversation.entity._id,
            selectedConversation.entity.type,
          ],
        });
      } else {
        // Invalidate conversations for unread badge
        queryClient.invalidateQueries({
          queryKey: ['conversations', selectedSender._id, selectedSender.type],
        });
      }
    });
    return () => {
      socket.emit('leave-entity', {
        entityId: selectedSender._id,
        entityType: selectedSender.type,
      });
      socket.disconnect();
    };
  }, [selectedSender, selectedConversation]);

  return (
    <div className="flex h-[600px] max-w-4xl mx-auto bg-white border rounded shadow overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r flex flex-col bg-gray-50">
        <div className="p-3 border-b">
          <label className="font-semibold block mb-1">Send as:</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedSender?._id || ''}
            onChange={(e) => {
              const entity = myEntities.find((ent) => ent._id === e.target.value);
              setSelectedSender(entity || null);
              setSelectedConversation(null);
            }}
          >
            <option value="">Select profile/event</option>
            {myEntities.map((ent) => (
              <option key={ent._id} value={ent._id}>
                {ent.type === 'ArtistProfile' ? '🎤' : '🎫'} {ent.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {convLoading ? (
            <div className="p-4 text-gray-400 text-center text-sm">Loading conversations...</div>
          ) : safeConversations.length === 0 ? (
            <div className="p-4 text-gray-400 text-center text-sm">No conversations yet.</div>
          ) : (
            safeConversations.map((conv: any) => {
              const key = `${conv.entity.type}:${conv.entity._id}`;
              return (
                <div
                  key={conv.entity._id + conv.entity.type}
                  className={`relative px-4 py-3 cursor-pointer border-b hover:bg-blue-50 ${
                    selectedConversation &&
                    conv.entity._id === selectedConversation.entity._id &&
                    conv.entity.type === selectedConversation.entity.type
                      ? 'bg-blue-100'
                      : ''
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="font-semibold flex items-center gap-2">
                    {conv.entity.type === 'ArtistProfile' ? '🎤' : '🎫'} {conv.entity.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {conv.lastMessage?.text
                      ? conv.lastMessage.text
                      : conv.lastMessage === undefined
                        ? 'Start a conversation...'
                        : '[Attachment]'}
                  </div>
                  <div className="text-xs text-gray-400 text-right">
                    {conv.lastMessage && new Date(conv.lastMessage.createdAt).toLocaleString()}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <div className="border-b px-4 py-3 bg-gray-100 font-semibold flex items-center">
          {selectedConversation ? (
            <>
              {selectedConversation.entity.type === 'ArtistProfile' ? '🎤' : '🎫'}{' '}
              {selectedConversation.entity.name}
            </>
          ) : (
            <span className="text-gray-400">Select a conversation</span>
          )}
        </div>
        <div
          className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-black via-gray-900 to-gray-950 rounded-b-xl shadow-inner"
          ref={chatAreaRef}
        >
          {msgLoading ? (
            <div className="text-center text-white/60">Loading messages...</div>
          ) : !selectedSender || !selectedConversation ? (
            <div className="text-center text-white/60">
              Select a sender and conversation to start chatting.
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {safeMessages.map((msg: any) => (
                <motion.div
                  key={msg._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.18 }}
                  className={`mb-2 flex flex-col ${msg.sender.id === selectedSender?._id ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`rounded-xl px-3 py-2 max-w-xs shadow-lg ${msg.sender.id === selectedSender?._id ? 'bg-cyan-900 text-white' : 'bg-fuchsia-950/80 text-white'} relative`}
                  >
                    {msg.attachment && (
                      <div className="mb-1">
                        {msg.attachment.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={msg.attachment}
                            alt="attachment"
                            className="max-w-xs max-h-40 rounded border mb-1 inline-block"
                          />
                        ) : msg.attachment.match(/\.(mp3|wav|ogg)$/i) ? (
                          <audio controls src={msg.attachment} className="mb-1 max-w-xs" />
                        ) : (
                          <a
                            href={msg.attachment}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-300 underline"
                          >
                            Download file
                          </a>
                        )}
                      </div>
                    )}
                    {msg.text && <span>{msg.text}</span>}
                    <div className="text-xs text-white/40 mt-1 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t bg-black/80 rounded-b-xl">
          <input
            ref={inputRef}
            className="flex-1 border rounded px-2 py-1 bg-gray-900 text-white focus:ring-2 focus:ring-fuchsia-700 transition-all duration-150"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!selectedSender || !selectedConversation || sendMessageMutation.isPending}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            autoFocus
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            disabled={!selectedSender || !selectedConversation || sendMessageMutation.isPending}
            className="border rounded px-2 py-1 bg-gray-900 text-white"
          />
          {file && (
            <span className="text-xs text-fuchsia-300 max-w-[120px] truncate">{file.name}</span>
          )}
          <button
            className="bg-gradient-to-r from-fuchsia-700 to-cyan-700 text-white px-4 py-1 rounded shadow hover:scale-105 hover:from-fuchsia-600 hover:to-cyan-600 transition-all duration-150 disabled:opacity-50"
            onClick={handleSend}
            disabled={
              (!input.trim() && !file) ||
              !selectedSender ||
              !selectedConversation ||
              sendMessageMutation.isPending
            }
          >
            {sendMessageMutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
