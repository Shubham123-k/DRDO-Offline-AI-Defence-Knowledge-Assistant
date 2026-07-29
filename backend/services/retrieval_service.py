from services.embedding_service import embed_query
from services.chroma_service import search_chunks
from utils.clearance import get_allowed_classifications


def retrieve_context(
    question: str,
    clearance: str,
):
    query_embedding = embed_query(question)

    allowed = get_allowed_classifications(
        clearance
    )

    results = search_chunks(
        query_embedding,
        allowed,
    )

    if not results["documents"]:
        return []

    return results["documents"][0]