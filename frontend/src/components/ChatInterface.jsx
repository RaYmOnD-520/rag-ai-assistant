import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatInterface = ({ collectionName, messages, setMessages, suggestions = [], onSuggestionClick, exportChat }) => {
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || !collectionName) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    // Add user message immediately
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
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

      setMessages([...updatedMessages, aiMessage]);
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

      setMessages([...updatedMessages, errorChatMessage]);
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
      <div key={message.id} className="w-full">
        <div className="max-w-3xl mx-auto px-4">
          <div className={`flex gap-4 mb-6 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            {!isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4h4v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
                </svg>
              </div>
            )}

            <div className={`flex-1 ${isUser ? 'flex justify-end' : ''}`}>
              <div className={`${isUser ? 'max-w-2xl' : 'max-w-full'}`}>
                <div className={`rounded-lg px-4 py-3 ${
                  isUser
                    ? 'bg-blue-600 text-white'
                    : isError
                    ? 'bg-red-500/10 text-red-300 border border-red-500/20'
                    : 'bg-gray-800 text-gray-100'
                }`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-600">
                      <p className="text-xs text-gray-300 mb-1">Sources:</p>
                      <ul className="text-xs text-gray-300 space-y-1">
                        {message.sources.map((source, index) => (
                          <li key={index} className="truncate">• {source}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Timestamp */}
                <p className="text-xs text-gray-500 mt-1 px-1">
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>

            {/* User Avatar */}
            {isUser && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTypingIndicator = () => (
    <div className="w-full">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex gap-4 mb-6">
          {/* AI Avatar */}
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 2L3 7v11a1 1 0 001 1h3a1 1 0 001-1v-4h4v4a1 1 0 001 1h3a1 1 0 001-1V7l-7-5z"/>
            </svg>
          </div>

          <div className="bg-gray-800 rounded-lg px-4 py-3">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col" style={{ height: '100vh' }}>
      {/* Chat header with export button */}
      {messages.length > 0 && (
        <div className="border-b border-gray-700 px-4 py-3 flex justify-end" style={{ borderBottomColor: '#2d2d2d', backgroundColor: '#1a1a1a' }}>
          <button
            onClick={exportChat}
            className="border border-gray-600 text-gray-400 hover:border-gray-400 hover:text-white text-xs px-3 py-1 rounded transition-colors"
          >
            Export Chat
          </button>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto py-6" style={{ backgroundColor: '#1a1a1a' }}>
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md px-4">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-3.582 8-8 8a8.955 8.955 0 01-4.126-.98L3 20l1.98-5.874A8.955 8.955 0 013 12c0-4.418 3.582-8 8-8s8 3.582 8 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Ready to chat
              </h3>
              <p className="text-gray-400 text-sm mb-4">
                Ask questions about your document. Try: "What is this document about?" or "Summarize the key points."
              </p>
              {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-center mt-4">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => onSuggestionClick && onSuggestionClick(suggestion)}
                      className="px-4 py-2 rounded-full text-sm border transition-colors"
                      style={{
                        backgroundColor: '#1e1e1e',
                        borderColor: '#525252',
                        color: '#d1d5db'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = '#3b82f6';
                        e.currentTarget.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = '#525252';
                        e.currentTarget.style.color = '#d1d5db';
                      }}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {isLoading && renderTypingIndicator()}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="border-t border-red-500/20 bg-red-500/10 px-4 py-3">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-gray-700 bg-gray-900 px-4 py-4" style={{ backgroundColor: '#1a1a1a', borderTopColor: '#2d2d2d' }}>
        <div className="max-w-3xl mx-auto">
          <form onSubmit={handleSubmit} className="relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your document..."
              disabled={isLoading || !collectionName}
              className={`w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors ${
                (!collectionName || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              style={{
                backgroundColor: '#2d2d2d',
                borderColor: '#525252'
              }}
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading || !collectionName}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-2 rounded-lg transition-colors ${
                !inputMessage.trim() || isLoading || !collectionName
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700'
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
            Press Enter to send • Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;