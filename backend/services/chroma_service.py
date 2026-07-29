import chromadb

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="drdo_documents"
)

def add_chunks(chunks, embeddings, metadata):
    ids = [
        f"{metadata['document_id']}_{i}"
        for i in range(len(chunks))
    ]

    metadatas = [
        metadata.copy()
        for _ in chunks
    ]

    collection.add(
        ids=ids,
        documents=chunks,
        embeddings=embeddings,
        metadatas=metadatas,
    )
    
def search_chunks(
    query_embedding,
    allowed_classifications,
    n_results=10,
):
    results = collection.query(
        query_embeddings=[query_embedding],
        n_results=n_results,
        where={
            "classification": {
                "$in": allowed_classifications
            }
        },
    )

    return results