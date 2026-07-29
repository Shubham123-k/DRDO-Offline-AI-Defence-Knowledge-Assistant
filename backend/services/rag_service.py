from services.retrieval_service import retrieve_context
from services.llm_service import generate_answer


def ask_question(
    question: str,
    clearance: str,
):

    chunks = retrieve_context(
        question,
        clearance,
    )

    if not chunks:
        return (
            "No relevant documents were found "
            "that you are authorized to access."
        )

    context = "\n\n".join(chunks)

    answer = generate_answer(
        context,
        question,
    )

    return answer