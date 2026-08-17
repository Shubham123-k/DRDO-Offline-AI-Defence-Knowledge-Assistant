import chromadb

client = chromadb.PersistentClient(
    path="chroma_db"
)

collection = client.get_or_create_collection(
    name="documents"
)


def add_chunks(
    chunks,
    embeddings,
    metadata,
):
    """
    Store page-aware chunks in ChromaDB.

    chunks:
        [
            {
                "page": 1,
                "text": "..."
            }
        ]
    """

    ids = []
    metadatas = []
    documents = []

    for index, chunk in enumerate(chunks):
        chunk_id = (
            f"{metadata['document_id']}_{index}"
        )

        item = metadata.copy()
        item["page"] = chunk["page"]
        item["chunk_index"] = index

        ids.append(chunk_id)
        metadatas.append(item)
        documents.append(
            chunk["text"]
        )

    collection.add(
        ids=ids,
        documents=documents,
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
        include=[
            "documents",
            "metadatas",
            "distances",
        ],
    )
    
    return results


def delete_document_chunks(
    document_id: int,
):
    """
    Delete all ChromaDB chunks belonging
    to a specific document.
    """

    collection.delete(
        where={
            "document_id": document_id,
        }
    )