'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useGame } from '@/app/context/GameContext';
import { Send, MessageCircle } from 'lucide-react';

const ChatPanel = () => {
  const { socket, chatMessages } = useGame();
  const [message, setMessage] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!socket || !message.trim()) return;

    socket.emit('chatMessage', message.trim());
    setMessage('');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-black bg-opacity-20">
      {/* Chat Header */}
      <div 
        className="bg-black bg-opacity-30 p-3 cursor-pointer flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center space-x-2 text-white">
          <MessageCircle size={20} />
          <span className="font-semibold">Chat</span>
        </div>
        <div className="text-white text-sm">
          {isOpen ? '▼' : '▲'}
        </div>
      </div>

      {/* Chat Messages */}
      {isOpen && (
        <div className="flex-1 flex flex-col">
          <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-64">
            {chatMessages.length === 0 ? (
              <div className="text-gray-400 text-sm text-center">
                No messages yet. Start chatting!
              </div>
            ) : (
              chatMessages.map((msg, index) => (
                <div key={index} className="chat-message">
                  <div className="font-semibold text-blue-300">
                    {msg.playerName}:
                  </div>
                  <div className="text-white">{msg.message}</div>
                  <div className="text-gray-400 text-xs">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-600">
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                maxLength={200}
              />
              <button
                type="submit"
                disabled={!message.trim()}
                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <Send size={16} />
              </button>
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Press Enter to send
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ChatPanel;