import time

from services.embedding_service import embed_query
from services.chroma_service import search_chunks


CLEARANCE_LEVELS = {
    "Public": 1,
    "Confidential": 2,
    "Secret": 3,
}


def get_allowed_classifications(clearance: str):
    clearance = (clearance or "Public").strip().title()
    user_level = CLEARANCE_LEVELS.get(clearance, 1)

    return [
        classification
        for classification, level in CLEARANCE_LEVELS.items()
        if level <= user_level
    ]


def retrieve_documents(
    question: str,
    clearance: str,
    top_k: int = 5,
    document_ids=None,
):
    print("RAG: Creating question embedding...")

    embedding_start = time.perf_counter()
    query_embedding = embed_query(question)
    embedding_time = time.perf_counter() - embedding_start

    print(
        f"RAG: Question embedding completed in {embedding_time:.2f} seconds"
    )

    if not query_embedding:
        print("RAG: Question embedding is empty.")
        return []

    allowed_classifications = get_allowed_classifications(clearance)
    print("RAG: Allowed classifications:", allowed_classifications)

    if not allowed_classifications:
        return []

    normalized_document_ids = []
    for document_id in document_ids or []:
        try:
            normalized_document_ids.append(int(document_id))
        except (TypeError, ValueError):
            continue

    if normalized_document_ids:
        print(
            "RAG: Attachment-only retrieval for document IDs:",
            normalized_document_ids,
        )
    else:
        print("RAG: Global authorized retrieval.")

    chroma_start = time.perf_counter()

    try:
        results = search_chunks(
            query_embedding=query_embedding,
            allowed_classifications=allowed_classifications,
            n_results=max(top_k * 3, top_k),
            document_ids=normalized_document_ids or None,
        )
    except Exception as error:
        chroma_time = time.perf_counter() - chroma_start
        print(
            f"RAG: ChromaDB search failed after {chroma_time:.2f} seconds: {error}"
        )
        raise

    chroma_time = time.perf_counter() - chroma_start
    print(
        f"RAG: ChromaDB search completed in {chroma_time:.2f} seconds"
    )

    documents = results.get("documents", [[]])
    if not documents or not documents[0]:
        print("RAG: No authorized documents found.")
        return []

    documents = documents[0]
    metadatas = (results.get("metadatas") or [[]])[0]
    distances = (results.get("distances") or [[]])[0]

    user_level = CLEARANCE_LEVELS.get(
        (clearance or "Public").strip().title(),
        1,
    )

    filtered = []
    requested_ids = set(normalized_document_ids)

    for index, document in enumerate(documents):
        metadata = metadatas[index] if index < len(metadatas) else {}
        metadata = metadata or {}

        classification = str(
            metadata.get("classification", "Public")
        ).strip().title()
        document_level = CLEARANCE_LEVELS.get(classification, 1)

        if document_level > user_level:
            continue

        if requested_ids:
            try:
                metadata_document_id = int(metadata.get("document_id"))
            except (TypeError, ValueError):
                continue

            if metadata_document_id not in requested_ids:
                continue

        distance = distances[index] if index < len(distances) else None

        filtered.append(
            {
                "text": document,
                "metadata": metadata,
                "distance": distance,
            }
        )

        if len(filtered) >= top_k:
            break

    print(f"RAG: Retrieved {len(filtered)} authorized chunks.")
    return filtered
