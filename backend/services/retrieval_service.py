from services.embedding_service import embed_query
from services.chroma_service import collection


CLEARANCE_LEVELS = {
    "Public": 1,
    "Confidential": 2,
    "Secret": 3,
}


def retrieve_documents(
    question: str,
    clearance: str,
    top_k: int = 5,
):
    """
    Retrieve relevant documents while respecting
    the user's clearance level.
    """

    query_embedding = embed_query(
        question
    )

    results = collection.query(
        query_embeddings=[
            query_embedding
        ],
        n_results=top_k * 3,
        include=[
            "documents",
            "metadatas",
            "distances",
        ],
    )

    filtered = []

    if not results.get("documents"):
        return filtered

    docs = results["documents"][0]
    metas = results["metadatas"][0]
    distances = results["distances"][0]

    user_level = CLEARANCE_LEVELS.get(
        clearance,
        1,
    )

    for doc, meta, distance in zip(
        docs,
        metas,
        distances,
    ):
        classification = meta.get(
            "classification",
            "Public",
        )

        document_level = CLEARANCE_LEVELS.get(
            classification,
            1,
        )

        # Clearance check
        if document_level > user_level:
            continue

        filtered.append(
            {
                "text": doc,
                "metadata": meta,
                "distance": distance,
            }
        )

        if len(filtered) >= top_k:
            break

    return filtered