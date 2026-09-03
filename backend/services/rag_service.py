import time

from services.retrieval_service import retrieve_documents
from services.llm_service import generate_answer


def ask_question(
    question: str,
    clearance: str,
    conversation_history: str = "",
):
    total_start = time.perf_counter()

    chunks = retrieve_documents(
        question=question,
        clearance=clearance,
        top_k=3,
    )

    retrieval_time = (
        time.perf_counter()
        - total_start
    )

    print(
        f"RAG: Retrieval completed in "
        f"{retrieval_time:.2f} seconds"
    )

    if not chunks:
        return {
            "answer": (
                "I couldn't find this information "
                "in the authorized documents."
            ),
            "sources": [],
        }

    context_parts = []

    for chunk in chunks:
        metadata = chunk.get(
            "metadata",
            {},
        )

        filename = metadata.get(
            "filename",
            "Unknown document",
        )

        classification = metadata.get(
            "classification",
            "Public",
        )

        content = chunk.get(
            "text",
            "",
        )

        context_parts.append(
            f"""Document: {filename}
Classification: {classification}

Content:
{content}"""
        )

    context = (
        "\n\n--------------------\n\n"
        .join(context_parts)
    )

    context_words = len(
        context.split()
    )

    print(
        f"RAG: Context size = "
        f"{context_words} words"
    )

    if conversation_history:

        history_words = len(
            conversation_history.split()
        )

        print(
            f"RAG: Conversation history = "
            f"{history_words} words"
        )

    llm_start = time.perf_counter()

    answer = generate_answer(
        context=context,
        question=question,
        conversation_history=conversation_history,
    )

    llm_time = (
        time.perf_counter()
        - llm_start
    )

    total_time = (
        time.perf_counter()
        - total_start
    )

    print(
        f"RAG: LLM generation completed "
        f"in {llm_time:.2f} seconds"
    )

    print(
        f"RAG: Total processing time "
        f"{total_time:.2f} seconds"
    )

    sources = []

    seen = set()

    for chunk in chunks:
        filename = chunk.get(
            "metadata",
            {},
        ).get(
            "filename",
            "Unknown document",
        )

        if filename not in seen:
            sources.append(filename)
            seen.add(filename)

    return {
        "answer": answer,
        "sources": sources,
    }