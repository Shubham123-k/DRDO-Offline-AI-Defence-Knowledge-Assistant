from pathlib import Path
import chromadb


BASE_DIR = Path(__file__).resolve().parent.parent
CHROMA_PATH = BASE_DIR / "chroma_db"

CHROMA_PATH.mkdir(
    parents=True,
    exist_ok=True,
)

client = chromadb.PersistentClient(
    path=str(CHROMA_PATH)
)

collection = client.get_or_create_collection(
    name="documents"
)


def add_chunks(
    chunks,
    embeddings,
    metadata,
):
    if not chunks:
        return

    if not embeddings:
        return

    if len(chunks) != len(embeddings):
        raise ValueError(
            "Number of chunks and embeddings must be the same."
        )

    if "document_id" not in metadata:
        raise ValueError(
            "document_id is required in metadata."
        )

    document_id = metadata["document_id"]

    ids = [
        f"{document_id}_{index}"
        for index in range(len(chunks))
    ]

    documents = [
        chunk["text"]
        if isinstance(chunk, dict)
        else str(chunk)
        for chunk in chunks
    ]

    metadatas = []

    for index, chunk in enumerate(chunks):

        item = metadata.copy()
        item["chunk_index"] = index

        # Preserve page information for page-aware RAG.
        if isinstance(chunk, dict) and "page" in chunk:
            item["page"] = int(chunk["page"])

        metadatas.append(item)

    collection.add(
        ids=ids,
        documents=documents,
        embeddings=embeddings,
        metadatas=metadatas,
    )


def delete_document_chunks(
    document_id: int,
):
    collection.delete(
        where={
            "document_id": document_id
        }
    )


def search_chunks(
    query_embedding,
    allowed_classifications,
    n_results=10,
):
    if not query_embedding:
        return {
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]],
        }

    if not allowed_classifications:
        return {
            "documents": [[]],
            "metadatas": [[]],
            "distances": [[]],
        }

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
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