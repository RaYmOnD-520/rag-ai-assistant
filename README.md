# KoDa — RAG AI Assistant v2.0

A multi-document AI knowledge base powered by Retrieval-Augmented Generation and Claude AI.

## What is KoDa?

KoDa is a full-stack RAG assistant that lets you upload multiple PDF documents and chat with them using Claude AI. It answers questions strictly from your uploaded content — no hallucination, no guessing outside the documents.

## Features

- Multi-file upload — upload and manage multiple PDFs simultaneously
- File management panel — view, switch, and delete documents from the sidebar
- Per-document chat history — each document keeps its own conversation session
- Contextual suggestions — 3 AI-generated questions after every upload
- Scoped answers — refuses to answer outside uploaded document content
- Export chat — download any conversation as a .txt file
- KoDa branding — custom AI identity with animated thinking indicator

## Tech Stack

Frontend: React 19, Vite, Tailwind CSS v4, react-markdown
Backend: FastAPI, Python 3.11, Uvicorn
AI: Anthropic Claude API claude-sonnet-4-6
Vector DB: ChromaDB
Embeddings: sentence-transformers
PDF Processing: PyMuPDF

## How to Run

Backend:
cd backend
source venv/bin/activate
uvicorn main:app --reload --port 8000

Frontend:
cd frontend
npm install
npm run dev

Then open http://localhost:5173

## API Endpoints

POST /upload — upload one or more PDF files
POST /chat — ask a question about a document
GET /collections — list all uploaded documents
DELETE /files/{collection_name} — delete a document
GET /suggestions/{collection_name} — get 3 AI-generated suggested questions

## Environment Variables

Create backend/.env with:
ANTHROPIC_API_KEY=your_key_here
