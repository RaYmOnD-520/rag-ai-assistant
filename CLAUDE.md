# RAG AI Assistant - Claude Code Project Guide

## Project Overview

**RAG AI Assistant** is a sophisticated document chat application that allows users to upload PDF documents and ask questions about their content using Retrieval-Augmented Generation (RAG) powered by Claude AI.

### What it does:
- Users upload PDF documents via a React frontend
- Documents are processed, chunked, and embedded using sentence transformers
- Embeddings are stored in ChromaDB vector database
- Users can ask natural language questions about the documents
- Claude AI generates contextual responses using retrieved document chunks

## Project Structure

```
rag-ai-assistant/
├── backend/                     # FastAPI Python backend
│   ├── main.py                 # FastAPI app with /upload and /ask endpoints
│   ├── ingest.py               # Document processing and embedding logic
│   ├── query.py                # Query processing and retrieval logic
│   ├── requirements.txt        # Python dependencies
│   ├── .env                    # Environment variables (ANTHROPIC_API_KEY)
│   ├── venv/                   # Python virtual environment
│   └── chroma_db/             # ChromaDB vector database storage
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx     # PDF upload component with drag/drop
│   │   │   └── ChatInterface.jsx  # Chat UI for asking questions
│   │   ├── App.jsx             # Main app component with dark theme layout
│   │   ├── main.jsx            # React entry point
│   │   └── index.css           # Global Tailwind CSS styles
│   ├── package.json            # Node.js dependencies
│   ├── vite.config.js          # Vite bundler configuration
│   ├── tailwind.config.js      # Tailwind CSS v4 configuration
│   └── postcss.config.js       # PostCSS config for Tailwind v4
├── README.md                   # Public project documentation
└── CLAUDE.md                   # This file - Claude Code project guide
```

## Tech Stack

### Frontend
- **React 19.2** - UI framework
- **Vite 8.0** - Build tool and dev server
- **Tailwind CSS v4** - Utility-first CSS framework
- **Axios 1.17** - HTTP client for API calls

### Backend  
- **FastAPI 0.136** - Modern Python web framework
- **Python 3.11+** - Programming language
- **Uvicorn** - ASGI server
- **ChromaDB 1.5** - Vector database for embeddings
- **Sentence Transformers 5.5** - Text embedding models
- **PyMuPDF 1.27** - PDF text extraction
- **Anthropic Claude API** - Large language model

### Development
- **Claude Code** - AI-powered development environment
- **Git** - Version control

## How to Run the Project

### Backend Setup & Run
```bash
cd backend
source venv/bin/activate  # Activate virtual environment
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup & Run  
```bash
cd frontend
npm run dev  # Starts Vite dev server on port 5173
```

### Access Points
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (FastAPI auto-generated)

## Key Conventions & Standards

### Commit Strategy
- **Commit every individual file or feature separately** - don't bundle unrelated changes
- **Use conventional commit format**:
  - `feat:` - new features
  - `fix:` - bug fixes  
  - `style:` - UI/styling changes
  - `docs:` - documentation updates
  - `refactor:` - code refactoring

### Port Configuration
- **Backend**: Always runs on port 8000
- **Frontend**: Always runs on port 5173
- **CORS**: Backend configured to allow frontend origin

### Data Conventions
- **Collection names**: Must be lowercase letters, numbers, and underscores only
- **File uploads**: PDF files only, validated on both frontend and backend

## Known Issues & Applied Fixes

### ✅ Tailwind CSS v4 Configuration Issue
**Problem**: Tailwind v4 requires specific PostCSS configuration
**Solution**: Added `@tailwindcss/postcss` to `postcss.config.js`:
```js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### ✅ ChromaDB Collection Name Sanitization  
**Problem**: ChromaDB collection names have strict character requirements
**Solution**: Implemented sanitization in backend using:
```python
collection_name = re.sub(r'[^a-z0-9_]', '', filename_base.lower())
```

### ✅ Double-Click File Upload Bug
**Problem**: File browser opened twice when clicking upload area
**Solution**: Removed duplicate `onClick={openFileDialog}` from div, letting only the hidden file input handle clicks

## Environment Variables

### Required
- **ANTHROPIC_API_KEY**: Claude AI API key (in `backend/.env`)
  - Get from: https://console.anthropic.com/

### Example `.env` file:
```bash
ANTHROPIC_API_KEY=sk-ant-api03-your-key-here
```

## Future Features Planned

### General Mode Toggle
- Currently restricted to document-based chat only
- Plan to add toggle for general Claude AI conversation mode
- Would allow users to chat without uploading documents

### UI Improvements
- Enhanced chat interface with message history persistence
- Better error handling and user feedback
- File management (view/delete uploaded documents)
- Mobile responsive improvements

## Development Notes

### File Upload Flow
1. User selects/drops PDF in `FileUpload.jsx`
2. File sent to `/upload` endpoint in `main.py`
3. `ingest.py` processes PDF → chunks → embeddings → ChromaDB
4. Returns collection_name to frontend

### Chat Flow  
1. User types question in `ChatInterface.jsx`
2. Question + collection_name sent to `/ask` endpoint
3. `query.py` embeds question → searches ChromaDB → retrieves context
4. Context + question sent to Claude AI via Anthropic SDK
5. Response returned to frontend and displayed

### Key Files to Understand
- `backend/main.py` - API endpoints and CORS setup
- `backend/ingest.py` - Document processing pipeline  
- `backend/query.py` - RAG query processing
- `frontend/src/App.jsx` - Main UI layout and state management
- `frontend/src/components/FileUpload.jsx` - File upload with progress
- `frontend/src/components/ChatInterface.jsx` - Chat UI component

This project demonstrates modern full-stack development with AI integration, vector databases, and clean React architecture.