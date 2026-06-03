import os
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams

def setup_qdrant():
    url = os.getenv("QDRANT_URL", "http://localhost:6333")
    client = QdrantClient(url=url)

    collection_name = "agri_knowledge"
    
    # Check if collection exists
    collections = client.get_collections().collections
    exists = any(c.name == collection_name for c in collections)
    
    if not exists:
        print(f"Creating collection: {collection_name}")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE), # Size for OpenAI embeddings
        )
        print("✅ Collection created successfully")
    else:
        print(f"Collection {collection_name} already exists")

if __name__ == "__main__":
    setup_qdrant()
