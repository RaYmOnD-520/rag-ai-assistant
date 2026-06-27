# KoDa — RAG AI Assistant v2.0
# Claude Code Project Guide

## Project Overview

KoDa is a full-stack RAG (Retrieval-Augmented Generation) AI assistant. Users upload PDF documents and chat with them using Claude AI. Answers are strictly scoped to uploaded documents only.

## How to Run

Terminal 1 — Claude Code:
cd ~/Documents/rag-ai-assistant && claude

Terminal 2 — Frontend:
cd ~/Documents/rag-ai-assistant/frontend && npm run dev

Terminal 3 — Backend:
cd ~/Documents/rag-ai-assistant/backend && source venv/bin/activate && uvicorn main:app --reload --port 8000

Frontend runs at http://localhost:5173
Backend runs at http://localhost:8000
API docs at http://localhost:8000/docs

## Project Structure

backend/main.py — FastAPI app with all endpoints
backend/ingest.py — PDF processing and ChromaDB embedding
backend/query.py — Query retrieval and Claude API call
backend/requirements.txt — Python dependencies
backend/.env — ANTHROPIC_API_KEY (never commit this)
frontend/src/App.jsx — Main app, state management, session history
frontend/src/components/FileUpload.jsx — PDF upload component
frontend/src/components/ChatInterface.jsx — Chat UI, KoDa branding, markdown rendering

## Key Technical Decisions

- Scoped answers: Claude is instructed via system prompt to only answer from document context
- Per-document sessions: chatSessions object in App.jsx stores history per collection name
- Multi-file: /upload accepts List[UploadFile], processes each independently
- Suggestions: /suggestions endpoint retrieves 3 chunks and asks Claude to generate questions
- KoDa: custom AI identity with green avatar (#00ff41) and animated thinking dots

## API Endpoints

GET / — health check
POST /upload — upload multiple PDFs
POST /chat — ask a question (requires collection_name)
GET /collections — list all uploaded documents
DELETE /files/{collection_name} — delete a document and its ChromaDB collection
GET /suggestions/{collection_name} — generate 3 suggested questions

## Tech Stack

Frontend: React 19, Vite, Tailwind CSS v4, react-markdown, Axios
Backend: Python 3.11, FastAPI, Uvicorn
AI: Anthropic Claude API (claude-sonnet-4-6)
Vector DB: ChromaDB (persistent, stored at backend/chroma_db/)
Embeddings: sentence-transformers
PDF: PyMuPDF

## Commit Convention

feat: new features
fix: bug fixes
style: UI/styling changes
docs: documentation updates
refactor: code restructure

## Important Notes

- Never commit backend/.env
- Never commit backend/venv/
- Never commit backend/chroma_db/
- iCloud corrupts git repos — keep project in ~/Documents/ only
- Always check browser before committing
