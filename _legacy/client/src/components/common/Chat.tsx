import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyProfilesAndEvents, getMessages, sendMessage } from '../../services/api';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

interface Entity {
  _id: string;
  name: string;
  type: 'ArtistProfile' | 'Event';
}

interface Message {
  _id: string;
  sender: { id: string; type: string };
  receiver: { id: string; type: string };
  text?: string;
  attachment?: string;
  createdAt: string;
}

interface Conversation {
  entity: Entity; // The other party
  lastMessage: Message;
}

// Notification type
interface Notification {
  _id: string;
  type: string;
  content: string;
  read: boolean;
  createdAt: string;
  relatedEntity?: { id: string; type: string };
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

const Chat: React.FC = () => {
  const { user } = useAuth();
  const [myEntities, setMyEntities] = useState<Entity[]>([]);
  const [selectedSender, setSelectedSender] = useState<Entity | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const [unread, setUnread] = useState<{ [key: string]: number }>({});
  const socketRef = useRef<Socket | null>(null);
  const prevSenderRef = useRef<string | null>(null);
  const [sidebarMenuOpen, setSidebarMenuOpen] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const chatAreaRef = useRef<HTMLDivElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);

  // Helper: fetch all conversations for the selected sender
  const fetchConversations = async (sender: Entity) => {
    const token = localStorage.getItem('token');
    const res = await fetch(
      `/api/messages/conversations?senderId=${sender._id}&senderType=${sender.type}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
    if (!res.ok) {
      setConversations([]);
      setSelectedConversation(null);
      return;
    }
    const data = await res.json();
    // If query params specify a target, pre-select it
    const targetId = searchParams.get('targetId');
    const targetType = searchParams.get('targetType');
    const targetName = searchParams.get('targetName');
    let conversations = data;
    // If target is not in the conversation list, add it as a pending conversation
    if (
      targetId &&
      targetType &&
      !data.some((c: Conversation) => c.entity._id === targetId && c.entity.type === targetType)
    ) {
      conversations = [
        {
          entity: { _id: targetId, type: targetType, name: targetName || 'Unknown' },
          lastMessage: undefined,
        },
        ...data,
      ];
    }
    setConversations(conversations);
    // Pre-select the target if present
    if (targetId && targetType) {
      const found = conversations.find(
        (c: Conversation) => c.entity._id === targetId && c.entity.type === targetType,
      );
      if (found) setSelectedConversation(found);
      else setSelectedConversation(null);
    } else {
      setSelectedConversation(conversations[0] || null);
    }
  };

  useEffect(() => {
    getMyProfilesAndEvents().then((entities) => {
      setMyEntities(entities);
      if (entities.length === 1) {
        setSelectedSender(entities[0]);
      } else {
        setSelectedSender(null);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSender) {
      fetchConversations(selectedSender);
    } else {
      setConversations([]);
      setSelectedConversation(null);
    }
  }, [selectedSender, searchParams]);

  useEffect(() => {
    if (selectedSender && selectedConversation) {
      setLoading(true);
      getMessages(selectedSender, selectedConversation.entity).then((res) => {
        setMessages(res.messages);
        setLoading(false);
      });
    } else {
      setMessages([]);
    }
  }, [selectedSender, selectedConversation]);

  // Connect to Socket.io and join sender room
  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(SOCKET_URL, { withCredentials: true });
    }
    const socket = socketRef.current;
    if (selectedSender) {
      const room = `${selectedSender.type}:${selectedSender._id}`;
      socket.emit('join-entity', { entityId: selectedSender._id, entityType: selectedSender.type });
      // Leave previous room if sender changed
      if (prevSenderRef.current && prevSenderRef.current !== room) {
        const [type, id] = prevSenderRef.current.split(':');
        socket.emit('leave-entity', { entityId: id, entityType: type });
      }
      prevSenderRef.current = room;
    }
    return () => {
      // On unmount, disconnect socket
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [selectedSender]);

  // Listen for new-message events
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;
    const handleNewMessage = (msg: any) => {
      // If the message is for the currently open conversation, append it
      if (
        selectedSender &&
        selectedConversation &&
        ((msg.sender.id === selectedSender._id &&
          msg.receiver.id === selectedConversation.entity._id) ||
          (msg.receiver.id === selectedSender._id &&
            msg.sender.id === selectedConversation.entity._id))
      ) {
        setMessages((prev) => [...prev, msg]);
      } else {
        // Otherwise, increment unread count for the relevant conversation
        const key =
          msg.sender.id === selectedSender?._id
            ? `${msg.receiver.type}:${msg.receiver.id}`
            : `${msg.sender.type}:${msg.sender.id}`;
        setUnread((prev) => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
      }
    };
    socket.on('new-message', handleNewMessage);
    return () => {
      socket.off('new-message', handleNewMessage);
    };
  }, [selectedSender, selectedConversation]);

  // Reset unread count when opening a conversation
  useEffect(() => {
    if (selectedConversation) {
      const key = `${selectedConversation.entity.type}:${selectedConversation.entity._id}`;
      setUnread((prev) => ({ ...prev, [key]: 0 }));
    }
  }, [selectedConversation]);

  // Filter sender dropdown to only show artist profiles/events owned by the current user
  const filteredEntities = myEntities.filter((ent) => {
    if (ent.type === 'ArtistProfile') {
      // @ts-ignore
      return ent.user === user?._id || ent.user?._id === user?._id;
    }
    if (ent.type === 'Event') {
      // @ts-ignore
      return (
        ent.owner === user?._id ||
        ent.owner?._id === user?._id ||
        ent.postedBy === user?._id ||
        ent.postedBy?._id === user?._id
      );
    }
    return false;
  });

  // Delete conversation (frontend + backend)
  const handleDeleteConversation = async (conv: Conversation) => {
    if (!selectedSender) return;
    const token = localStorage.getItem('token');
    const params = new URLSearchParams({
      senderId: selectedSender._id,
      senderType: selectedSender.type,
      receiverId: conv.entity._id,
      receiverType: conv.entity.type,
    });
    const res = await fetch(`/api/messages/convo?${params.toString()}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (res.ok) {
      setConversations((prev) =>
        prev.filter((c) => c.entity._id !== conv.entity._id || c.entity.type !== conv.entity.type),
      );
      if (
        selectedConversation &&
        selectedConversation.entity._id === conv.entity._id &&
        selectedConversation.entity.type === conv.entity.type
      ) {
        setSelectedConversation(null);
        setMessages([]);
      }
    }
    setSidebarMenuOpen(null);
  };

  const handleSend = async () => {
    if ((!input.trim() && !file) || !selectedSender || !selectedConversation) return;
    const msg = await sendMessage(selectedSender, selectedConversation.entity, input, file);
    setInput('');
    setFile(null);
    setConversations((prev) => {
      if (!selectedConversation) return prev;
      return prev.map((c) =>
        c.entity._id === selectedConversation.entity._id &&
        c.entity.type === selectedConversation.entity.type
          ? { ...c, lastMessage: msg }
          : c,
      );
    });
  };

  // Fetch messages with pagination
  const fetchMessages = async (pageNum = 1, append = false) => {
    if (!selectedSender || !selectedConversation) return;
    const chatArea = chatAreaRef.current;
    let prevScrollHeight = chatArea ? chatArea.scrollHeight : 0;
    if (pageNum === 1) setLoading(true);
    else setLoadingMore(true);
    const res = await getMessages(selectedSender, selectedConversation.entity, pageNum, 50);
    setHasMore(res.hasMore);
    setPage(pageNum);
    if (append) {
      setMessages((prev) => {
        // After state update, adjust scroll to preserve position
        setTimeout(() => {
          if (chatArea) {
            chatArea.scrollTop = chatArea.scrollHeight - prevScrollHeight;
          }
        }, 0);
        return [...res.messages, ...prev];
      });
    } else {
      setMessages(res.messages);
      // After state update, scroll to bottom
      setTimeout(() => {
        if (chatArea) {
          chatArea.scrollTop = chatArea.scrollHeight;
        }
      }, 0);
    }
    setLoading(false);
    setLoadingMore(false);
  };

  // Fetch last page when conversation changes
  useEffect(() => {
    setPage(1);
    setHasMore(true);
    if (selectedSender && selectedConversation) {
      // Fetch total message count to determine last page
      (async () => {
        const res = await getMessages(selectedSender, selectedConversation.entity, 1, 1); // Only get count
        const totalMessages = res.total || 0;
        const pageSize = 50;
        const lastPage = totalMessages > 0 ? Math.ceil(totalMessages / pageSize) : 1;
        fetchMessages(lastPage, false);
      })();
    } else {
      setMessages([]);
    }
  }, [selectedSender, selectedConversation]);

  // Infinite scroll: fetch more when scrolled to top
  useEffect(() => {
    const chatArea = chatAreaRef.current;
    if (!chatArea) return;
    const handleScroll = () => {
      if (chatArea.scrollTop === 0 && hasMore && !loadingMore) {
        fetchMessages(page + 1, true);
      }
    };
    chatArea.addEventListener('scroll', handleScroll);
    return () => chatArea.removeEventListener('scroll', handleScroll);
  }, [hasMore, loadingMore, page, selectedSender, selectedConversation]);

  // Fetch notifications
  const fetchNotifications = async () => {
    setNotifLoading(true);
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } finally {
      setNotifLoading(false);
    }
  };

  // Mark notification as read
  const markNotificationRead = async (id: string) => {
    await api.put(`/notifications/${id}`);
    setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, read: true } : n)));
  };

  // Delete notification
  const deleteNotification = async (id: string) => {
    await api.delete(`/notifications/${id}`);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  // Fetch on mount and when dropdown opens
  useEffect(() => {
    if (showNotifications) fetchNotifications();
  }, [showNotifications]);

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
              const entity = filteredEntities.find((ent) => ent._id === e.target.value);
              setSelectedSender(entity || null);
              setSelectedConversation(null);
              setMessages([]);
            }}
          >
            <option value="">Select profile/event</option>
            {filteredEntities.map((ent) => (
              <option key={ent._id} value={ent._id}>
                {ent.type === 'ArtistProfile' ? '🎤' : '🎫'} {ent.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-gray-400 text-center text-sm">No conversations yet.</div>
          ) : (
            conversations.map((conv) => {
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
                    {unread[key] > 0 && (
                      <span className="ml-2 inline-block bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                        {unread[key]}
                      </span>
                    )}
                    <button
                      className="ml-auto px-2 py-1 text-gray-500 hover:text-gray-800"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSidebarMenuOpen(key === sidebarMenuOpen ? null : key);
                      }}
                    >
                      &#8230;
                    </button>
                  </div>
                  {/* Dropdown menu */}
                  {sidebarMenuOpen === key && (
                    <div className="absolute right-4 top-8 z-10 bg-white border rounded shadow p-2">
                      <button
                        className="block w-full text-left px-2 py-1 hover:bg-gray-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conv);
                        }}
                      >
                        Delete Conversation
                      </button>
                    </div>
                  )}
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
        <div className="border-b px-4 py-3 bg-gray-100 font-semibold flex justify-between items-center">
          {selectedConversation ? (
            <>
              {selectedConversation.entity.type === 'ArtistProfile' ? '🎤' : '🎫'}{' '}
              {selectedConversation.entity.name}
            </>
          ) : (
            <span className="text-gray-400">Select a conversation</span>
          )}
          <div className="relative">
            <button
              className="relative px-3 py-2"
              onClick={() => setShowNotifications((v) => !v)}
              aria-label="Notifications"
            >
              <span className="material-icons align-middle">notifications</span>
              {notifications.some((n) => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-2 font-semibold border-b">Notifications</div>
                {notifLoading ? (
                  <div className="p-4 text-center text-gray-400">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-400">No notifications</div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`flex items-start gap-2 px-4 py-3 border-b last:border-b-0 ${n.read ? 'bg-white' : 'bg-blue-50'}`}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{n.content}</div>
                        <div className="text-xs text-gray-400">
                          {new Date(n.createdAt).toLocaleString()}
                        </div>
                      </div>
                      {!n.read && (
                        <button
                          className="text-xs text-blue-600 mr-2"
                          onClick={() => markNotificationRead(n._id)}
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        className="text-xs text-gray-400 hover:text-red-500"
                        onClick={() => deleteNotification(n._id)}
                      >
                        &times;
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50" ref={chatAreaRef}>
          {loading ? (
            <div>Loading messages...</div>
          ) : (
            <>
              {loadingMore && (
                <div className="text-center text-xs text-gray-400 mb-2">Loading more...</div>
              )}
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`mb-1 ${msg.sender.id === selectedSender?._id ? 'text-right' : 'text-left'}`}
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
                          className="text-blue-600 underline"
                        >
                          Download file
                        </a>
                      )}
                    </div>
                  )}
                  {msg.text && (
                    <span className="inline-block px-2 py-1 rounded bg-blue-100">{msg.text}</span>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(msg.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
        <div className="flex gap-2 p-4 border-t bg-white">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!selectedSender || !selectedConversation}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
            disabled={!selectedSender || !selectedConversation}
            className="border rounded px-2 py-1"
          />
          {file && (
            <span className="text-xs text-gray-600 max-w-[120px] truncate">{file.name}</span>
          )}
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
            onClick={handleSend}
            disabled={(!input.trim() && !file) || !selectedSender || !selectedConversation}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
