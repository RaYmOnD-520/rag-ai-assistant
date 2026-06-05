import fitz  # PyMuPDF
import chromadb
from sentence_transformers import SentenceTransformer
import os

# Load the embedding model
# This converts text into vectors (numbers representing meaning)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Connect to ChromaDB (local vector database)
client = chromadb.PersistentClient(path="./chroma_db")

def get_or_create_collection(collection_name: str):
    """Get existing collection or create a new one"""
    return client.get_or_create_collection(name=collection_name)

def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from a PDF file"""
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text()
    return text

def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list:
    """
    Split text into chunks of ~500 characters
    Overlap of 50 means each chunk shares 50 chars with the next
    This prevents losing context at chunk boundaries
    """
    chunks = []
    start = 0
    while start < len(text):
        end = start + chunk_size
        chunk = text[start:end]
        if chunk.strip():  # Only add non-empty chunks
            chunks.append(chunk)
        start = end - overlap  # Move forward with overlap
    return chunks

def ingest_document(pdf_path: str, collection_name: str) -> int:
    """
    Main function — takes a PDF and stores it in ChromaDB
    Returns the number of chunks stored
    """
    # Step 1: Extract text from PDF
    print(f"Extracting text from {pdf_path}...")
    text = extract_text_from_pdf(pdf_path)

    # Step 2: Split into chunks
    print("Chunking text...")
    chunks = chunk_text(text)
    print(f"Created {len(chunks)} chunks")

    # Step 3: Convert chunks to vectors
    print("Generating embeddings...")
    embeddings = model.encode(chunks).tolist()

    # Step 4: Store in ChromaDB
    print("Storing in ChromaDB...")
    collection = get_or_create_collection(collection_name)

    # Add chunks with unique IDs
    collection.add(
        documents=chunks,
        embeddings=embeddings,
        ids=[f"chunk_{i}" for i in range(len(chunks))]
    )

    print(f"Successfully stored {len(chunks)} chunks!")
    return len(chunks)