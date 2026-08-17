from services.retrieval_service import retrieve_documents
from services.llm_service import generate_answer


def ask_question(
    question: str,
    clearance: str,
):

    chunks = retrieve_documents(
        question=question,
        clearance=clearance,
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

        distance = chunk.get(
            "distance",
            0,
        )

        text = chunk.get(
            "text",
            "",
        )

        context_parts.append(
            f"""
Document:
{filename}

Classification:
{classification}

Similarity Distance:
{round(distance, 4)}

Content:
{text}
"""
        )

    context = (
        "\n\n"
        "----------------------------------------"
        "\n\n"
    ).join(
        context_parts
    )

    answer = generate_answer(
        context=context,
        question=question,
    )

    sources = []
    seen = set()

    for chunk in chunks:

        metadata = chunk.get(
            "metadata",
            {},
        )

        filename = metadata.get(
            "filename"
        )

        if filename and filename not in seen:
            sources.append(
                filename
            )

            seen.add(
                filename
            )

    return {
        "answer": answer,
        "sources": sources,
    }