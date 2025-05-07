import React from 'react';
import Chat from '../components/common/Chat';

const ChatPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-2">
      <h1 className="text-3xl font-bold mb-6">Messenger</h1>
      <Chat />
    </div>
  );
};

export default ChatPage;
