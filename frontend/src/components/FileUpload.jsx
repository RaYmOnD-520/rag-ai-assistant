import React, { useState, useRef } from 'react';
import axios from 'axios';

const FileUpload = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState(''); // 'success' | 'error'
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.type !== 'application/pdf') {
      setMessage('Please select a PDF file only');
      setMessageType('error');
      return;
    }

    setFile(selectedFile);
    setMessage('');
    setMessageType('');
    setUploadProgress(0);
  };

  const handleFileInput = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setMessage('Please select a file first');
      setMessageType('error');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    const formData = new FormData();
    formData.append('files', file);

    try {
      const response = await axios.post('http://localhost:8000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setMessage('File uploaded successfully!');
      setMessageType('success');
      setUploadProgress(100);

      // Call the parent callback with collection_name from response
      if (onUploadSuccess && response.data.results[0].collection_name) {
        onUploadSuccess(response.data.results[0].collection_name);
      }

      // Reset form
      setFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('Upload error:', error);
      setMessage(
        error.response?.data?.detail || 'Upload failed. Please try again.'
      );
      setMessageType('error');
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Compact drag and drop area */}
      <div
        className={`relative border border-dashed rounded-lg p-4 text-center transition-colors cursor-pointer ${
          dragActive
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-gray-600 hover:border-gray-500 bg-gray-800/30'
        }`}
        style={{
          borderColor: dragActive ? '#60a5fa' : '#525252',
          backgroundColor: dragActive ? 'rgba(59, 130, 246, 0.1)' : 'rgba(31, 41, 55, 0.3)'
        }}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-2">
          <svg
            className="mx-auto h-6 w-6 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div>
            <p className="text-xs text-gray-300">
              <span className="font-medium">Click to browse</span> or drag PDF here
            </p>
          </div>
        </div>
      </div>

      {/* Selected file display */}
      {file && (
        <div className="p-3 bg-gray-800 rounded-lg border border-gray-600">
          <div className="flex items-center space-x-2">
            <svg className="h-4 w-4 text-red-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white truncate">{file.name}</p>
              <p className="text-xs text-gray-400">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload progress */}
      {uploading && uploadProgress > 0 && (
        <div>
          <div className="flex justify-between text-xs text-gray-300 mb-2">
            <span>Uploading...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Messages */}
      {message && (
        <div
          className={`p-2 rounded text-xs ${
            messageType === 'success'
              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}
        >
          {message}
        </div>
      )}

      {/* Upload button */}
      <button
        onClick={handleUpload}
        disabled={!file || uploading}
        className={`w-full py-2 px-3 rounded text-xs font-medium transition-colors ${
          !file || uploading
            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
            : 'bg-blue-600 text-white hover:bg-blue-500'
        }`}
      >
        {uploading ? 'Uploading...' : 'Upload PDF'}
      </button>
    </div>
  );
};

export default FileUpload;