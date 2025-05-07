import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getMyProfilesAndEvents, getChatTargets, getMessages, sendMessage } from '../../services/api';

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

const Chat: React.FC = () => {
  const [myEntities, setMyEntities] = useState<Entity[]>([]);
  const [selectedSender, setSelectedSender] = useState<Entity | null>(null);
  const [targets, setTargets] = useState<Entity[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<Entity | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Always fetch on mount and reset selection if nothing is found
    getMyProfilesAndEvents().then(entities => {
      console.log('Fetched my entities:', entities); // DEBUG
      setMyEntities(entities);
      // If query params specify a target, pre-select it
      const targetId = searchParams.get('targetId');
      const targetType = searchParams.get('targetType');
      const targetName = searchParams.get('targetName');
      if (targetId && targetType) {
        setSelectedTarget({ _id: targetId, type: targetType as any, name: targetName || '' });
      }
      if (entities.length === 1) {
        setSelectedSender(entities[0]);
      } else {
        setSelectedSender(null);
      }
    });
  }, [searchParams]);

  useEffect(() => {
    if (selectedSender) {
      getChatTargets(selectedSender).then(setTargets);
    }
  }, [selectedSender]);

  useEffect(() => {
    if (selectedSender && selectedTarget) {
      setLoading(true);
      getMessages(selectedSender, selectedTarget).then(msgs => {
        setMessages(msgs);
        setLoading(false);
      });
    }
  }, [selectedSender, selectedTarget]);

  const handleSend = async () => {
    if (!input.trim() || !selectedSender || !selectedTarget) return;
    const msg = await sendMessage(selectedSender, selectedTarget, input);
    setMessages(prev => [...prev, msg]);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full border rounded shadow p-4 bg-white max-w-2xl mx-auto">
      <div className="mb-2">
        <label className="font-semibold">Send as:</label>
        <select
          className="ml-2 border rounded px-2 py-1"
          value={selectedSender?._id || ''}
          onChange={e => {
            const entity = myEntities.find(ent => ent._id === e.target.value);
            setSelectedSender(entity || null);
            setSelectedTarget(null);
            setMessages([]);
          }}
        >
          <option value="">Select profile/event</option>
          {myEntities.map(ent => (
            <option key={ent._id} value={ent._id}>
              {ent.type === 'ArtistProfile' ? '🎤' : '🎫'} {ent.name}
            </option>
          ))}
        </select>
      </div>
      {selectedSender && (
        <div className="mb-2">
          <label className="font-semibold">Chat with:</label>
          <select
            className="ml-2 border rounded px-2 py-1"
            value={selectedTarget?._id || ''}
            onChange={e => {
              const entity = targets.find(ent => ent._id === e.target.value);
              setSelectedTarget(entity || null);
            }}
          >
            <option value="">Select target</option>
            {targets.map(ent => (
              <option key={ent._id} value={ent._id}>
                {ent.type === 'ArtistProfile' ? '🎤' : '🎫'} {ent.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="flex-1 overflow-y-auto border rounded p-2 bg-gray-50 mb-2">
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
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          disabled={!selectedSender || !selectedTarget}
        />
        <button
          className="bg-blue-500 text-white px-4 py-1 rounded disabled:opacity-50"
          onClick={handleSend}
          disabled={!input.trim() || !selectedSender || !selectedTarget}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;
