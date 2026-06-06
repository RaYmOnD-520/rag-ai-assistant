import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatInterface = ({ collectionName, messages }) => {
  const [currentMessages, setCurrentMessages] = useState(messages || []);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Update messages when props change
  useEffect(() => {
    setCurrentMessages(messages || []);
  }, [messages]);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [currentMessages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !collectionName) {
      return;
    }

    if (!collectionName) {
      setError('No document selected. Please upload a document first.');
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    setCurrentMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        question: userMessage.text,
        collection_name: collectionName
      });

      const aiMessage = {
        id: Date.now() + 1,
        text: response.data.answer,
        sender: 'ai',
        timestamp: new Date().toISOString(),
        sources: response.data.sources || []
      };

      setCurrentMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.detail || 'Failed to get response. Please try again.';
      setError(errorMessage);

      // Add error message to chat
      const errorChatMessage = {
        id: Date.now() + 1,
        text: `Error: ${errorMessage}`,
        sender: 'error',
        timestamp: new Date().toISOString()
      };

      setCurrentMessages(prev => [...prev, errorChatMessage]);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderMessage = (message) => {
    const isUser = message.sender === 'user';
    const isError = message.sender === 'error';

    return (
      <div
        key={message.id}
        className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}
      >
        <div
          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
            isUser
              ? 'bg-blue-500 text-white rounded-br-none'
              : isError
              ? 'bg-red-100 text-red-700 border border-red-300 rounded-bl-none'
              : 'bg-gray-700 text-white rounded-bl-none'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap">{message.text}</p>
          {message.sources && message.sources.length > 0 && (
            <div className="mt-2 pt-2 border-t border-gray-600">
              <p className="text-xs opacity-75">Sources:</p>
              <ul className="text-xs opacity-75 mt-1">
                {message.sources.map((source, index) => (
                  <li key={index} className="truncate">• {source}</li>
                ))}
              </ul>
            </div>
          )}
          <p className={`text-xs mt-1 ${
            isUser ? 'text-blue-100' : isError ? 'text-red-500' : 'text-gray-300'
          }`}>
            {formatTime(message.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="flex justify-start mb-4">
      <div className="bg-gray-700 text-white px-4 py-2 rounded-lg rounded-bl-none">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 rounded-t-lg">
        <h2 className="text-lg font-semibold text-gray-800">
          Chat with Document
        </h2>
        {collectionName && (
          <p className="text-sm text-gray-600 mt-1">
            Document: <span className="font-medium">{collectionName}</span>
          </p>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {!collectionName ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <p>Upload a document to start chatting</p>
            </div>
          </div>
        ) : currentMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
              </svg>
              <p>Ask questions about your document</p>
              <p className="text-sm mt-2">Try asking: "What is this document about?"</p>
            </div>
          </div>
        ) : (
          <>
            {currentMessages.map(renderMessage)}
            {isLoading && renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-200 p-4 bg-gray-50 rounded-b-lg">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              collectionName
                ? "Ask a question about your document..."
                : "Upload a document first..."
            }
            disabled={isLoading || !collectionName}
            className={`flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              (!collectionName || isLoading) ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
            }`}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading || !collectionName}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !inputMessage.trim() || isLoading || !collectionName
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isLoading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};

export default ChatInterface;