import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import ChatInterface from './components/ChatInterface';

function App() {
  const [collectionName, setCollectionName] = useState(null);
  const [messages, setMessages] = useState([]);
  const [fileList, setFileList] = useState([]);

  const fetchFiles = async () => {
    try {
      const response = await fetch('http://localhost:8000/collections');
      const data = await response.json();
      setFileList(data.collections);
    } catch (error) {
      console.error('Failed to fetch files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadSuccess = (newCollectionName) => {
    setCollectionName(newCollectionName);
    setMessages([]); // Reset messages when new document is uploaded
    fetchFiles();
  };

  const handleDelete = async (collection_name) => {
    try {
      await fetch(`http://localhost:8000/files/${collection_name}`, {
        method: 'DELETE',
      });

      // Refresh the file list
      fetchFiles();

      // If the deleted file was the active one, reset state
      if (collection_name === collectionName) {
        setCollectionName(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  return (
    <div className="h-screen bg-gray-900 flex" style={{ height: '100vh', backgroundColor: '#0f0f0f' }}>
      {/* Left Sidebar - Document Management */}
      <div
        className="bg-gray-800 border-r border-gray-700 flex flex-col"
        style={{
          width: '260px',
          backgroundColor: '#0a0a0a',
          borderRightColor: '#2d2d2d',
          minHeight: '100vh'
        }}
      >
        {/* Logo/Header */}
        <div className="p-4 border-b border-gray-700" style={{ borderBottomColor: '#2d2d2d' }}>
          <h1 className="text-lg font-semibold text-white">RAG Assistant</h1>
          <p className="text-xs text-gray-400 mt-1">Chat with your documents</p>
        </div>

        {/* Document Status */}
        {collectionName && (
          <div className="p-4 border-b border-gray-700" style={{ borderBottomColor: '#2d2d2d' }}>
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              <span className="text-xs font-medium text-gray-300">Active Document</span>
            </div>
            <p className="text-sm text-white truncate" title={collectionName}>
              {collectionName}
            </p>
          </div>
        )}

        {/* Upload Section */}
        <div className="p-4 border-b border-gray-700" style={{ borderBottomColor: '#2d2d2d' }}>
          <h3 className="text-sm font-medium text-gray-300 mb-3">
            {collectionName ? 'Upload New Document' : 'Get Started'}
          </h3>
          <FileUpload onUploadSuccess={handleUploadSuccess} />
        </div>

        {/* Documents List */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="p-4 pb-2">
            <h3 className="text-sm font-medium text-gray-300">Your Documents</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-2">
            {fileList.length === 0 ? (
              <p className="text-xs text-gray-500 px-2 py-3">No documents uploaded yet</p>
            ) : (
              <div className="space-y-1">
                {fileList.map((fileName) => (
                  <div
                    key={fileName}
                    onClick={() => {
                      setCollectionName(fileName);
                      setMessages([]);
                    }}
                    className="group cursor-pointer px-3 py-2 rounded text-sm flex items-center justify-between"
                    style={{
                      borderLeft: collectionName === fileName ? '3px solid #3b82f6' : '3px solid transparent',
                      color: collectionName === fileName ? '#ffffff' : '#9ca3af',
                      backgroundColor: 'transparent',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a1a1a';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                    title={fileName}
                  >
                    <span className="overflow-hidden text-ellipsis whitespace-nowrap flex-1">
                      {fileName}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(fileName);
                      }}
                      className="opacity-0 group-hover:opacity-100 ml-2 text-gray-500 hover:text-red-400 transition-opacity flex-shrink-0"
                      style={{ fontSize: '16px' }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700" style={{ borderTopColor: '#2d2d2d' }}>
          <p className="text-xs text-gray-500">
            Powered by Claude AI
          </p>
        </div>
      </div>

      {/* Right Side - Chat Area */}
      <div className="flex-1 bg-gray-900" style={{ backgroundColor: '#1a1a1a' }}>
        {!collectionName ? (
          // Empty state when no document uploaded
          <div className="h-full flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-medium text-white mb-2">
                Upload a PDF to get started
              </h2>
              <p className="text-gray-400 text-sm">
                Upload any PDF document and start asking questions about its content.
                Use the upload area in the sidebar to begin.
              </p>
            </div>
          </div>
        ) : (
          // Chat interface when document is uploaded
          <ChatInterface
            collectionName={collectionName}
            messages={messages}
          />
        )}
      </div>
    </div>
  );
}

export default App;
