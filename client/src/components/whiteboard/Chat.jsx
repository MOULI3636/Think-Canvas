import React, { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';

const Chat = ({ roomId, socket, user }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Listen for messages
  useEffect(() => {
    if (!socket) {
      console.log('No socket connection');
      return;
    }

    console.log('Setting up chat listeners for room:', roomId);

    // Handle incoming messages
    const handleNewMessage = (message) => {
      console.log('New message received:', message);
      setMessages(prev => [...prev, message]);
      scrollToBottom();
    };

    // Handle typing indicators
    const handleUserTyping = ({ userId, name, isTyping }) => {
      console.log('Typing event:', { userId, name, isTyping });
      
      // Don't show own typing
      if (userId === user?._id) return;

      setTypingUsers(prev => {
        if (isTyping) {
          // Add user if not already typing
          if (!prev.some(u => u.userId === userId)) {
            return [...prev, { userId, name }];
          }
        } else {
          // Remove user from typing list
          return prev.filter(u => u.userId !== userId);
        }
        return prev;
      });
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
    };
  }, [socket, roomId, user?._id]);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    const messageData = {
      roomId,
      message: inputMessage,
      user: {
        id: user?._id,
        name: user?.name,
        avatar: user?.avatar
      },
      timestamp: Date.now()
    };

    console.log('Sending message:', messageData);
    
    // Emit to server
    socket.emit('send-message', messageData);
    
    // Clear input
    setInputMessage('');

    // Stop typing indicator
    socket.emit('typing', { 
      roomId, 
      userId: user?._id,
      name: user?.name,
      isTyping: false 
    });
  };

  const handleTyping = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (!socket) return;

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (value.length > 0) {
      // User is typing
      socket.emit('typing', { 
        roomId, 
        userId: user?._id,
        name: user?.name,
        isTyping: true 
      });

      // Set timeout to stop typing after 2 seconds
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { 
          roomId, 
          userId: user?._id,
          name: user?.name,
          isTyping: false 
        });
      }, 2000);
    } else {
      // Input is empty, stop typing
      socket.emit('typing', { 
        roomId, 
        userId: user?._id,
        name: user?.name,
        isTyping: false 
      });
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="w-80 bg-white dark:bg-gray-800 border-l dark:border-gray-700 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Chat</h3>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${msg.user?.id === user?._id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-xs px-3 py-2 rounded-lg ${
                msg.user?.id === user?._id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
              }`}>
                {msg.user?.id !== user?._id && (
                  <p className="text-xs font-semibold mb-1 text-gray-600 dark:text-gray-300">
                    {msg.user?.name || 'Unknown'}
                  </p>
                )}
                <p className="break-words">{msg.message}</p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 italic">
            {typingUsers.length === 1 ? (
              <span>{typingUsers[0].name} is typing...</span>
            ) : (
              <span>{typingUsers.map(u => u.name).join(', ')} are typing...</span>
            )}
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={handleTyping}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <button
            type="submit"
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!inputMessage.trim()}
          >
            <FiSend />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;