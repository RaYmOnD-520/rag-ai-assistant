import chromadb
from sentence_transformers import SentenceTransformer
import anthropic
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Load the same embedding model used in ingest.py
model = SentenceTransformer('all-MiniLM-L6-v2')

# Connect to ChromaDB
client = chromadb.PersistentClient(path="./chroma_db")

# Connect to Claude API
claude = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def search_similar_chunks(question: str, collection_name: str, n_results: int = 5) -> list:
    """
    Convert question to vector and find the most similar chunks in ChromaDB
    n_results = how many chunks to retrieve (top 5 most relevant)
    """
    # Convert question to vector
    question_embedding = model.encode([question]).tolist()

    # Search ChromaDB for similar chunks
    collection = client.get_or_create_collection(name=collection_name)
    results = collection.query(
        query_embeddings=question_embedding,
        n_results=n_results
    )

    # Return the actual text chunks
    return results['documents'][0]

def ask_claude(question: str, context_chunks: list) -> str:
    """
    Send the question + relevant chunks to Claude
    Claude answers using ONLY the provided context
    """
    # Combine chunks into one context block
    context = "\n\n".join(context_chunks)

    # Build the prompt
    prompt = f"""You are a helpful assistant that answers questions based ONLY on the provided document context.
If the answer is not found in the context, say "I couldn't find that information in the document."
Do not use any outside knowledge.

DOCUMENT CONTEXT:
{context}

QUESTION:
{question}

ANSWER:"""

    # Send to Claude
    message = claude.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1024,
        messages=[
            {"role": "user", "content": prompt}
        ]
    )

    return message.content[0].text

def query_document(question: str, collection_name: str) -> dict:
    """
    Main function — takes a question and returns Claude's answer
    """
    # Step 1: Find relevant chunks
    print(f"Searching for relevant chunks for: {question}")
    chunks = search_similar_chunks(question, collection_name)

    # Step 2: Ask Claude with those chunks as context
    print("Asking Claude...")
    answer = ask_claude(question, chunks)

    return {
        "question": question,
        "answer": answer,
        "chunks_used": len(chunks)
    }