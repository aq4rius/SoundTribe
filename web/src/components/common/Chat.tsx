// Chat rewritten from scratch to guarantee hook order and avoid conditional hooks
'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useMyEntities } from '@/hooks/use-my-entities';
import {
  useConversations,
  useMessages,
  useUnreadCounts,
  useDeleteConversation,
  useAddReaction,
} from '@/hooks/use-chat';
import { useAuth } from '@/hooks/use-auth';
import { useSendMessage } from '@/hooks/use-send-message';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import type { IConversation, IMessage, MessageReaction, ChatEntity } from '@/types';
import { env } from '@/lib/env';

const SOCKET_URL = env.NEXT_PUBLIC_SOCKET_URL;

const Chat = () => {
  // All hooks at the top, no early returns
  const { user, token } = useAuth();
  const searchParams = useSearchParams();
  const safeToken = token || undefined;
  const { data: myEntities = [], isLoading: entitiesLoading } = useMyEntities(safeToken);
  const [selectedSender, setSelectedSender] = useState<any>(null);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showInputEmojiPicker, setShowInputEmojiPicker] = useState(false);

  // Only fetch conversations for the selected sender
  const { data: conversations = [], isLoading: convLoading } = useConversations(
    selectedSender,
    safeToken,
  );

  // Only fetch messages for the selected conversation
  const { data: messagesData = { messages: [] }, isLoading: msgLoading } = useMessages(
    selectedSender,
    selectedConversation?.entity,
    safeToken,
  );

  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const sendMessageMutation = useSendMessage(safeToken);
  const queryClient = useQueryClient();
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [processedUrlParams, setProcessedUrlParams] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const { data: unreadCounts = [] } = useUnreadCounts(selectedSender, safeToken);
  // const markAsReadMutation = useMarkAsRead(safeToken);
  const deleteConversationMutation = useDeleteConversation(safeToken);
  const addReactionMutation = useAddReaction(safeToken);

  // Set default sender when entities load
  useEffect(() => {
    if (!selectedSender && myEntities.length === 1) {
      setSelectedSender(myEntities[0]);
    }
  }, [myEntities, selectedSender]);

  // Process URL parameters and handle conversation selection
  useEffect(() => {
    if (!selectedSender || processedUrlParams) return;

    const receiverId = searchParams.get('receiverId');
    const receiverType = searchParams.get('receiverType');
    const receiverName = searchParams.get('receiverName');

    if (receiverId && receiverType && receiverName) {
      // Check if conversation already exists
      const existingConv = conversations.find(
        (conv: IConversation) => conv.entity._id === receiverId && conv.entity.type === receiverType,
      );

      if (existingConv) {
        setSelectedConversation(existingConv);
      } else {
        // Create a pending conversation object
        const pendingConversation = {
          entity: {
            _id: receiverId,
            type: receiverType,
            name: receiverName,
          },
          lastMessage: undefined,
        };
        setSelectedConversation(pendingConversation);
      }
      setProcessedUrlParams(true);
    } else if (conversations.length > 0 && !selectedConversation) {
      // Select first conversation if no URL params and no conversation selected
      setSelectedConversation(conversations[0]);
      setProcessedUrlParams(true);
    }
  }, [selectedSender, conversations, searchParams, selectedConversation, processedUrlParams]);

  // Reset processed flag when sender changes
  useEffect(() => {
    setProcessedUrlParams(false);
    setSelectedConversation(null);
  }, [selectedSender]);

  // Create enhanced conversations list that includes pending conversation from URL
  const enhancedConversations = (() => {
    const receiverId = searchParams.get('receiverId');
    const receiverType = searchParams.get('receiverType');
    const receiverName = searchParams.get('receiverName');

    if (receiverId && receiverType && receiverName && selectedSender) {
      // Check if this conversation already exists in the list
      const exists = conversations.some(
        (conv: IConversation) => conv.entity._id === receiverId && conv.entity.type === receiverType,
      );

      if (!exists) {
        // Add the pending conversation at the top
        const pendingConv = {
          entity: {
            _id: receiverId,
            type: receiverType,
            name: receiverName,
          },
          lastMessage: undefined,
        };
        return [pendingConv, ...conversations];
      }
    }

    return conversations;
  })();

  // Enhanced Socket.io real-time updates
  useEffect(() => {
    if (!selectedSender) return;
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    const socket: Socket = io(SOCKET_URL, { withCredentials: true });
    socketRef.current = socket;
    socket.emit('join-entity', { entityId: selectedSender._id, entityType: selectedSender.type });

    // Emit mark-delivered for this sender entity (to mark all messages sent to this entity as delivered)
    socket.emit('mark-delivered', { entityId: selectedSender._id, entityType: selectedSender.type });

    socket.on('new-message', (msg: any) => { // TODO(phase-1): replace with Prisma type
      const isCurrentConversation =
        selectedConversation &&
        ((msg.sender.id === selectedSender._id &&
          msg.receiver.id === selectedConversation.entity._id) ||
          (msg.receiver.id === selectedSender._id &&
            msg.sender.id === selectedConversation.entity._id));
      if (isCurrentConversation) {
        queryClient.invalidateQueries({
          queryKey: [
            'messages',
            selectedSender._id,
            selectedSender.type,
            selectedConversation.entity._id,
            selectedConversation.entity.type,
          ],
        });
        // If the message is sent TO the current sender (i.e., user is the receiver), emit conversation-opened to mark as read
        if (msg.receiver.id === selectedSender._id && socketRef.current) {
          socketRef.current.emit('conversation-opened', {
            senderId: selectedSender._id,
            senderType: selectedSender.type,
            receiverId: selectedConversation.entity._id,
            receiverType: selectedConversation.entity.type,
          });
        }
      }
      // Always update conversations and unread counts for sidebar
      queryClient.invalidateQueries({
        queryKey: ['conversations', selectedSender._id, selectedSender.type],
      });
      queryClient.invalidateQueries({
        queryKey: ['unread-counts', selectedSender._id, selectedSender.type],
      });
    });
    socket.on('messages-delivered', (data: any) => { // TODO(phase-1): replace with Prisma type
      // Always update conversations and messages for sidebar and chat
      queryClient.invalidateQueries({
        queryKey: ['conversations', selectedSender._id, selectedSender.type],
      });
      if (selectedConversation) {
        queryClient.invalidateQueries({
          queryKey: [
            'messages',
            selectedSender._id,
            selectedSender.type,
            selectedConversation.entity._id,
            selectedConversation.entity.type,
          ],
        });
      }
    });
    socket.on('messages-read', (data: any) => { // TODO(phase-1): replace with Prisma type
      // Always update conversations and messages for sidebar and chat
      queryClient.invalidateQueries({
        queryKey: ['conversations', selectedSender._id, selectedSender.type],
      });
      if (selectedConversation) {
        queryClient.invalidateQueries({
          queryKey: [
            'messages',
            selectedSender._id,
            selectedSender.type,
            selectedConversation.entity._id,
            selectedConversation.entity.type,
          ],
        });
      }
    });

    // Handle message status updates
    socket.on('message-status-update', (data: any) => { // TODO(phase-1): replace with Prisma type
      if (selectedConversation) {
        queryClient.invalidateQueries({
          queryKey: [
            'messages',
            selectedSender._id,
            selectedSender.type,
            selectedConversation.entity._id,
            selectedConversation.entity.type,
          ],
        });
      }
    });

    // Handle messages read notification
    socket.on('messages-read', (data: any) => { // TODO(phase-1): replace with Prisma type
      if (selectedConversation && data.conversationId === selectedConversation.entity._id) {
        queryClient.invalidateQueries({
          queryKey: [
            'messages',
            selectedSender._id,
            selectedSender.type,
            selectedConversation.entity._id,
            selectedConversation.entity.type,
          ],
        });
      }
    });

    // Handle messages marked as read (for unread count updates)
    socket.on('messages-marked-read', () => {
      queryClient.invalidateQueries({
        queryKey: ['unread-counts', selectedSender._id, selectedSender.type],
      });
      queryClient.invalidateQueries({
        queryKey: ['conversations', selectedSender._id, selectedSender.type],
      });
    });

    // Handle reaction events
    socket.on('message-reaction', (data: any) => { // TODO(phase-1): replace with Prisma type
      if (
        selectedConversation &&
        ((data.senderId === selectedSender._id &&
          data.receiverId === selectedConversation.entity._id) ||
          (data.receiverId === selectedSender._id &&
            data.senderId === selectedConversation.entity._id))
      ) {
        queryClient.invalidateQueries({
          queryKey: [
            'messages',
            selectedSender._id,
            selectedSender.type,
            selectedConversation.entity._id,
            selectedConversation.entity.type,
          ],
        });
      }
    });

    // Handle typing events
    socket.on('user-typing', (data: any) => { // TODO(phase-1): replace with Prisma type
      if (selectedConversation && data.senderId === selectedConversation.entity._id) {
        setOtherUserTyping(true);
        setTimeout(() => setOtherUserTyping(false), 3000);
      }
    });

    socket.on('user-stopped-typing', (data: any) => { // TODO(phase-1): replace with Prisma type
      if (selectedConversation && data.senderId === selectedConversation.entity._id) {
        setOtherUserTyping(false);
      }
    });

    return () => {
      socket.emit('leave-entity', {
        entityId: selectedSender._id,
        entityType: selectedSender.type,
      });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [selectedSender, selectedConversation, queryClient]);

  // When a conversation is opened, emit mark-delivered for that conversation
  useEffect(() => {
    if (!selectedSender || !selectedConversation) return;
    if (!socketRef.current) return;
    socketRef.current.emit('mark-delivered', {
      entityId: selectedSender._id,
      entityType: selectedSender.type,
    });
  }, [selectedSender, selectedConversation]);

  // Emit conversation opened when conversation changes
  useEffect(() => {
    if (selectedSender && selectedConversation && socketRef.current) {
      socketRef.current.emit('conversation-opened', {
        senderId: selectedSender._id,
        senderType: selectedSender.type,
        receiverId: selectedConversation.entity._id,
        receiverType: selectedConversation.entity.type,
      });
    }
  }, [selectedConversation, selectedSender]);

  // Cleanup socket on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, []);

  // Scroll to bottom on new messages and conversation changes
  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;

    // Use setTimeout to ensure DOM is updated
    setTimeout(() => {
      chatArea.scrollTop = chatArea.scrollHeight;
    }, 100);
  }, [messagesData.messages, selectedConversation]);

  // Focus input after sending
  useEffect(() => {
    if (!sendMessageMutation.isPending && inputRef.current) {
      inputRef.current.focus();
    }
  }, [sendMessageMutation.isPending]);

  // Defensive: fallback values
  const safeConversations = Array.isArray(enhancedConversations) ? enhancedConversations : [];
  const safeMessages = Array.isArray(messagesData?.messages) ? messagesData.messages : [];

  // Send message handler
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
          // Only invalidate conversations if this was a new conversation
          if (
            !conversations.some(
              (conv: IConversation) =>
                conv.entity._id === selectedConversation.entity._id &&
                conv.entity.type === selectedConversation.entity.type,
            )
          ) {
            queryClient.invalidateQueries({
              queryKey: ['conversations', selectedSender._id, selectedSender.type],
            });
          }
        },
      },
    );
  };

  // Render
  if (entitiesLoading) {
    return <div className="text-center text-white/80 py-12">Loading chat...</div>;
  }

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
              setProcessedUrlParams(false);
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
            safeConversations.map((conv: IConversation) => {
              // Get unread count for this conversation
              const unreadCount =
                unreadCounts.find(
                  (uc: any) => // TODO(phase-1): replace with Prisma type
                    uc._id.senderId === conv.entity._id && uc._id.senderType === conv.entity.type,
                )?.count || 0;

              return (
                <div
                  key={conv.entity._id + conv.entity.type}
                  className={`relative px-4 py-3 border-b hover:bg-blue-50 ${
                    selectedConversation &&
                    conv.entity._id === selectedConversation.entity._id &&
                    conv.entity.type === selectedConversation.entity.type
                      ? 'bg-blue-100'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => setSelectedConversation(conv)}
                    >
                      <div className="font-semibold flex items-center gap-2 justify-between">
                        <span className="flex items-center gap-2">
                          {conv.entity.type === 'ArtistProfile' ? '🎤' : '🎫'} {conv.entity.name}
                        </span>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                            {unreadCount}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {conv.lastMessage?.text ? (
                          <>
                            {conv.lastMessage.isSentByMe ? 'You: ' : ''}
                            {conv.lastMessage.text}
                          </>
                        ) : conv.lastMessage?.attachment ? (
                          <>
                            {conv.lastMessage.isSentByMe ? 'You: ' : ''}
                            [Attachment]
                          </>
                        ) : (
                          'Start a conversation...'
                        )}
                      </div>
                      <div className="text-xs text-gray-400 text-right">
                        {conv.lastMessage && new Date(conv.lastMessage.createdAt).toLocaleString()}
                      </div>
                    </div>

                    {/* Simplified conversation menu - removed "mark as read" */}
                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowMenu(showMenu === conv.entity._id ? null : conv.entity._id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded text-gray-500 hover:text-gray-700"
                      >
                        ⋮
                      </button>

                      {showMenu === conv.entity._id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={() => setShowMenu(null)} />
                          <div className="absolute right-0 top-8 bg-white border rounded shadow-lg z-20 min-w-[160px]">
                            <button
                              className="block w-full text-left px-3 py-2 hover:bg-gray-100 text-red-600 text-sm"
                              onClick={() => {
                                if (selectedSender && confirm('Delete this conversation?')) {
                                  deleteConversationMutation.mutate({
                                    senderId: selectedSender._id,
                                    senderType: selectedSender.type,
                                    receiverId: conv.entity._id,
                                    receiverType: conv.entity.type,
                                  });
                                  if (selectedConversation?.entity._id === conv.entity._id) {
                                    setSelectedConversation(null);
                                  }
                                }
                                setShowMenu(null);
                              }}
                            >
                              Delete conversation
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Enhanced header with search */}
        <div className="border-b px-4 py-3 bg-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-semibold">
              {selectedConversation ? (
                <>
                  {selectedConversation.entity.type === 'ArtistProfile' ? '🎤' : '🎫'}{' '}
                  {selectedConversation.entity.name}
                </>
              ) : (
                <span className="text-gray-400">Select a conversation</span>
              )}
            </div>
            {selectedConversation && (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm border rounded px-2 py-1 w-40 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                )}
              </div>
            )}
          </div>
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
            <>
              <AnimatePresence initial={false}>
                {/* Filter messages based on search */}
                {(searchTerm
                  ? safeMessages.filter((msg: IMessage) =>
                      msg.text?.toLowerCase().includes(searchTerm.toLowerCase()),
                    )
                  : safeMessages
                ).map((msg: IMessage) => {
                  const isMine = msg.sender.id === selectedSender?._id;
                  return (
                    <motion.div
                      key={msg._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      transition={{ duration: 0.18 }}
                      className={`mb-2 flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                    >
                      <div className="relative group">
                        <div
                          className={`rounded-xl px-3 py-2 max-w-xs shadow-lg ${
                            isMine ? 'bg-cyan-900 text-white' : 'bg-fuchsia-950/80 text-white'
                          } relative`}
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

                          <div className="text-xs text-white/40 mt-1 text-right flex items-center justify-end gap-1">
                            {new Date(msg.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                            {/* Message status indicators for sent messages */}
                            {msg.sender.id === selectedSender?._id && (
                              <span className="text-xs">
                                {msg.status === 'read'
                                  ? '✓✓' // Double check for read
                                  : msg.status === 'delivered'
                                    ? '✓' // Single check for delivered
                                    : '○'}{' '}
                                {/* Circle for sent */}
                              </span>
                            )}
                          </div>
                        </div>
                        {/* Reaction button - shows on hover */}
                        <button
                          className="absolute -top-2 right-0 opacity-0 group-hover:opacity-100 bg-gray-700 rounded-full p-1 text-xs transition-opacity"
                          onClick={() =>
                            setShowReactionPicker(showReactionPicker === msg._id ? null : msg._id)
                          }
                        >
                          😊
                        </button>
                        {/* Reaction picker - direction based on message side */}
                        {showReactionPicker === msg._id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setShowReactionPicker(null)}
                            />
                            <div
                              className={`absolute top-8 ${isMine ? 'right-0' : 'left-0'} bg-gray-800 rounded-lg p-2 flex gap-1 z-20 ${isMine ? '' : 'flex-row-reverse'}`}
                              style={isMine ? {} : { left: 0, right: 'auto' }}
                            >
                              {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
                                <button
                                  key={emoji}
                                  className="hover:bg-gray-700 rounded p-1 text-lg"
                                  onClick={() => {
                                    addReactionMutation.mutate({ messageId: msg._id, emoji });
                                    setShowReactionPicker(null);
                                  }}
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </>
                        )}
                        {/* Show existing reactions */}
                        {msg.reactions && msg.reactions.length > 0 && (
                          <div className="flex gap-1 mt-1">
                            {/* Group reactions by emoji */}
                            {Object.entries(
                              msg.reactions.reduce((acc: Record<string, number>, reaction: MessageReaction) => {
                                acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                                return acc;
                              }, {}),
                            ).map(([emoji, count]) => (
                              <span key={emoji} className="text-xs bg-gray-600 rounded px-1 py-0.5">
                                {emoji} {count as number}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </>
          )}
        </div>
        {/* typing indicator area */}
        <div className="text-black/60 text-sm italic text-left">
          {otherUserTyping && (
            <div className="text-black/60 text-sm italic text-left">
              {selectedConversation.entity.name} is typing...
            </div>
          )}
        </div>

        <div className="flex gap-2 p-4 border-t bg-black/80 rounded-b-xl">
          {/* Emoji picker for input */}
          <div className="relative">
            <button
              type="button"
              className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-lg mr-1"
              onClick={() => setShowInputEmojiPicker((v) => !v)}
              tabIndex={-1}
            >
              😊
            </button>
            {showInputEmojiPicker && (
              <div className="absolute bottom-10 left-0 bg-gray-800 rounded-lg p-2 flex gap-1 z-20 shadow-lg">
                {['👍', '❤️', '😂', '😮', '😢', '😡', '😊', '🎉', '🔥', '🙏', '🥳', '🤘', '🎶'].map(
                  (emoji) => (
                    <button
                      key={emoji}
                      className="hover:bg-gray-700 rounded p-1 text-lg"
                      onClick={() => {
                        // Insert emoji at cursor position in input
                        if (inputRef.current) {
                          const el = inputRef.current;
                          const start = el.selectionStart || 0;
                          const end = el.selectionEnd || 0;
                          const newValue = input.slice(0, start) + emoji + input.slice(end);
                          setInput(newValue);
                          setTimeout(() => {
                            el.focus();
                            el.setSelectionRange(start + emoji.length, start + emoji.length);
                          }, 0);
                        } else {
                          setInput((val) => val + emoji);
                        }
                        setShowInputEmojiPicker(false);
                      }}
                    >
                      {emoji}
                    </button>
                  ),
                )}
              </div>
            )}
          </div>

          <input
            ref={inputRef}
            className="flex-1 border rounded px-2 py-1 bg-gray-900 text-white focus:ring-2 focus:ring-fuchsia-700 transition-all duration-150"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);

              // Emit typing event
              if (selectedSender && selectedConversation && !isTyping && e.target.value.trim()) {
                setIsTyping(true);
                const socket = io(SOCKET_URL, { withCredentials: true });
                socket.emit('typing', {
                  senderId: selectedSender._id,
                  senderType: selectedSender.type,
                  receiverId: selectedConversation.entity._id,
                  receiverType: selectedConversation.entity.type,
                });

                // Stop typing after 1 second of no input
                setTimeout(() => {
                  setIsTyping(false);
                  socket.emit('stop-typing', {
                    senderId: selectedSender._id,
                    senderType: selectedSender.type,
                    receiverId: selectedConversation.entity._id,
                    receiverType: selectedConversation.entity.type,
                  });
                  socket.disconnect();
                }, 1000);
              }
            }}
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

          {/* Enhanced file input with preview */}
          <div className="relative">
            <input
              type="file"
              id="file-input"
              onChange={(e) => {
                const selectedFile = e.target.files ? e.target.files[0] : null;
                if (selectedFile) {
                  // More generous limits since compression will happen in the hook
                  const isImage = selectedFile.type.startsWith('image/');
                  const maxSize = isImage ? 100 * 1024 * 1024 : 10 * 1024 * 1024; // 100MB for images, 10MB for others
                  if (selectedFile.size > maxSize) {
                    const maxSizeMB = maxSize / 1024 / 1024;
                    const fileSizeMB = (selectedFile.size / 1024 / 1024).toFixed(1);
                    alert(
                      `File too large! Maximum size is ${maxSizeMB}MB for ${isImage ? 'images' : 'this file type'}. Your file is ${fileSizeMB}MB`,
                    );
                    e.target.value = ''; // Clear the input
                    return;
                  }
                  // Show a note for large images that will be compressed
                  if (isImage && selectedFile.size > 8 * 1024 * 1024) {
                    console.log(
                      'ℹ️ Large image selected - will be compressed automatically during upload',
                    );
                  }
                }
                setFile(selectedFile);
              }}
              disabled={!selectedSender || !selectedConversation || sendMessageMutation.isPending}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*,audio/*,.pdf,.doc,.docx,.txt"
            />
            <label
              htmlFor="file-input"
              className="flex items-center justify-center w-10 h-8 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition-colors"
            >
              📎
            </label>
          </div>

          {/* Enhanced file preview */}
          {file && (
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 py-2 max-w-sm">
              {/* File preview */}
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center text-xs">
                  📄
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="text-xs text-fuchsia-300 truncate">{file.name}</div>
                <div className="text-xs text-gray-400">
                  {(file.size / 1024 / 1024).toFixed(1)}MB
                  {file.type.startsWith('image/') && file.size > 8 * 1024 * 1024 && (
                    <span className="text-yellow-300 ml-1">• Will be compressed</span>
                  )}
                </div>
              </div>

              <button
                onClick={() => setFile(null)}
                className="text-red-400 hover:text-red-300 p-1"
                type="button"
              >
                ✕
              </button>
            </div>
          )}

          {/* Progress bar during upload */}
          {sendMessageMutation.isPending && (
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-fuchsia-500 to-cyan-500 h-2 rounded-full animate-pulse"></div>
            </div>
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
            {sendMessageMutation.isPending ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {file && file.type.startsWith('image/') && file.size > 8 * 1024 * 1024
                  ? 'Compressing & Sending...'
                  : 'Sending...'}
              </div>
            ) : (
              'Send'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
