from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import tempfile
import os
from ingest import ingest_document
from query import query_document

# Create FastAPI app
app = FastAPI(
    title="RAG AI Assistant",
    description="Upload documents and chat with them using Claude AI",
    version="1.0.0"
)

# CORS — allows the React frontend to talk to this backend
# Without this, the browser would block all requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model for the chat endpoint
class QuestionRequest(BaseModel):
    question: str
    collection_name: str

@app.get("/")
def root():
    """Health check — confirms the server is running"""
    return {"status": "RAG AI Assistant is running"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...)):
    """
    Receives a PDF file from the frontend
    Saves it temporarily, runs ingest, then deletes the temp file
    """
    # Only allow PDF files
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        # Save uploaded file to a temp location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name

        # Use filename (without .pdf) as collection name
        collection_name = file.filename.replace(".pdf", "").replace(" ", "_").lower()

        # Run ingest
        chunk_count = ingest_document(tmp_path, collection_name)

        # Delete the temp file
        os.unlink(tmp_path)

        return {
            "message": f"Successfully processed {file.filename}",
            "collection_name": collection_name,
            "chunks_stored": chunk_count
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
async def chat(request: QuestionRequest):
    """
    Receives a question + collection name from the frontend
    Returns Claude's answer based on the document
    """
    try:
        result = query_document(request.question, request.collection_name)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/collections")
def list_collections():
    """Returns list of all uploaded documents"""
    try:
        import chromadb
        client = chromadb.PersistentClient(path="./chroma_db")
        collections = client.list_collections()
        return {"collections": [col.name for col in collections]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))