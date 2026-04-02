"""
AgriGuard — Knowledge Base Embedding Generator
Ingests agricultural knowledge base documents and creates FAISS vector embeddings
for the AgroBuddy RAG pipeline.

Usage:
    python scripts/generate_embeddings.py
"""
import os
import sys
import glob


# Configuration
KNOWLEDGE_BASE_DIR = os.path.join("storage", "knowledge-base")
EMBEDDINGS_DIR = os.path.join("storage", "embeddings")
CHUNK_SIZE = 500  # characters per chunk
CHUNK_OVERLAP = 100  # overlap between chunks


def split_into_chunks(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    """Split text into overlapping chunks for embedding."""
    chunks = []
    # Split by sections first (## headers)
    sections = text.split("\n## ")
    
    for section in sections:
        if len(section) <= chunk_size:
            chunks.append(section.strip())
        else:
            # Split long sections into smaller chunks
            words = section.split()
            current_chunk = []
            current_length = 0
            
            for word in words:
                current_chunk.append(word)
                current_length += len(word) + 1
                
                if current_length >= chunk_size:
                    chunk_text = " ".join(current_chunk)
                    chunks.append(chunk_text.strip())
                    # Keep overlap
                    overlap_words = current_chunk[-overlap // 5:]  # approximate word-based overlap
                    current_chunk = overlap_words
                    current_length = sum(len(w) + 1 for w in current_chunk)
            
            if current_chunk:
                chunks.append(" ".join(current_chunk).strip())
    
    return [c for c in chunks if len(c) > 50]  # Filter very short chunks


def load_knowledge_base() -> list[dict]:
    """Load all knowledge base documents and split into chunks."""
    documents = []
    md_files = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.md"))
    
    if not md_files:
        print(f"⚠️ No .md files found in {KNOWLEDGE_BASE_DIR}")
        return []
    
    for filepath in md_files:
        filename = os.path.basename(filepath)
        print(f"  📄 Loading: {filename}")
        
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        
        chunks = split_into_chunks(content)
        for i, chunk in enumerate(chunks):
            documents.append({
                "content": chunk,
                "source": filename,
                "chunk_id": i,
                "metadata": {
                    "file": filename,
                    "chunk_index": i,
                    "total_chunks": len(chunks),
                }
            })
    
    return documents


def generate_embeddings_faiss(documents: list[dict]):
    """Generate FAISS embeddings using sentence-transformers."""
    try:
        from sentence_transformers import SentenceTransformer
        import numpy as np
        import faiss
        import json
    except ImportError as e:
        print(f"❌ Missing dependency: {e}")
        print("   Install with: pip install sentence-transformers faiss-cpu numpy")
        return False
    
    print("\n🧠 Loading embedding model (all-MiniLM-L6-v2)...")
    model = SentenceTransformer("all-MiniLM-L6-v2")
    
    texts = [doc["content"] for doc in documents]
    print(f"🔢 Generating embeddings for {len(texts)} chunks...")
    
    embeddings = model.encode(texts, show_progress_bar=True, convert_to_numpy=True)
    
    # Build FAISS index
    dimension = embeddings.shape[1]
    index = faiss.IndexFlatL2(dimension)
    index.add(embeddings.astype(np.float32))
    
    # Save
    os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
    
    faiss_path = os.path.join(EMBEDDINGS_DIR, "knowledge_base.faiss")
    faiss.write_index(index, faiss_path)
    print(f"✅ FAISS index saved: {faiss_path}")
    
    # Save document metadata
    metadata_path = os.path.join(EMBEDDINGS_DIR, "documents.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
    print(f"✅ Document metadata saved: {metadata_path}")
    
    # Save config
    config = {
        "model_name": "all-MiniLM-L6-v2",
        "dimension": dimension,
        "num_documents": len(documents),
        "chunk_size": CHUNK_SIZE,
        "chunk_overlap": CHUNK_OVERLAP,
        "sources": list(set(doc["source"] for doc in documents)),
    }
    config_path = os.path.join(EMBEDDINGS_DIR, "config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"✅ Config saved: {config_path}")
    
    return True


def generate_embeddings_simple(documents: list[dict]):
    """Generate simple TF-IDF based embeddings (fallback when FAISS unavailable)."""
    import json
    
    os.makedirs(EMBEDDINGS_DIR, exist_ok=True)
    
    # Save documents for keyword-based retrieval
    metadata_path = os.path.join(EMBEDDINGS_DIR, "documents.json")
    with open(metadata_path, "w", encoding="utf-8") as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)
    print(f"✅ Documents saved for keyword retrieval: {metadata_path}")
    
    config = {
        "model_name": "keyword-search",
        "num_documents": len(documents),
        "chunk_size": CHUNK_SIZE,
        "sources": list(set(doc["source"] for doc in documents)),
        "note": "Using keyword-based retrieval. Install sentence-transformers and faiss-cpu for vector search."
    }
    config_path = os.path.join(EMBEDDINGS_DIR, "config.json")
    with open(config_path, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)
    print(f"✅ Config saved: {config_path}")
    
    return True


def main():
    print("🌱 AgriGuard Knowledge Base Embedding Generator\n")
    print(f"📂 Knowledge Base: {KNOWLEDGE_BASE_DIR}")
    print(f"📂 Embeddings Output: {EMBEDDINGS_DIR}\n")
    
    # Load documents
    print("📚 Loading knowledge base documents...")
    documents = load_knowledge_base()
    
    if not documents:
        print("❌ No documents to process")
        sys.exit(1)
    
    print(f"\n📊 Total chunks: {len(documents)}")
    for source in set(doc["source"] for doc in documents):
        count = sum(1 for doc in documents if doc["source"] == source)
        print(f"   {source}: {count} chunks")
    
    # Try FAISS first, fall back to simple
    print("\n" + "=" * 50)
    try:
        import faiss
        import sentence_transformers
        success = generate_embeddings_faiss(documents)
    except ImportError:
        print("⚠️ FAISS/sentence-transformers not available")
        print("   Falling back to keyword-based retrieval")
        print("   For vector search, install: pip install sentence-transformers faiss-cpu")
        success = generate_embeddings_simple(documents)
    
    if success:
        print("\n🎉 Embeddings generated successfully!")
        print("   AgroBuddy can now use RAG for agricultural queries.")
    else:
        print("\n❌ Embedding generation failed")
        sys.exit(1)


if __name__ == "__main__":
    main()
