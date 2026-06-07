# RAG AI Assistant

> A sophisticated document chat application powered by Retrieval-Augmented Generation (RAG) and Claude AI

[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/downloads/)
[![React](https://img.shields.io/badge/React-19.2+-61DAFB.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.136+-009688.svg)](https://fastapi.tiangolo.com/)
[![Anthropic](https://img.shields.io/badge/Powered%20by-Claude%20AI-FF6B35.svg)](https://anthropic.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 What is RAG?

**Retrieval-Augmented Generation (RAG)** is an AI technique that combines the power of large language models with external knowledge sources. Instead of relying solely on pre-trained knowledge, RAG systems:

1. **Retrieve** relevant information from your documents
2. **Augment** the AI's context with this retrieved content  
3. **Generate** accurate, contextual responses based on your specific data

This allows you to chat with your documents as if you're talking to an expert who has read and understood all your content.

## ✨ Features

- 📄 **PDF Document Upload** - Seamlessly upload and process PDF documents
- 🔍 **Intelligent Search** - Advanced semantic search through your documents
- 💬 **Natural Language Chat** - Ask questions in plain English about your documents
- ⚡ **Real-time Responses** - Get instant, contextual answers from Claude AI
- 🎨 **Modern Dark UI** - Clean, professional interface with responsive design
- 🔒 **Secure Processing** - Local document processing with API-only AI calls
- 📊 **Progress Tracking** - Real-time upload progress and status indicators

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Axios |
| **Backend** | FastAPI, Python 3.11, Uvicorn |
| **AI** | Anthropic Claude AI, Sentence Transformers |
| **Database** | ChromaDB (Vector Database) |
| **Processing** | PyMuPDF, Scikit-learn |

## 🔄 How It Works

1. **Document Upload** - User uploads a PDF document through the web interface
2. **Text Extraction** - PyMuPDF extracts and cleans text content from the PDF
3. **Chunking** - Document is split into manageable, contextual chunks
4. **Embedding** - Each chunk is converted to vector embeddings using Sentence Transformers
5. **Storage** - Embeddings and metadata are stored in ChromaDB vector database
6. **Query Processing** - User questions are embedded and matched against document chunks
7. **Context Retrieval** - Most relevant chunks are retrieved based on semantic similarity
8. **AI Generation** - Claude AI generates responses using retrieved context
9. **Response Delivery** - Contextual answer is displayed in the chat interface

## 🚀 Getting Started

### Prerequisites

- **Python 3.11+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** - [Download Node.js](https://nodejs.org/)
- **Anthropic API Key** - [Get your API key](https://console.anthropic.com/)

### Backend Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/rag-ai-assistant.git
   cd rag-ai-assistant
   ```

2. **Set up Python virtual environment**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env and add your Anthropic API key:
   # ANTHROPIC_API_KEY=your_api_key_here
   ```

### Frontend Installation

1. **Navigate to frontend directory**
   ```bash
   cd ../frontend
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   source venv/bin/activate  # If not already activated
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Start the frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Access the application**
   - Open your browser and navigate to `http://localhost:5173`
   - The backend API will be running at `http://localhost:8000`

## 📁 Project Structure

```
rag-ai-assistant/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── ingest.py            # Document processing and embedding
│   ├── query.py             # Query processing and retrieval
│   ├── requirements.txt     # Python dependencies
│   ├── .env                 # Environment variables
│   └── chroma_db/          # Vector database storage
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── FileUpload.jsx    # File upload component
│   │   │   └── ChatInterface.jsx # Chat interface component
│   │   ├── App.jsx          # Main application component
│   │   ├── main.jsx         # React entry point
│   │   └── index.css        # Global styles
│   ├── package.json         # Node.js dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind CSS configuration
└── README.md
```

## 📊 API Endpoints

- `GET /` - Health check endpoint
- `POST /upload` - Upload and process PDF documents
- `POST /ask` - Ask questions about uploaded documents

## 🏗️ Built With

This project was developed with assistance from:
- **[Claude AI](https://anthropic.com/)** - AI-powered development assistance and the core language model
- **[Claude Code](https://claude.ai/code)** - Advanced code generation and debugging capabilities

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please open an issue on GitHub.

---

*Built with Claude AI*
