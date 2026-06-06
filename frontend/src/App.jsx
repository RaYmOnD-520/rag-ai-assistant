import React, { useState } from 'react';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';

function App() {
  const [collectionName, setCollectionName] = useState(null);
  const [messages, setMessages] = useState([]);

  const handleUploadSuccess = (newCollectionName) => {
    setCollectionName(newCollectionName);
    setMessages([]); // Reset messages when new document is uploaded
  };

  return (
    <div className="min-h-screen bg-gray-900" style={{ minHeight: '100vh', backgroundColor: '#111827' }}>
      <div className="container mx-auto px-4 py-8" style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px' }}>
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2" style={{ fontSize: '2.25rem', fontWeight: 'bold', color: '#ffffff', marginBottom: '8px' }}>
            RAG AI Assistant
          </h1>
          <p className="text-xl text-gray-300" style={{ fontSize: '1.25rem', color: '#d1d5db' }}>
            Chat with your documents using AI
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          {!collectionName ? (
            <div className="space-y-8">
              {/* Upload Section */}
              <div className="text-center">
                <div className="mb-8">
                  <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" style={{ width: '64px', height: '64px', margin: '0 auto 16px', color: '#9ca3af' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-2xl font-semibold text-white mb-2">
                    Upload a PDF to start chatting
                  </h2>
                  <p className="text-gray-400">
                    Upload any PDF document and ask questions about its content
                  </p>
                </div>
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Upload Section - Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Document Management
                  </h3>
                  <div className="mb-4">
                    <div className="bg-gray-700 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <svg className="h-5 w-5 text-green-400" style={{ width: '20px', height: '20px', color: '#10b981' }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <p className="text-sm font-medium text-white">Active Document</p>
                          <p className="text-xs text-gray-300 truncate">{collectionName}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="border-t border-gray-700 pt-4">
                    <p className="text-sm text-gray-400 mb-4">
                      Upload a new document to replace the current one
                    </p>
                    <FileUpload onUploadSuccess={handleUploadSuccess} />
                  </div>
                </div>
              </div>

              {/* Chat Section - Main Area */}
              <div className="lg:col-span-2">
                <div className="h-[600px]">
                  <ChatInterface
                    collectionName={collectionName}
                    messages={messages}
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 pt-8 border-t border-gray-800">
          <p className="text-gray-500 text-sm">
            Powered by AI • Upload PDF documents to start intelligent conversations
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
