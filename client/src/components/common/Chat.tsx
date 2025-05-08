import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyProfilesAndEvents, getMessages, sendMessage } from '../../services/api';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';

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

  // Helper: fetch all conversations for the selected sender
  const fetchConversations = async (sender: Entity) => {
    const token = localStorage.getItem('token');
    const res = await fetch(`/api/messages/conversations?senderId=${sender._id}&senderType=${sender.type}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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
    if (targetId && targetType && !data.some((c: Conversation) => c.entity._id === targetId && c.entity.type === targetType)) {
      conversations = [
        {
          entity: { _id: targetId, type: targetType, name: targetName || 'Unknown' },
          lastMessage: undefined
        },
        ...data
      ];
    }
    setConversations(conversations);
    // Pre-select the target if present
    if (targetId && targetType) {
      const found = conversations.find(
        (c: Conversation) => c.entity._id === targetId && c.entity.type === targetType
      );
      if (found) setSelectedConversation(found);
      else setSelectedConversation(null);
    } else {
      setSelectedConversation(conversations[0] || null);
    }
  };

  useEffect(() => {
    getMyProfilesAndEvents().then(entities => {
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
      getMessages(selectedSender, selectedConversation.entity).then(msgs => {
        setMessages(msgs);
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
        ((msg.sender.id === selectedSender._id && msg.receiver.id === selectedConversation.entity._id) ||
         (msg.receiver.id === selectedSender._id && msg.sender.id === selectedConversation.entity._id))
      ) {
        setMessages(prev => [...prev, msg]);
      } else {
        // Otherwise, increment unread count for the relevant conversation
        const key = msg.sender.id === selectedSender?._id ? `${msg.receiver.type}:${msg.receiver.id}` : `${msg.sender.type}:${msg.sender.id}`;
        setUnread(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
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
      setUnread(prev => ({ ...prev, [key]: 0 }));
    }
  }, [selectedConversation]);

  // Filter sender dropdown to only show artist profiles/events owned by the current user
  const filteredEntities = myEntities.filter(ent => {
    if (ent.type === 'ArtistProfile') {
      // @ts-ignore
      return ent.user === user?._id || ent.user?._id === user?._id;
    }
    if (ent.type === 'Event') {
      // @ts-ignore
      return ent.owner === user?._id || ent.owner?._id === user?._id || ent.postedBy === user?._id || ent.postedBy?._id === user?._id;
    }
    return false;
  });

  // Delete conversation (frontend only)
  const handleDeleteConversation = (conv: Conversation) => {
    setConversations(prev => prev.filter(c => c.entity._id !== conv.entity._id || c.entity.type !== conv.entity.type));
    if (selectedConversation && selectedConversation.entity._id === conv.entity._id && selectedConversation.entity.type === conv.entity.type) {
      setSelectedConversation(null);
      setMessages([]);
    }
    setSidebarMenuOpen(null);
  };

  const handleSend = async () => {
    if (!input.trim() || !selectedSender || !selectedConversation) return;
    const msg = await sendMessage(selectedSender, selectedConversation.entity, input);
    // setMessages(prev => [...prev, msg]);
    setInput('');
    // Optionally, update conversations list with new last message
    setConversations(prev => {
      if (!selectedConversation) return prev;
      return prev.map(c =>
        c.entity._id === selectedConversation.entity._id && c.entity.type === selectedConversation.entity.type
          ? { ...c, lastMessage: msg }
          : c
      );
    });
  };

  return (
    <div className="flex h-[600px] max-w-4xl mx-auto bg-white border rounded shadow overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 border-r flex flex-col bg-gray-50">
        <div className="p-3 border-b">
          <label className="font-semibold block mb-1">Send as:</label>
          <select
            className="w-full border rounded px-2 py-1"
            value={selectedSender?._id || ''}
            onChange={e => {
              const entity = filteredEntities.find(ent => ent._id === e.target.value);
              setSelectedSender(entity || null);
              setSelectedConversation(null);
              setMessages([]);
            }}
          >
            <option value="">Select profile/event</option>
            {filteredEntities.map(ent => (
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
            conversations.map(conv => {
              const key = `${conv.entity.type}:${conv.entity._id}`;
              return (
                <div
                  key={conv.entity._id + conv.entity.type}
                  className={`relative px-4 py-3 cursor-pointer border-b hover:bg-blue-50 ${
                    selectedConversation && conv.entity._id === selectedConversation.entity._id && conv.entity.type === selectedConversation.entity.type
                      ? 'bg-blue-100' : ''
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
                      onClick={e => {
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
                        onClick={e => {
                          e.stopPropagation();
                          handleDeleteConversation(conv);
                        }}
                      >
                        Delete Conversation
                      </button>
                    </div>
                  )}
                  <div className="text-xs text-gray-500 truncate">
                    {conv.lastMessage?.text ? conv.lastMessage.text : conv.lastMessage === undefined ? 'Start a conversation...' : '[Attachment]'}
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
        <div className="border-b px-4 py-3 bg-gray-100 font-semibold">
          {selectedConversation ? (
            <>
              {selectedConversation.entity.type === 'ArtistProfile' ? '🎤' : '🎫'} {selectedConversation.entity.name}
            </>
          ) : (
            <span className="text-gray-400">Select a conversation</span>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          {loading ? (
            <div>Loading messages...</div>
          ) : (
            messages.map(msg => (
              <div key={msg._id} className={`mb-1 ${msg.sender.id === selectedSender?._id ? 'text-right' : 'text-left'}`}>
                <span className="inline-block px-2 py-1 rounded bg-blue-100">{msg.text}</span>
                <div className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleString()}</div>
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2 p-4 border-t bg-white">
          <input
            className="flex-1 border rounded px-2 py-1"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={!selectedSender || !selectedConversation}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button
            className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
            onClick={handleSend}
            disabled={!input.trim() || !selectedSender || !selectedConversation}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
