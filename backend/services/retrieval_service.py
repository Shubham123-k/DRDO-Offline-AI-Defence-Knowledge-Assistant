import time

from services.embedding_service import embed_query
from services.chroma_service import search_chunks


CLEARANCE_LEVELS = {
    "Public": 1,
    "Confidential": 2,
    "Secret": 3,
}


def get_allowed_classifications(
    clearance: str,
):
    clearance = (
        clearance or "Public"
    ).strip().title()

    user_level = CLEARANCE_LEVELS.get(
        clearance,
        1,
    )

    return [
        classification
        for classification, level
        in CLEARANCE_LEVELS.items()
        if level <= user_level
    ]


def retrieve_documents(
    question: str,
    clearance: str,
    top_k: int = 5,
):
    print(
        "RAG: Creating question embedding..."
    )

    embedding_start = time.perf_counter()

    query_embedding = embed_query(
        question
    )

    embedding_time = (
        time.perf_counter()
        - embedding_start
    )

    print(
        f"RAG: Question embedding completed "
        f"in {embedding_time:.2f} seconds"
    )

    if not query_embedding:
        print(
            "RAG: Question embedding is empty."
        )

        return []

    allowed_classifications = (
        get_allowed_classifications(
            clearance
        )
    )

    print(
        "RAG: Allowed classifications:",
        allowed_classifications,
    )

    if not allowed_classifications:
        return []

    print(
        "RAG: Searching ChromaDB..."
    )

    chroma_start = time.perf_counter()

    try:
        results = search_chunks(
            query_embedding=query_embedding,
            allowed_classifications=(
                allowed_classifications
            ),
            n_results=top_k * 2,
        )
    except Exception as error:
        chroma_time = (
            time.perf_counter()
            - chroma_start
        )

        print(
            f"RAG: ChromaDB search failed "
            f"after {chroma_time:.2f} seconds: "
            f"{error}"
        )

        raise

    chroma_time = (
        time.perf_counter()
        - chroma_start
    )

    print(
        f"RAG: ChromaDB search completed "
        f"in {chroma_time:.2f} seconds"
    )

    documents = results.get(
        "documents",
        [[]],
    )

    if (
        not documents
        or not documents[0]
    ):
        print(
            "RAG: No authorized documents found."
        )

        return []

    documents = documents[0]
    metadatas = results.get(
        "metadatas",
        [[]],
    )

    if metadatas:
        metadatas = metadatas[0]
    else:
        metadatas = []

    distances = results.get(
        "distances",
        [[]],
    )

    if distances:
        distances = distances[0]
    else:
        distances = []

    user_level = CLEARANCE_LEVELS.get(
        (
            clearance or "Public"
        ).strip().title(),
        1,
    )

    filtered = []

    for index, document in enumerate(
        documents
    ):
        metadata = {}

        if index < len(metadatas):
            metadata = (
                metadatas[index]
                or {}
            )

        classification = (
            metadata.get(
                "classification",
                "Public",
            )
        )

        classification = (
            classification
            .strip()
            .title()
        )

        document_level = (
            CLEARANCE_LEVELS.get(
                classification,
                1,
            )
        )

        if document_level > user_level:
            continue

        distance = None

        if index < len(distances):
            distance = distances[index]

        filtered.append(
            {
                "text": document,
                "metadata": metadata,
                "distance": distance,
            }
        )

        if len(filtered) >= top_k:
            break

    print(
        f"RAG: Retrieved "
        f"{len(filtered)} authorized chunks."
    )

    return filtered