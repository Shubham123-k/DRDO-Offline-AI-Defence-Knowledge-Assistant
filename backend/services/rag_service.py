import time

from services.retrieval_service import retrieve_documents
from services.llm_service import generate_answer


def ask_question(
    question: str,
    clearance: str,
    conversation_history: str = "",
    document_ids=None,
):
    total_start = time.perf_counter()
    attachment_mode = bool(document_ids)

    chunks = retrieve_documents(
        question=question,
        clearance=clearance,
        top_k=8 if attachment_mode else 3,
        document_ids=document_ids,
    )

    retrieval_time = time.perf_counter() - total_start
    print(f"RAG: Retrieval completed in {retrieval_time:.2f} seconds")

    if not chunks:
        return {
            "answer": "I couldn't find this information in the authorized documents.",
            "sources": [],
        }

    context_parts = []

    for chunk in chunks:
        metadata = chunk.get("metadata", {})
        filename = metadata.get("filename", "Unknown document")
        classification = metadata.get("classification", "Public")
        content = chunk.get("text", "")

        context_parts.append(
            f"""Document: {filename}
Classification: {classification}

Content:
{content}"""
        )

    context = "\n\n--------------------\n\n".join(context_parts)

    if attachment_mode:
        context = (
            "IMPORTANT: The following context belongs ONLY to the file(s) "
            "explicitly attached to this user question. Do not use any other "
            "document, image, previous answer, or outside knowledge.\n\n"
            + context
        )

    print(f"RAG: Context size = {len(context.split())} words")

    if conversation_history:
        print(
            f"RAG: Conversation history = {len(conversation_history.split())} words"
        )

    llm_start = time.perf_counter()
    answer = generate_answer(
        context=context,
        question=question,
        # Attachment questions should not inherit factual content from old
        # messages. This keeps the answer grounded strictly in the attachment.
        conversation_history="" if attachment_mode else conversation_history,
    )

    print(
        f"RAG: LLM generation completed in {time.perf_counter() - llm_start:.2f} seconds"
    )
    print(
        f"RAG: Total processing time {time.perf_counter() - total_start:.2f} seconds"
    )

    sources = []
    seen = set()
    for chunk in chunks:
        filename = chunk.get("metadata", {}).get("filename", "Unknown document")
        if filename not in seen:
            sources.append(filename)
            seen.add(filename)

    return {"answer": answer, "sources": sources}
