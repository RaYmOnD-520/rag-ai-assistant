from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import tempfile
import os
import re
import random
import chromadb
import anthropic
from dotenv import load_dotenv
from ingest import ingest_document
from query import query_document

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="RAG AI Assistant",
    description="Upload documents and chat with them using Claude AI",
    version="2.0.0"
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
async def upload_document(files: List[UploadFile] = File(...)):
    """
    Receives one or more PDF files from the frontend
    Saves them temporarily, runs ingest, then deletes the temp files
    """
    results = []

    for file in files:
        # Only allow PDF files
        if not file.filename.endswith(".pdf"):
            results.append({
                "filename": file.filename,
                "success": False,
                "error": "Only PDF files are supported"
            })
            continue

        try:
            # Save uploaded file to a temp location
            with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
                content = await file.read()
                tmp.write(content)
                tmp_path = tmp.name

            # Use filename (without .pdf) as collection name
            collection_name = re.sub(r'[^a-z0-9_]', '', file.filename.replace(".pdf", "").replace(" ", "_").lower())

            # Run ingest
            chunk_count = ingest_document(tmp_path, collection_name)

            # Delete the temp file
            os.unlink(tmp_path)

            results.append({
                "filename": file.filename,
                "success": True,
                "collection_name": collection_name,
                "chunks_stored": chunk_count,
                "message": f"Successfully processed {file.filename}"
            })

        except Exception as e:
            results.append({
                "filename": file.filename,
                "success": False,
                "error": str(e)
            })

    return {"results": results}

@app.post("/chat")
async def chat(request: QuestionRequest):
    """
    Receives a question + collection name from the frontend
    Returns Claude's answer based STRICTLY on the document context
    Enforces scoped answers — will not use outside knowledge
    """
    try:
        # Get ChromaDB client and search for relevant chunks
        client = chromadb.PersistentClient(path="./chroma_db")
        from sentence_transformers import SentenceTransformer
        model = SentenceTransformer('all-MiniLM-L6-v2')

        question_embedding = model.encode([request.question]).tolist()
        collection = client.get_or_create_collection(name=request.collection_name)
        results = collection.query(
            query_embeddings=question_embedding,
            n_results=5
        )

        context_chunks = results['documents'][0]
        context = "\n\n".join(context_chunks)

        # Build strict scoped prompt
        prompt = f"""You are a document analysis assistant. You MUST answer questions based ONLY on the provided document context below.

STRICT RULES:
1. ONLY use information from the DOCUMENT CONTEXT section below
2. If the question cannot be answered from the context, respond EXACTLY with: "I can only answer questions based on the uploaded documents. This question falls outside the available content."
3. Do NOT use any outside knowledge, training data, or general information
4. Do NOT make assumptions beyond what is explicitly stated in the context

DOCUMENT CONTEXT:
{context}

QUESTION:
{request.question}

ANSWER:"""

        # Send to Claude with scoped system instructions
        claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        message = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=1024,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        answer = message.content[0].text

        return {
            "question": request.question,
            "answer": answer,
            "chunks_used": len(context_chunks)
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/collections")
def list_collections():
    """Returns list of all uploaded documents"""
    try:
        client = chromadb.PersistentClient(path="./chroma_db")
        collections = client.list_collections()
        return {"collections": [col.name for col in collections]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/files/{collection_name}")
def delete_file(collection_name: str):
    """
    Deletes a ChromaDB collection by name
    Removes the uploaded document from the vector database
    """
    try:
        client = chromadb.PersistentClient(path="./chroma_db")
        client.delete_collection(name=collection_name)
        return {
            "message": f"Successfully deleted collection '{collection_name}'",
            "collection_name": collection_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/suggestions/{collection_name}")
def get_suggestions(collection_name: str):
    """
    Generates 3 suggested questions based on random chunks from the document
    Uses Claude AI to create contextually relevant questions
    """
    try:
        # Connect to ChromaDB and get the collection
        client = chromadb.PersistentClient(path="./chroma_db")
        collection = client.get_or_create_collection(name=collection_name)

        # Get sample chunks from the collection (limit to avoid memory issues)
        result = collection.get(limit=10)

        if not result or not result.get('documents') or len(result['documents']) == 0:
            raise HTTPException(status_code=404, detail="Collection is empty or does not exist")

        # Extract documents and take up to 3 chunks
        documents = result['documents']
        sample_size = min(3, len(documents))
        random_chunks = random.sample(documents, sample_size)

        # Combine chunks for context
        context = "\n\n".join(random_chunks)

        # Ask Claude to generate suggested questions
        claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
        prompt = f"""Based on the following document excerpts, generate exactly 3 interesting and relevant questions that a user might want to ask about this document.

The questions should:
- Be specific and answerable from the document content
- Cover different aspects or topics from the excerpts
- Be natural and conversational
- Be directly relevant to the content shown

DOCUMENT EXCERPTS:
{context}

Return ONLY a JSON array of 3 question strings, nothing else. Format: ["question 1", "question 2", "question 3"]"""

        message = claude.messages.create(
            model="claude-sonnet-4-6",
            max_tokens=512,
            messages=[
                {"role": "user", "content": prompt}
            ]
        )

        # Parse the response
        import json
        response_text = message.content[0].text.strip()

        # Extract JSON array from response
        if response_text.startswith("[") and response_text.endswith("]"):
            suggestions = json.loads(response_text)
        else:
            # Fallback parsing if Claude wrapped the response
            import re
            json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
            if json_match:
                suggestions = json.loads(json_match.group())
            else:
                raise ValueError("Could not parse suggestions from Claude response")

        return {"suggestions": suggestions[:3]}  # Ensure only 3 questions

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate suggestions: {str(e)}")